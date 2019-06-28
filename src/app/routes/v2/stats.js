const Router = require('koa-router');

const { TIME_PERIOD } = require('../../../constants');
const getDatesForTimePeriod = require('../../../util/get-dates-for-time-period');
const compute24HourNetworkStats = require('../../../stats/compute-24-hour-network-stats');
const computeNetworkStatsForDates = require('../../../stats/compute-network-stats-for-dates');

const createRouter = () => {
  const router = new Router({ prefix: '/stats' });

  router.get('/network', async ({ request, response }, next) => {
    const period = request.query.period || TIME_PERIOD.DAY;
    const { dateFrom, dateTo } = getDatesForTimePeriod(period);
    const stats =
      period === TIME_PERIOD.DAY
        ? await compute24HourNetworkStats()
        : await computeNetworkStatsForDates(dateFrom, dateTo);

    response.body = stats;

    await next();
  });

  return router;
};

module.exports = createRouter;
