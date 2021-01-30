const Router = require('koa-router');

const { TIME_PERIOD } = require('../../../constants');
const computeNetworkStatsForPeriod = require('../../../stats/compute-network-stats-for-period');
const computeTraderStatsForPeriod = require('../../../stats/compute-trader-stats-for-period');
const getAssetBridgingStatsForPeriod = require('../../../asset-bridges/get-asset-bridging-stats-for-period');
const middleware = require('../../middleware');

const createRouter = () => {
  const router = new Router({ prefix: '/stats' });

  router.get(
    '/network',
    middleware.timePeriod('period', TIME_PERIOD.DAY, { allowCustom: true }),
    async ({ params, response }, next) => {
      const stats = await computeNetworkStatsForPeriod(params.period);

      response.body = stats;

      await next();
    },
  );

  router.get(
    '/trader',
    middleware.timePeriod('period', TIME_PERIOD.DAY, { allowCustom: true }),
    async ({ params, response }, next) => {
      const stats = await computeTraderStatsForPeriod(params.period);

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
