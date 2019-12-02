class MissingParameterError extends Error {
  constructor(paramName, ...args) {
    super(...args);
    Error.captureStackTrace(this, MissingParameterError);
    this.reason = `Parameter must be provided`;
    this.status = 400;
    this.code = 'MISSING_PARAMETER';
    this.message = `Missing query parameter: ${paramName}`; // eslint-disable-line prefer-destructuring
    this.handled = true;
  }
}

module.exports = MissingParameterError;
