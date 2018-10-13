# cloud-storage

A simple node module to assist in read and writing to different cloud storage providers.

## Getting Started

### Install

```
npm i @enablo/cloud-storage
```

### Example

```
const CloudStorage = require('@enablo/cloud-storage');
const { Providers: { GoogleCloudStorage, AWSS3, AzureStorage } } = CloudStorage;

// Configure one of the providers
const googleCloudStorage = new GoogleCloudStorage('project', 'bucket', 'credentials.json');
const awsS3 = new AWSS3('bucket', 'accessKeyId', 'secretAccessKey');
const azureStorage = new AzureStorage('container', 'accountName', 'accountKey');

// Create new instance with chosen provider
const cloudStorage = new CloudStorage(googleCloudStorage);

// Write and read json from storage
cloudStorage
  .writeJSON('tmp/example.json', { example: true })
  .then(() => readJSON('tmp/example.json'))
  .then(json => console.log(json))
  .catch(err => console.error(err.message));
```
