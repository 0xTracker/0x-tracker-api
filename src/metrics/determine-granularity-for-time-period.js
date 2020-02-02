const { GRANULARITY, TIME_PERIOD } = require('../constants');

const determineGranularityForTimePeriod = timePeriod => {
  switch (timePeriod) {
    case TIME_PERIOD.DAY:
    case TIME_PERIOD.WEEK:
      return GRANULARITY.HOUR;
    case TIME_PERIOD.MONTH:
    case TIME_PERIOD.YEAR:
    case TIME_PERIOD.ALL:
      return GRANULARITY.DAY;
    default:
      throw new Error(`Invalid time period: ${timePeriod}`);
  }
};

module.exports = determineGranularityForTimePeriod;
