const moment = require('moment');

const { GRANULARITY } = require('../constants');
const getDatesForTimePeriod = require('../util/get-dates-for-time-period');

const convertPeriodToDuration = period => {
  const { dateFrom, dateTo } = getDatesForTimePeriod(period);

  const diff = moment.utc(dateTo).diff(dateFrom);

  return moment.duration(diff, 'milliseconds');
};

const determineGranularityForTimePeriod = timePeriod => {
  const duration = convertPeriodToDuration(timePeriod);

  if (duration < moment.duration(30, 'days')) {
    return GRANULARITY.HOUR;
  }

  if (duration <= moment.duration(365, 'days')) {
    return GRANULARITY.DAY;
  }

  return GRANULARITY.WEEK;
};

module.exports = determineGranularityForTimePeriod;
