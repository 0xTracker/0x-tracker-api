const _ = require('lodash');

const { TIME_PERIOD } = require('../../constants');
const InvalidParameterError = require('../errors/invalid-parameter-error');

const createMiddleware = (paramName, defaultValue) => async (context, next) => {
  const { request } = context;

  const period = _.get(request, `query.${paramName}`, defaultValue);
  const validValues = _.values(TIME_PERIOD);

  if (period !== undefined && !validValues.includes(period)) {
    throw new InvalidParameterError(
      `Must be one of: ${validValues.join(', ')}`,
      `Invalid ${paramName} parameter: ${period}`,
    );
  }

  _.set(context, ['params', paramName], period);

  await next();
};

module.exports = createMiddleware;
