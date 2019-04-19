const Router = require('koa-router');

const { TIME_PERIOD } = require('../../../constants');
const getNetworkMetrics = require('../../../metrics/get-network-metrics');
const getRelayerLookupId = require('../../../relayers/get-relayer-lookup-id');
const getTokens = require('../../../tokens/get-tokens');
const getTokenVolumeMetrics = require('../../../metrics/get-token-volume-metrics');

const createRouter = () => {
  const router = new Router({ prefix: '/metrics' });

  router.get('/network', async ({ request, response }, next) => {
    const period = request.query.period || TIME_PERIOD.MONTH;
    const relayerId = request.query.relayer;
    const relayerLookupId = await getRelayerLookupId(relayerId);
    const tokens = await getTokens();
    const metrics = await getNetworkMetrics(period, tokens, {
      relayerId: relayerLookupId,
    });

    response.body = metrics;

    await next();
  });

  router.get('/token-volume', async ({ request, response }, next) => {
    const { token } = request.query;
    const period = request.query.period || TIME_PERIOD.MONTH;
    const metrics = await getTokenVolumeMetrics(token, period);

    response.body = metrics;

    await next();
  });

  return router;
};

module.exports = createRouter;
