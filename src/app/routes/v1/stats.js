const Router = require('koa-router');

const { TIME_PERIOD } = require('../../../constants');
const getDatesForTimePeriod = require('../../../util/get-dates-for-time-period');
const computeNetworkStatsForDates = require('../../../stats/compute-network-stats-for-dates');
const computeTraderStatsForDates = require('../../../stats/compute-trader-stats-for-dates');
const getAssetBridgingStatsForPeriod = require('../../../asset-bridges/get-asset-bridging-stats-for-period');
const middleware = require('../../middleware');

const createRouter = () => {
  const router = new Router({ prefix: '/stats' });

  router.get(
    '/network',
    middleware.timePeriod('period', TIME_PERIOD.DAY, { allowCustom: true }),
    middleware.number('protocolVersion'),
    middleware.number('valueFrom'),
    middleware.number('valueTo'),
    async ({ params, response }, next) => {
      // const { query } = request;
      const { period, protocolVersion, valueFrom, valueTo } = params;
      // const relayerId = normalizeQueryParam(query.relayer);
      // const status = normalizeQueryParam(query.status);
      // const token = normalizeQueryParam(query.token);

      // const relayerLookupId = await getRelayerLookupId(relayerId);

      const { dateFrom, dateTo } = getDatesForTimePeriod(period);

      const stats = await computeNetworkStatsForDates(dateFrom, dateTo, {
        protocolVersion,
        valueFrom,
        valueTo,
      });

      response.body = stats;

      await next();
    },
  );

  router.get(
    '/relayer',
    middleware.timePeriod('period', TIME_PERIOD.DAY),
    async ({ params, response }, next) => {
      const { period } = params;
      const { dateFrom, dateTo } = getDatesForTimePeriod(period);
      const stats = await computeNetworkStatsForDates(dateFrom, dateTo);

      response.body = {
        tradeCount: stats.tradeCount,
        tradeVolume: stats.tradeVolume,
      };

      await next();
    },
  );

  router.get(
    '/trader',
    middleware.timePeriod('period', TIME_PERIOD.DAY),
    async ({ params, response }, next) => {
      const { period } = params;
      const { dateFrom, dateTo } = getDatesForTimePeriod(period);
      const stats = await computeTraderStatsForDates(dateFrom, dateTo);

      response.body = stats;

      await next();
    },
  );

  router.get(
    '/asset-bridging',
    middleware.timePeriod('period', TIME_PERIOD.DAY),
    async ({ params, response }, next) => {
      const { period } = params;
      const stats = await getAssetBridgingStatsForPeriod(period);

      response.body = stats;

      await next();
    },
  );

  return router;
};

module.exports = createRouter;
