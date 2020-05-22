const _ = require('lodash');
const moment = require('moment');

const getDatesForTimePeriod = require('../util/get-dates-for-time-period');

const getTimePeriodAsDuration = timePeriod => {
  const { dateFrom, dateTo } = getDatesForTimePeriod(timePeriod);
  const diff = moment.utc(dateTo).diff(dateFrom);

  return moment.duration(
    _.isPlainObject(timePeriod) ? diff + 1 : diff,
    'milliseconds',
  );
};

module.exports = getTimePeriodAsDuration;
