const Router = require('koa-router');

const { TIME_PERIOD } = require('../../../constants');
const getDatesForTimePeriod = require('../../../util/get-dates-for-time-period');
const compute24HourNetworkStats = require('../../../stats/compute-24-hour-network-stats');
const computeNetworkStatsForDates = require('../../../stats/compute-network-stats-for-dates');

const createRouter = () => {
  const router = new Router({ prefix: '/stats' });

  router.get('/network', async ({ request, response }, next) => {
    const period = request.query.period || TIME_PERIOD.DAY;

    if (period === TIME_PERIOD.DAY) {
      response.body = await compute24HourNetworkStats();
    } else {
      const { dateFrom, dateTo } = getDatesForTimePeriod(period);

      response.body = await computeNetworkStatsForDates(dateFrom, dateTo);
    }

    await next();
  });

  return router;
};

module.exports = createRouter;
