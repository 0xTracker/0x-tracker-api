const Router = require('koa-router');

const { TIME_PERIOD } = require('../../../constants');
const getDatesForTimePeriod = require('../../../util/get-dates-for-time-period');
const compute24HourNetworkStats = require('../../../stats/compute-24-hour-network-stats');
const computeNetworkStatsForDates = require('../../../stats/compute-network-stats-for-dates');
const compute24HourTraderStats = require('../../../stats/compute-24-hour-trader-stats');
const computeTraderStatsForDates = require('../../../stats/compute-trader-stats-for-dates');
const validatePeriod = require('../../middleware/validate-period');

const createRouter = () => {
  const router = new Router({ prefix: '/stats' });

  router.get(
    '/network',
    validatePeriod('period'),
    async ({ request, response }, next) => {
      const period = request.query.period || TIME_PERIOD.DAY;
      const { dateFrom, dateTo } = getDatesForTimePeriod(period);
      const stats =
        period === TIME_PERIOD.DAY
          ? await compute24HourNetworkStats()
          : await computeNetworkStatsForDates(dateFrom, dateTo);

      response.body = {
        fees: stats.fees,
        fillCount: stats.fillCount,
        fillVolume: stats.fillVolume,
        tradeCount: stats.tradeCount,
        tradeVolume: stats.tradeVolume,
      };

      await next();
    },
  );

  router.get(
    '/relayer',
    validatePeriod('period'),
    async ({ request, response }, next) => {
      const period = request.query.period || TIME_PERIOD.DAY;
      const { dateFrom, dateTo } = getDatesForTimePeriod(period);
      const stats =
        period === TIME_PERIOD.DAY
          ? await compute24HourNetworkStats()
          : await computeNetworkStatsForDates(dateFrom, dateTo);

      response.body = {
        // trades: stats.tradeCount,
        tradeVolume: stats.tradeVolume,
      };

      await next();
    },
  );

  router.get(
    '/trader',
    validatePeriod('period'),
    async ({ request, response }, next) => {
      const period = request.query.period || TIME_PERIOD.DAY;
      const { dateFrom, dateTo } = getDatesForTimePeriod(period);
      const stats =
        period === TIME_PERIOD.DAY
          ? await compute24HourTraderStats()
          : await computeTraderStatsForDates(dateFrom, dateTo);

      response.body = stats;

      await next();
    },
  );

  return router;
};

module.exports = createRouter;
