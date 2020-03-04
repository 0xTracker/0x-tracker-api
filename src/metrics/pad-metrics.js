const moment = require('moment');

const getDatesForMetrics = require('../util/get-dates-for-metrics');

const metricMatchesDate = date => metric => {
  return moment.utc(metric.date).isSame(date);
};

function padMetrics(metrics, timePeriod, granularity, defaults) {
  const { dateFrom, dateTo } = getDatesForMetrics(timePeriod, granularity);

  const roundingGranularity = granularity === 'week' ? 'isoWeek' : granularity;
  const roundedDateFrom = moment.utc(dateFrom).startOf(roundingGranularity);
  const roundedDateTo = moment.utc(dateTo).startOf(roundingGranularity);

  const paddedMetrics = [];
  let currentDate = roundedDateFrom;

  while (currentDate <= roundedDateTo) {
    const matcher = metricMatchesDate(currentDate);
    const metric = metrics.find(matcher);

    if (metric !== undefined) {
      paddedMetrics.push(metric);
    } else {
      paddedMetrics.push({ ...defaults, date: currentDate });
    }

    currentDate = moment
      .utc(currentDate)
      .add(1, granularity)
      .toDate();
  }

  return paddedMetrics;
}

module.exports = padMetrics;
