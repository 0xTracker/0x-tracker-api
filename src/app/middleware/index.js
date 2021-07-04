const apps = require('./apps');
const cacheControl = require('./cache-control');
const cors = require('./cors');
const enumMiddleware = require('./enum');
const error = require('./error');
const invalidUrl = require('./invalid-url');
const limit = require('./limit');
const metricGranularity = require('./metric-granularity');
const number = require('./number');
const pagination = require('./pagination');
const timePeriod = require('./time-period');
const token = require('./token');
const trader = require('./trader');

module.exports = {
  apps,
  cacheControl,
  cors,
  enum: enumMiddleware,
  error,
  invalidUrl,
  limit,
  metricGranularity,
  number,
  pagination,
  timePeriod,
  token,
  trader,
};
