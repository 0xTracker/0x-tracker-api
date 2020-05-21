const _ = require('lodash');

const InvalidParameterError = require('../errors/invalid-parameter-error');

const parseNumber = numberString => {
  if (
    numberString === undefined ||
    numberString === null ||
    numberString.trim().length === 0
  ) {
    return undefined;
  }

  return _.toNumber(numberString);
};

const createMiddleware = (paramName, defaultValue) => async (context, next) => {
  const { request } = context;

  const value = parseNumber(_.get(request, `query.${paramName}`, defaultValue));

  if (value !== undefined && !_.isFinite(value)) {
    throw new InvalidParameterError(
      'Must be a valid number',
      `Invalid ${paramName} parameter: ${value}`,
    );
  }

  _.set(context, ['params', paramName], value);

  await next();
};

module.exports = createMiddleware;
