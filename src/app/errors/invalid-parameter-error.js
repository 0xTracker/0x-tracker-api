class InvalidParameterError extends Error {
  constructor(reason, ...args) {
    super(...args);
    Error.captureStackTrace(this, InvalidParameterError);
    this.reason = reason;
    this.status = 400;
    this.code = 'INVALID_PARAMETER';
    this.message = args[0]; // eslint-disable-line prefer-destructuring
    this.handled = true;
  }
}

module.exports = InvalidParameterError;
