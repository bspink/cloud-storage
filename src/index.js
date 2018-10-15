const { ConfigurationError } = require('./errors');
const Providers = require('./providers');

class CloudStorage {
  constructor(provider) {
    if (!provider) throw new ConfigurationError('Provider and options are required.');
    this.provider = provider;
  }

  uploadFromUrl(url, path) {
    return this.provider.uploadFromUrl(url, path);
  }

  read(path) {
    return this.provider.read(path);
  }

  write(path, content) {
    return this.provider.write(path, content);
  }

  readSteam(path) {
    return this.provider.readStream(path);
  }

  writeStream(path, stream) {
    return this.provider.writeStream(path, stream);
  }

  readJSON(path) {
    return this.read(path)
      .then(data => JSON.parse(data));
  }

  writeJSON(path, json) {
    return this.write(path, JSON.stringify(json, null, 2));
  }
}

CloudStorage.Providers = Providers;

module.exports = CloudStorage;
