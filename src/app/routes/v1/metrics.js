const Router = require('koa-router');

const { TIME_PERIOD } = require('../../../constants');
const getDatesForTimePeriod = require('../../../util/get-dates-for-time-period');
const getMetricIntervalForTimePeriod = require('../../../metrics/get-metric-interval-for-time-period');
const getNetworkMetrics = require('../../../metrics/get-network-metrics');
const getRelayerLookupId = require('../../../relayers/get-relayer-lookup-id');
const getTokenMetrics = require('../../../metrics/get-token-metrics');

const createRouter = () => {
  const router = new Router({ prefix: '/metrics' });

  router.get('/network', async ({ request, response }, next) => {
    const period = request.query.period || TIME_PERIOD.MONTH;
    const relayerId = request.query.relayer;
    const relayerLookupId = await getRelayerLookupId(relayerId);

    const { dateFrom, dateTo } = getDatesForTimePeriod(period);
    const metricInterval = getMetricIntervalForTimePeriod(period);
    const metrics = await getNetworkMetrics(dateFrom, dateTo, metricInterval, {
      relayerId: relayerLookupId,
    });

    response.body = metrics.map(metric => ({
      date: metric.date,
      fees: metric.fees,
      fills: metric.fillCount,
      volume: metric.fillVolume,
    }));

    await next();
  });

  router.get('/token-volume', async ({ request, response }, next) => {
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
