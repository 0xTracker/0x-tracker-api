const Router = require('koa-router');

const { TIME_PERIOD } = require('../../../constants');
const getDatesForTimePeriod = require('../../../util/get-dates-for-time-period');
const getMetricIntervalForTimePeriod = require('../../../metrics/get-metric-interval-for-time-period');
const getTokenMetrics = require('../../../metrics/get-token-metrics-v2');

const createRouter = () => {
  const router = new Router({ prefix: '/metrics' });

  router.get('/token', async ({ request, response }, next) => {
    const { token } = request.query;
    const period = request.query.period || TIME_PERIOD.MONTH;

    const { dateFrom, dateTo } = getDatesForTimePeriod(period);

    const metricInterval = getMetricIntervalForTimePeriod(period);
    const metrics = await getTokenMetrics(
      token,
      dateFrom,
      dateTo,
      metricInterval,
    );

    response.body = metrics;

    await next();
  });

  return router;
};

module.exports = createRouter;
