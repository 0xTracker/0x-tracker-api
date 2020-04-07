const _ = require('lodash');
const Router = require('koa-router');

const { TIME_PERIOD } = require('../../../constants');
const checkTraderExists = require('../../../traders/check-trader-exists');
const determineGranularityForTimePeriod = require('../../../metrics/determine-granularity-for-time-period');
const getActiveTraderMetrics = require('../../../metrics/get-active-trader-metrics');
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
    middleware.timePeriod('period', TIME_PERIOD.MONTH),
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

      const { period } = params;
      const granularity = determineGranularityForTimePeriod(period);
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

  return router;
};

module.exports = createRouter;
