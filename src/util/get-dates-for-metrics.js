const _ = require('lodash');
const moment = require('moment');

const { GENESIS_DATE, TIME_PERIOD } = require('../constants');

const getStartDate = (timePeriod, endDate, granularity) => {
  if (timePeriod === TIME_PERIOD.ALL) {
    return GENESIS_DATE;
  }

  const endMoment = moment.utc(endDate);

  if (timePeriod === TIME_PERIOD.DAY) {
    return endMoment
      .subtract(23, 'hours')
      .startOf('hour')
      .toDate();
  }

  if (timePeriod === TIME_PERIOD.WEEK && granularity === 'hour') {
    return endMoment
      .subtract(167, 'hours')
      .startOf('hour')
      .toDate();
  }

  if (timePeriod === TIME_PERIOD.WEEK && granularity === 'day') {
    return endMoment
      .subtract(6, 'days')
      .startOf('day')
      .toDate();
  }

  if (timePeriod === TIME_PERIOD.MONTH) {
    return endMoment
      .subtract(29, 'days')
      .startOf('day')
      .toDate();
  }

  if (timePeriod === TIME_PERIOD.YEAR && granularity === 'day') {
    return endMoment
      .subtract(364, 'days')
      .startOf('day')
      .toDate();
  }

  if (timePeriod === TIME_PERIOD.YEAR && granularity === 'week') {
    return endMoment
      .subtract(51, 'weeks')
      .startOf('isoWeek')
      .toDate();
  }

  if (timePeriod === TIME_PERIOD.YEAR && granularity === 'month') {
    return endMoment
      .subtract(11, 'months')
      .startOf('month')
      .toDate();
  }

  throw new Error(
    `Unsupported time period & granularity combination: ${timePeriod} & ${granularity}`,
  );
};

const getDatesForMetrics = (period, granularity) => {
  if (_.isPlainObject(period)) {
    return { dateFrom: period.from, dateTo: period.to };
  }

  const endDate = moment.utc().toDate();
  const startDate = getStartDate(period, endDate, granularity);

  return { dateFrom: startDate, dateTo: endDate };
};

module.exports = getDatesForMetrics;
