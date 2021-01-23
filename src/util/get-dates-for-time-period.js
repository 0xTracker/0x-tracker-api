const _ = require('lodash');
const moment = require('moment');

const { GENESIS_DATE, TIME_PERIOD } = require('../constants');

const getStartDate = (timePeriod, endDate) => {
  if (timePeriod === TIME_PERIOD.ALL) {
    return GENESIS_DATE;
  }

  const endMoment = moment.utc(endDate);

  switch (timePeriod) {
    case TIME_PERIOD.DAY:
      return endMoment.subtract(24, 'hours').toDate();
    case TIME_PERIOD.WEEK:
      return endMoment
        .subtract(6, 'days')
        .startOf('day')
        .toDate();
    case TIME_PERIOD.MONTH:
      return endMoment
        .subtract(29, 'days')
        .startOf('day')
        .toDate();
    case TIME_PERIOD.YEAR:
      return endMoment
        .subtract(364, 'days')
        .startOf('day')
        .toDate();
    default:
      throw new Error(`Invalid time period: ${timePeriod}`);
  }
};

const getDatesForTimePeriod = period => {
  if (_.isPlainObject(period)) {
    return {
      dateFrom: period.from || GENESIS_DATE,
      dateTo:
        period.to ||
        moment()
          .utc()
          .endOf('day')
          .toDate(),
    };
  }

  const endDate = moment
    .utc()
    .endOf('day')
    .toDate();
  const startDate = getStartDate(period, endDate);

  return { dateFrom: startDate, dateTo: endDate };
};

module.exports = getDatesForTimePeriod;
