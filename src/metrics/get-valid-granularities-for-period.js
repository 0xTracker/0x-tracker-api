const moment = require('moment');

const { GRANULARITY } = require('../constants');
const getTimePeriodAsDuration = require('../util/get-time-period-as-duration');

const getValidGranularitiesForPeriod = period => {
  const duration = getTimePeriodAsDuration(period);

  if (duration <= moment.duration(24, 'hours')) {
    return [GRANULARITY.HOUR];
  }

  if (duration <= moment.duration(31, 'days')) {
    return [GRANULARITY.HOUR, GRANULARITY.DAY];
  }

  return [GRANULARITY.DAY, GRANULARITY.WEEK, GRANULARITY.MONTH];
};

module.exports = getValidGranularitiesForPeriod;
