const getStartOfTimePeriod = require('./get-start-of-time-period');

const getDatesForTimePeriod = (period, endDate = new Date()) => {
  const startDate = getStartOfTimePeriod(period, endDate);

  return { dateFrom: startDate, dateTo: endDate };
};

module.exports = getDatesForTimePeriod;
