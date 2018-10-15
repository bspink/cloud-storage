const azureStorage = require('azure-storage');
const { Storage } = require('@google-cloud/storage');
const AWS = require('aws-sdk');
const { https } = require('follow-redirects');
const { readFileSync } = require('fs');

class GoogleCloudStorage {
  constructor(projectId, bucket, credentials) {
    const storage = new Storage({
      projectId,
      credentials: JSON.parse(readFileSync(credentials, 'utf8')),
    });

    this.bucket = storage.bucket(bucket);
  }

  uploadFromUrl(url, path) {
    const fileStream = this.bucket.file(path).createWriteStream();

    return new Promise((resolve, reject) => {
      https.get(url, (response) => {
        response.pipe(fileStream);
        fileStream.on('finish', () => resolve());
      })
        .on('error', err => reject(err));
    });
  }

  read(path) {
    return this.bucket.file(path).download()
      .then(([file]) => file.toString('utf8'));
  }

  write(path, content) {
    return this.bucket.file(path).save(content);
  }

  writeStream(path, stream) {
    return new Promise((resolve, reject) => {
      stream
        .pipe(this.bucket.file(path).createWriteStream())
        .on('error', err => reject(err))
        .on('finish', () => resolve());
    });
  }

  readStream(path) {
    return Promise.resolve(this.bucket.file(path).createReadStream());
  }
}

class AWSS3 {
  constructor(bucket, accessKeyId, secretAccessKey) {
    this.s3 = new AWS.S3({
      accessKeyId,
      secretAccessKey,
      params: { Bucket: bucket },
    });
  }

  uploadFromUrl(url, path) {
    return new Promise((resolve, reject) => {
      https.get(url, (response) => {
        this.s3.upload({ Key: path, Body: response })
          .send((err) => {
            if (err) return reject(err);
            return resolve();
          });
      })
        .on('error', err => reject(err));
    });
  }

  read(path) {
    return new Promise((resolve, reject) => {
      this.s3.getObject({ Key: path }, (err, data) => {
        if (err) return reject(err);
        return resolve(data.Body.toString('utf8'));
      });
    });
  }

  write(path, content) {
    return new Promise((resolve, reject) => {
      this.s3.putObject({ Body: content, Key: path }, (err, data) => {
        if (err) return reject(err);
        return resolve(data);
      });
    });
  }

  writeStream(path, stream) {
    return new Promise((resolve, reject) => {
      this.s3.upload({ Body: stream, Key: path }).send((err) => {
        if (err) return reject(err);
        return resolve();
      });
    });
  }

  readStream(path) {
    return Promise.resolve(this.s3.getObject({ Key: path }).createReadStream());
  }
}

class AzureStorage {
  constructor(container, accountName, accountKey) {
    this.blobService = (accountName && accountKey)
      ? azureStorage.createBlobService(accountName, accountKey)
      : azureStorage.createBlobService();

    this.container = container;
  }

  uploadFromUrl(url, path) {
    const blobStream = this.blobService.createWriteStreamToBlockBlob(this.container, path);

    return new Promise((resolve, reject) => {
      https.get(url, (response) => {
        response.pipe(blobStream);
        blobStream.on('finish', () => resolve());
      })
        .on('error', err => reject(err));
    });
  }

  read(path) {
    return new Promise((resolve, reject) => {
      this.blobService.getBlobToText(this.container, path, (err, text) => {
        if (err) return reject(err);
        return resolve(text);
      });
    });
  }

  write(path, content) {
    return new Promise((resolve, reject) => {
      this.blobService.createBlockBlobFromText(this.container, path, content, (err, resp) => {
        if (err) return reject(err);
        return resolve(resp);
      });
    });
  }

  writeStream(path, stream) {
    return new Promise((resolve, reject) => {
      stream
        .pipe(this.blobService.createWriteStreamToBlockBlob(this.container, path))
        .on('error', err => reject(err))
        .on('finish', () => resolve());
    });
  }

  readStream(path) {
    return Promise.resolve(this.blobService.createReadStream(this.container, path));
  }
}

module.exports = {
  GoogleCloudStorage,
  AWSS3,
  AzureStorage,
};
