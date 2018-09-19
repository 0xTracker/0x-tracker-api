const _ = require('lodash');
const memoryCache = require('memory-cache');
const ms = require('ms');
const Router = require('koa-router');

const { TIME_PERIOD } = require('../../constants');
const getFilterForRelayer = require('../../relayers/get-filter-for-relayer');
const getNetworkMetrics = require('../../metrics/get-network-metrics');
const getTokens = require('../../tokens/get-tokens');
const getTokenVolumeMetrics = require('../../metrics/get-token-volume-metrics');

const router = new Router({ prefix: '/metrics' });

router.get('/network', async ({ request, response }, next) => {
  const period = request.query.period || TIME_PERIOD.MONTH;
  const relayerId = request.query.relayer;

  const cacheKey = `metrics.network.${period}.${relayerId || 'all'}`;
  const cachedMetrics = memoryCache.get(cacheKey);

  if (_.isArray(cachedMetrics)) {
    response.body = cachedMetrics;
    await next();
    return;
  }

  const tokens = await getTokens();
  const metrics = await getNetworkMetrics(
    period,
    tokens,
    getFilterForRelayer(relayerId),
  );

  memoryCache.put(cacheKey, metrics, ms('1 minute'));
  response.body = metrics;

  await next();
});

router.get('/token-volume', async ({ request, response }, next) => {
  const { token } = request.query;
  const period = request.query.period || TIME_PERIOD.MONTH;
  const cacheKey = `metrics.volume.${token}.${period}`;
  const cachedMetrics = memoryCache.get(cacheKey);

  if (_.isArray(cachedMetrics)) {
    response.body = cachedMetrics;
    await next();
    return;
  }

  const metrics = await getTokenVolumeMetrics(token, period);

  memoryCache.put(cacheKey, metrics, ms('1 minute'));
  response.body = metrics;

  await next();
});

module.exports = router;
