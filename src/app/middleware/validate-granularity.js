const _ = require('lodash');

const { TIME_PERIOD } = require('../../constants');
const InvalidParameterError = require('../errors/invalid-parameter-error');

const VALID_VALUES_BY_PERIOD = {
  [TIME_PERIOD.DAY]: ['hour'],
  [TIME_PERIOD.WEEK]: ['hour', 'day'],
  [TIME_PERIOD.MONTH]: ['day'],
  [TIME_PERIOD.YEAR]: ['day', 'week', 'month'],
  [TIME_PERIOD.ALL]: ['week', 'month', 'year'],
};

const createMiddleware = paramNames => async (context, next) => {
  const { request } = context;

  const period = _.get(request, `query.${paramNames.period}`);
  const granularity = _.get(request, `query.${paramNames.granularity}`);

  if (granularity === undefined) {
    await next();
    return;
  }

  const validValues = VALID_VALUES_BY_PERIOD[period];

  if (!validValues.includes(granularity)) {
    throw new InvalidParameterError(
      `Must be one of: ${validValues.join(', ')}`,
      `Invalid ${paramNames.granularity} parameter: ${granularity}`,
    );
  }

  await next();
};

module.exports = createMiddleware;
