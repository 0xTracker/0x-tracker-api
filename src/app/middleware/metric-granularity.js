const _ = require('lodash');

const getDefaultGranularityForPeriod = require('../../metrics/get-default-granularity-for-period');
const getValidGranularitiesForPeriod = require('../../metrics/get-valid-granularities-for-period');
const InvalidParameterError = require('../errors/invalid-parameter-error');

const createMiddleware = paramNames => async (context, next) => {
  const { params, request } = context;

  const period = _.get(params, paramNames.period);
  const granularity = _.get(request, `query.${paramNames.granularity}`);

  if (granularity === undefined) {
    const defaultGranularity = getDefaultGranularityForPeriod(period);

    _.set(context, ['params', paramNames.granularity], defaultGranularity);

    await next();
    return;
  }

  const validValues = getValidGranularitiesForPeriod(period);

  if (!validValues.includes(granularity)) {
    throw new InvalidParameterError(
      `Must be one of: ${validValues.join(', ')}`,
      `Invalid ${paramNames.granularity} parameter: ${granularity}`,
    );
  }

  _.set(context, ['params', paramNames.granularity], granularity);

  await next();
};

module.exports = createMiddleware;
