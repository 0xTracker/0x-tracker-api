const { METRIC_INTERVAL, TIME_PERIOD } = require('../constants');

const getIntervalForTimePeriod = timePeriod => {
  switch (timePeriod) {
    case TIME_PERIOD.DAY:
    case TIME_PERIOD.WEEK:
      return METRIC_INTERVAL.HOUR;
    case TIME_PERIOD.MONTH:
    case TIME_PERIOD.YEAR:
    case TIME_PERIOD.ALL:
      return METRIC_INTERVAL.DAY;
    default:
      throw new Error(`Invalid time period: ${timePeriod}`);
  }
};

module.exports = getIntervalForTimePeriod;
