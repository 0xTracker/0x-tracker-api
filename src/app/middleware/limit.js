const _ = require('lodash');
const InvalidParameterError = require('../errors/invalid-parameter-error');

const validateNumber = (param, number, max) => {
  if (!_.isFinite(number)) {
    throw new InvalidParameterError(
      'Must be a valid number',
      `Invalid query parameter: ${param}`,
    );
  }

  if (number < 1) {
    throw new InvalidParameterError(
      'Must be greater than zero',
      `Invalid query parameter: ${param}`,
    );
  }

  if (number > max) {
    throw new InvalidParameterError(
      `Must be ${max} or less`,
      `Invalid query parameter: ${param}`,
    );
  }
};

const createMiddleware = (maxValue, defaultValue) => async (context, next) => {
  const { request } = context;

  const queryLimit = _.toNumber(_.get(request, 'query.limit', defaultValue));

  validateNumber('limit', queryLimit, maxValue);

  const value = _.clamp(queryLimit, 1, maxValue);

  _.set(context, ['params', 'limit'], value);

  await next();
};

module.exports = createMiddleware;
