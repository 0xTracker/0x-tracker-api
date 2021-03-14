const moment = require('moment');

const { GRANULARITY } = require('../constants');
const getTimePeriodAsDuration = require('../util/get-time-period-as-duration');

const getGranularityForSparkline = timePeriod => {
  const duration = getTimePeriodAsDuration(timePeriod);

  if (duration <= moment.duration(7, 'days')) {
    return GRANULARITY.HOUR;
  }

  if (duration <= moment.duration(31, 'days')) {
    return GRANULARITY.DAY;
  }

  return GRANULARITY.WEEK;
};

module.exports = getGranularityForSparkline;
