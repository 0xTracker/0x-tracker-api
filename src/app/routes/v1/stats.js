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
    middleware.relayer('relayer'),
    middleware.token('token'),
    middleware.fillStatus('status'),
    middleware.trader('trader'),
    async ({ params, response }, next) => {
      const { dateFrom, dateTo } = getDatesForTimePeriod(params.period);

      const stats = await computeNetworkStatsForDates(dateFrom, dateTo, {
        protocolVersion: params.protocolVersion,
        relayerId: params.relayer,
        status: params.status,
        token: params.token,
        trader: params.trader,
        valueFrom: params.valueFrom,
        valueTo: params.valueTo,
      });

      response.body = stats;

      await next();
    },
  );

  router.get(
    '/trader',
    middleware.timePeriod('period', TIME_PERIOD.DAY, { allowCustom: true }),
    middleware.number('protocolVersion'),
    middleware.number('valueFrom'),
    middleware.number('valueTo'),
    middleware.relayer('relayer'),
    middleware.token('token'),
    middleware.fillStatus('status'),
    middleware.trader('trader'),
    async ({ params, response }, next) => {
      const { dateFrom, dateTo } = getDatesForTimePeriod(params.period);

      const stats = await computeTraderStatsForDates(dateFrom, dateTo, {
        protocolVersion: params.protocolVersion,
        relayerId: params.relayer,
        status: params.status,
        token: params.token,
        trader: params.trader,
        valueFrom: params.valueFrom,
        valueTo: params.valueTo,
      });

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
