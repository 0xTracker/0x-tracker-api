const { TIME_PERIOD } = require('../constants');

const mapPeriodForAppStatsCollection = period => {
  switch (period) {
    case TIME_PERIOD.DAY:
      return '1d';
    case TIME_PERIOD.WEEK:
      return '7d';
    case TIME_PERIOD.MONTH:
      return '30d';
    case TIME_PERIOD.YEAR:
      return '365d';
    case TIME_PERIOD.ALL:
      return 'all-time';
    default:
      throw new Error(`Unsupported time period: ${period}`);
  }
};

module.exports = mapPeriodForAppStatsCollection;
