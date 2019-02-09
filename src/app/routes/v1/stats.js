const _ = require('lodash');
const memoryCache = require('memory-cache');
const ms = require('ms');
const Router = require('koa-router');

const { TIME_PERIOD } = require('../../../constants');
const getDatesForTimePeriod = require('../../../util/get-dates-for-time-period');
const getFilterForRelayer = require('../../../relayers/get-filter-for-relayer');
const getNetworkStats = require('../../../stats/get-network-stats');
const getRelayerStats = require('../../../stats/get-relayer-stats');
const getTokenStats = require('../../../stats/get-token-stats');

const createRouter = () => {
  const router = new Router({ prefix: '/stats' });

  router.get('/tokens', async ({ request, response }, next) => {
    const period = request.query.period || TIME_PERIOD.DAY;
    const relayerId = request.query.relayer;
    const cacheKey = `stats.tokens.${period}.${relayerId || 'all'}`;
    const cachedStats = memoryCache.get(cacheKey);

    if (_.isPlainObject(cachedStats)) {
      response.body = cachedStats;
      await next();
      return;
    }

    const { dateFrom, dateTo } = getDatesForTimePeriod(period);
    const stats = await getTokenStats(dateFrom, dateTo, {
      ...getFilterForRelayer(relayerId),
    });

    memoryCache.put(cacheKey, stats, ms('1 minute'));
    response.body = stats;

    await next();
  });

  router.get('/relayers', async ({ request, response }, next) => {
    const period = request.query.period || TIME_PERIOD.DAY;
    const cacheKey = `stats.relayers.${period}`;
    const cachedStats = memoryCache.get(cacheKey);

    if (_.isPlainObject(cachedStats)) {
      response.body = cachedStats;
      await next();
      return;
    }

    const { dateFrom, dateTo } = getDatesForTimePeriod(period);
    const stats = await getRelayerStats(dateFrom, dateTo);

    memoryCache.put(cacheKey, stats, ms('1 minute'));
    response.body = stats;

    await next();
  });

  router.get('/network', async ({ request, response }, next) => {
    const period = request.query.period || TIME_PERIOD.DAY;
    const cacheKey = `stats.network.${period}`;
    const cachedStats = memoryCache.get(cacheKey);

    if (_.isPlainObject(cachedStats)) {
      response.body = cachedStats;
      await next();
      return;
    }

    const { dateFrom, dateTo } = getDatesForTimePeriod(period);
    const stats = await getNetworkStats(dateFrom, dateTo);

    memoryCache.put(cacheKey, stats, ms('1 minute'));
    response.body = stats;

    await next();
  });

  return router;
};

module.exports = createRouter;
