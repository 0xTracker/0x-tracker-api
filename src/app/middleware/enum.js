const _ = require('lodash');

const InvalidParameterError = require('../errors/invalid-parameter-error');

const createMiddleware = (paramName, validValues, defaultValue) => async (
  context,
  next,
) => {
  const { request } = context;

  const value = _.get(request, `query.${paramName}`, defaultValue);

  if (value !== undefined && !validValues.includes(value)) {
    throw new InvalidParameterError(
      `Must be one of: ${validValues.join(', ')}`,
      `Invalid ${paramName} parameter: ${value}`,
    );
  }

  _.set(context, ['params', paramName], value);

  await next();
};

module.exports = createMiddleware;
