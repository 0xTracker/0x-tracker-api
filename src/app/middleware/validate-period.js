const _ = require('lodash');

const { TIME_PERIOD } = require('../../constants');
const InvalidParameterError = require('../errors/invalid-parameter-error');

const createMiddleware = paramName => async (context, next) => {
  const { request } = context;

  const period = _.get(request, `query.${paramName}`);
  const validValues = _.values(TIME_PERIOD);

  if (period !== undefined && !validValues.includes(period)) {
    throw new InvalidParameterError(
      `Must be one of: ${validValues.join(', ')}`,
      `Invalid ${paramName} parameter: ${period}`,
    );
  }

  await next();
};

module.exports = createMiddleware;
