const Router = require('koa-router');

const { TIME_PERIOD } = require('../../../constants');
const getDatesForTimePeriod = require('../../../util/get-dates-for-time-period');
const computeNetworkStatsForDates = require('../../../stats/compute-network-stats-for-dates');
const computeTraderStatsForDates = require('../../../stats/compute-trader-stats-for-dates');
const middleware = require('../../middleware');

const createRouter = () => {
  const router = new Router({ prefix: '/stats' });

  router.get(
    '/network',
    middleware.timePeriod('period', TIME_PERIOD.DAY),
    async ({ params, response }, next) => {
      const { period } = params;
      const { dateFrom, dateTo } = getDatesForTimePeriod(period);
      const stats = await computeNetworkStatsForDates(dateFrom, dateTo);

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

  return router;
};

module.exports = createRouter;
