const cacheControl = require('./cache-control');
const cors = require('./cors');
const error = require('./error');
const invalidUrl = require('./invalid-url');
const metricGranularity = require('./metric-granularity');
const pagination = require('./pagination');
const timePeriod = require('./time-period');

module.exports = {
  cacheControl,
  cors,
  error,
  invalidUrl,
  metricGranularity,
  pagination,
  timePeriod,
};
