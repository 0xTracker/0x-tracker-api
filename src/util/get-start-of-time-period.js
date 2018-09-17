const moment = require('moment');

const { GENESIS_DATE, TIME_PERIOD } = require('../constants');

const getStartOfTimePeriod = (timePeriod, endDate) => {
  if (timePeriod === TIME_PERIOD.ALL) {
    return GENESIS_DATE;
  }

  switch (timePeriod) {
    case TIME_PERIOD.DAY:
      return moment(endDate)
        .subtract(1, 'days')
        .toDate();
    case TIME_PERIOD.WEEK:
      return moment(endDate)
        .subtract(1, 'weeks')
        .toDate();
    case TIME_PERIOD.MONTH:
      return moment(endDate)
        .subtract(1, 'months')
        .toDate();
    case TIME_PERIOD.YEAR:
      return moment(endDate)
        .subtract(1, 'years')
        .toDate();
    default:
      throw new Error(`Invalid time period: ${timePeriod}`);
  }
};

module.exports = getStartOfTimePeriod;
