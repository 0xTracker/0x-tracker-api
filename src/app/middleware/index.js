const cacheControl = require('./cache-control');
const cors = require('./cors');
const enumMiddleware = require('./enum');
const error = require('./error');
const invalidUrl = require('./invalid-url');
const limit = require('./limit');
const metricGranularity = require('./metric-granularity');
const pagination = require('./pagination');
const timePeriod = require('./time-period');

module.exports = {
  cacheControl,
  cors,
  enum: enumMiddleware,
  error,
  invalidUrl,
  limit,
  metricGranularity,
  pagination,
  timePeriod,
};
