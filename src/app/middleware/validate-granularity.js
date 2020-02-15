const _ = require('lodash');

const { GRANULARITY, TIME_PERIOD } = require('../../constants');
const InvalidParameterError = require('../errors/invalid-parameter-error');

const VALID_VALUES_BY_PERIOD = {
  [TIME_PERIOD.DAY]: [GRANULARITY.HOUR],
  [TIME_PERIOD.WEEK]: [GRANULARITY.HOUR, GRANULARITY.DAY],
  [TIME_PERIOD.MONTH]: [GRANULARITY.DAY],
  [TIME_PERIOD.YEAR]: [GRANULARITY.DAY, GRANULARITY.WEEK, GRANULARITY.MONTH],
  [TIME_PERIOD.ALL]: [GRANULARITY.WEEK, GRANULARITY.MONTH],
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
