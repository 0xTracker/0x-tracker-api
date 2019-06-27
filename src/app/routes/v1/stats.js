const Router = require('koa-router');

const { TIME_PERIOD } = require('../../../constants');
const getDatesForTimePeriod = require('../../../util/get-dates-for-time-period');
const compute24HourNetworkStats = require('../../../stats/compute-24-hour-network-stats');
const computeNetworkStatsForDates = require('../../../stats/compute-network-stats-for-dates');
const getRelayerLookupId = require('../../../relayers/get-relayer-lookup-id');
const getTokenStats = require('../../../stats/get-token-stats');

const createRouter = () => {
  const router = new Router({ prefix: '/stats' });

  router.get('/tokens', async ({ request, response }, next) => {
    const period = request.query.period || TIME_PERIOD.DAY;
    const relayerId = request.query.relayer;
    const { dateFrom, dateTo } = getDatesForTimePeriod(period);
    const relayerLookupId = await getRelayerLookupId(relayerId);
    const stats = await getTokenStats(dateFrom, dateTo, {
      relayerId: relayerLookupId,
    });

    response.body = stats;

    await next();
  });

  router.get('/network', async ({ request, response }, next) => {
    const period = request.query.period || TIME_PERIOD.DAY;
    const { dateFrom, dateTo } = getDatesForTimePeriod(period);
    const stats =
      period === TIME_PERIOD.DAY
        ? await compute24HourNetworkStats()
        : await computeNetworkStatsForDates(dateFrom, dateTo);

    response.body = {
      fees: stats.fees,
      fills: stats.fillCount,
      volume: stats.fillVolume,
    };

    await next();
  });

  router.get('/relayer', async ({ request, response }, next) => {
    const period = request.query.period || TIME_PERIOD.DAY;
    const { dateFrom, dateTo } = getDatesForTimePeriod(period);
    const stats =
      period === TIME_PERIOD.DAY
        ? await compute24HourNetworkStats()
        : await computeNetworkStatsForDates(dateFrom, dateTo);

    response.body = {
      trades: stats.tradeCount,
      tradeVolume: stats.tradeVolume,
    };

    await next();
  });

  return router;
};

module.exports = createRouter;
