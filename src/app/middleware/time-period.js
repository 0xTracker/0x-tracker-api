const _ = require('lodash');
const moment = require('moment');

const { TIME_PERIOD } = require('../../constants');
const InvalidParameterError = require('../errors/invalid-parameter-error');

const validValues = _.values(TIME_PERIOD);

const normalizeDateParam = dateString => {
  if (
    dateString === undefined ||
    dateString === null ||
    dateString.trim().length === 0
  ) {
    return undefined;
  }

  return moment.utc(dateString, 'YYYY-MM-DD').toDate();
};

const normalizeStringParam = param => {
  if (param === undefined || param === null) {
    return undefined;
  }

  if (param.trim().length === 0) {
    return undefined;
  }

  return param;
};

const createMiddleware = (paramName, defaultValue, options) => async (
  context,
  next,
) => {
  const { request } = context;

  const { allowCustom } = _.defaults({}, options, {
    allowCustom: false,
  });

  const rawPeriod = request.query[paramName];
  const rawPeriodFrom = request.query[`${paramName}From`];
  const rawPeriodTo = request.query[`${paramName}To`];

  const period = normalizeStringParam(rawPeriod);
  const periodFrom = normalizeDateParam(rawPeriodFrom);
  const periodTo = normalizeDateParam(rawPeriodTo);

  if (period !== undefined) {
    if (!validValues.includes(period)) {
      throw new InvalidParameterError(
        `Must be one of: ${validValues.join(', ')}`,
        `Invalid ${paramName} parameter: ${period}`,
      );
    }

    _.set(context, ['params', paramName], period);
    await next();
    return;
  }

  if (periodFrom !== undefined || periodTo !== undefined) {
    if (periodFrom !== undefined && !allowCustom) {
      throw new InvalidParameterError(
        'Custom time periods are not allowed for this endpoint',
        `Invalid ${paramName}From parameter: ${rawPeriodFrom}`,
      );
    }

    if (periodTo !== undefined && !allowCustom) {
      throw new InvalidParameterError(
        'Custom time periods are not allowed for this endpoint',
        `Invalid ${paramName}To parameter: ${request.query[`${paramName}To`]}`,
      );
    }

    if (
      periodFrom !== undefined &&
      periodTo !== undefined &&
      periodFrom > periodTo
    ) {
      throw new InvalidParameterError(
        `Must be less than or equal to ${paramName}To parameter`,
        `Invalid ${paramName}From parameter: ${rawPeriodFrom}`,
      );
    }

    _.set(context, ['params', paramName], {
      from: periodFrom
        ? moment
            .utc(periodFrom)
            .startOf('day')
            .toDate()
        : undefined,
      to: periodTo
        ? moment
            .utc(periodTo)
            .endOf('day')
            .toDate()
        : undefined,
    });
    await next();
    return;
  }

  _.set(context, ['params', paramName], defaultValue);
  await next();
};

module.exports = createMiddleware;
