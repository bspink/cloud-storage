class ConfigurationError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

class NotYetImplementedError extends Error {
  constructor() {
    super('Function not yet implemented.');
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = {
  ConfigurationError,
  NotYetImplementedError,
};
