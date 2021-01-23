const _ = require('lodash');
const Router = require('koa-router');

const { TIME_PERIOD } = require('../../../constants');
const checkTraderExists = require('../../../traders/check-trader-exists');
const getAppById = require('../../../apps/get-app-by-id');
const getAppMetrics = require('../../../metrics/get-app-metrics');
const getTradedTokenMetrics = require('../../../metrics/get-traded-token-metrics');
const getActiveTraderMetrics = require('../../../metrics/get-active-trader-metrics');
const getAssetBridgeMetrics = require('../../../metrics/get-asset-bridge-metrics');
const getAssetBridgingMetrics = require('../../../asset-bridges/get-asset-bridging-metrics');
const getNetworkMetrics = require('../../../metrics/get-network-metrics');
const getProtocolMetrics = require('../../../metrics/get-protocol-metrics');
const getRelayerLookupId = require('../../../relayers/get-relayer-lookup-id');
const getRelayerMetrics = require('../../../metrics/get-relayer-metrics');
const getTokenMetrics = require('../../../metrics/get-token-metrics');
const getTraderMetrics = require('../../../metrics/get-trader-metrics');
const InvalidParameterError = require('../../errors/invalid-parameter-error');
const middleware = require('../../middleware');
const MissingParameterError = require('../../errors/missing-parameter-error');
const Token = require('../../../model/token');

const createRouter = () => {
  const router = new Router({ prefix: '/metrics' });

  router.get(
    '/network',
    middleware.timePeriod('period', TIME_PERIOD.MONTH, { allowCustom: true }),
    middleware.metricGranularity({
      period: 'period',
      granularity: 'granularity',
    }),
    async ({ params, response }, next) => {
      const { granularity, period } = params;
      const metrics = await getNetworkMetrics(period, granularity);

      response.body = metrics;

      await next();
    },
  );

  router.get(
    '/token',
    middleware.timePeriod('period', TIME_PERIOD.MONTH),
    middleware.metricGranularity({
      period: 'period',
      granularity: 'granularity',
    }),
    async ({ params, request, response }, next) => {
      const tokenAddress = request.query.token;

      if (tokenAddress === undefined) {
        throw new MissingParameterError('token');
      }

      const token = await Token.findOne({ address: tokenAddress });

      if (token === null) {
        throw new InvalidParameterError(
          `No tokens have been traded with an address of "${tokenAddress}"`,
          'Invalid query parameter: token',
        );
      }

      const { granularity, period } = params;
      const metrics = await getTokenMetrics(token.address, period, granularity);

      response.body = metrics;

      await next();
    },
  );

  router.get(
    '/trader',
    middleware.timePeriod('period', TIME_PERIOD.MONTH),
    middleware.metricGranularity({
      period: 'period',
      granularity: 'granularity',
    }),
    async ({ params, request, response }, next) => {
      const { address } = request.query;

      if (_.isEmpty(address)) {
        throw new MissingParameterError('address');
      }

      const traderExists = await checkTraderExists(address);

      if (!traderExists) {
        throw new InvalidParameterError(
          `No trader exists with an address of "${address}"`,
          'Invalid query parameter: address',
        );
      }

      const { granularity, period } = params;
      const metrics = await getTraderMetrics(address, period, granularity);

      response.body = metrics;

      await next();
    },
  );

  router.get(
    '/relayer',
    middleware.timePeriod('period', TIME_PERIOD.MONTH),
    middleware.metricGranularity({
      period: 'period',
      granularity: 'granularity',
    }),
    async ({ params, request, response }, next) => {
      const relayerId = request.query.relayer;

      if (relayerId === undefined) {
        throw new MissingParameterError('relayer');
      }

      const relayerLookupId = await getRelayerLookupId(relayerId);

      if (relayerLookupId === undefined) {
        throw new InvalidParameterError(
          `No relayer exists with an ID of "${relayerId}"`,
          `Invalid query parameter: relayer`,
        );
      }

      const { granularity, period } = params;
      const metrics = await getRelayerMetrics(
        relayerLookupId,
        period,
        granularity,
      );

      response.body = metrics;

      await next();
    },
  );

  router.get(
    '/protocol',
    middleware.timePeriod('period', TIME_PERIOD.MONTH),
    middleware.metricGranularity({
      period: 'period',
      granularity: 'granularity',
    }),
    async ({ params, response }, next) => {
      const { granularity, period } = params;
      const metrics = await getProtocolMetrics(period, granularity);

      response.body = metrics;

      await next();
    },
  );

  router.get(
    '/active-trader',
    middleware.timePeriod('period', TIME_PERIOD.MONTH),
    middleware.metricGranularity({
      period: 'period',
      granularity: 'granularity',
    }),
    async ({ params, response }, next) => {
      const { granularity, period } = params;
      const metrics = await getActiveTraderMetrics(period, granularity);

      response.body = metrics;

      await next();
    },
  );

  router.get(
    '/asset-bridge',
    middleware.timePeriod('period', TIME_PERIOD.MONTH),
    middleware.metricGranularity({
      period: 'period',
      granularity: 'granularity',
    }),
    async ({ params, request, response }, next) => {
      const { address } = request.query;

      if (address === undefined) {
        throw new MissingParameterError('address');
      }

      const { granularity, period } = params;
      const metrics = await getAssetBridgeMetrics(address, period, granularity);

      response.body = metrics;

      await next();
    },
  );

  router.get(
    '/asset-bridging',
    middleware.timePeriod('period', TIME_PERIOD.MONTH),
    middleware.metricGranularity({
      period: 'period',
      granularity: 'granularity',
    }),
    async ({ params, response }, next) => {
      const { granularity, period } = params;
      const metrics = await getAssetBridgingMetrics(period, granularity);

      response.body = metrics;

      await next();
    },
  );

  router.get(
    '/traded-token',
    middleware.timePeriod('period', TIME_PERIOD.MONTH),
    middleware.metricGranularity({
      period: 'period',
      granularity: 'granularity',
    }),
    async ({ params, response }, next) => {
      const { granularity, period } = params;
      const metrics = await getTradedTokenMetrics(period, granularity);

      response.body = metrics;

      await next();
    },
  );

  router.get(
    '/app',
    middleware.timePeriod('period', TIME_PERIOD.MONTH),
    middleware.metricGranularity({
      period: 'period',
      granularity: 'granularity',
    }),
    async ({ params, request, response }, next) => {
      const appId = request.query.app;

      if (appId === undefined) {
        throw new MissingParameterError('app');
      }

      const app = await getAppById(appId);

      if (app === null) {
        throw new InvalidParameterError(
          `No app found matching "${app}"`,
          `Invalid query parameter: app`,
        );
      }

      const { granularity, period } = params;
      const metrics = await getAppMetrics(app._id, period, granularity);

      response.body = metrics;

      await next();
    },
  );

  return router;
};

module.exports = createRouter;
