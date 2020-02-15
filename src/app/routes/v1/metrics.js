const _ = require('lodash');
const Router = require('koa-router');

const { TIME_PERIOD } = require('../../../constants');
const checkTraderExists = require('../../../traders/check-trader-exists');
const determineGranularityForTimePeriod = require('../../../metrics/determine-granularity-for-time-period');
const getActiveTraderMetrics = require('../../../metrics/get-active-trader-metrics');
const getDatesForTimePeriod = require('../../../util/get-dates-for-time-period');
const getNetworkMetrics = require('../../../metrics/get-network-metrics');
const getProtocolMetrics = require('../../../metrics/get-protocol-metrics');
const getRelayerLookupId = require('../../../relayers/get-relayer-lookup-id');
const getRelayerMetrics = require('../../../metrics/get-relayer-metrics');
const getTokenMetrics = require('../../../metrics/get-token-metrics');
const getTraderMetrics = require('../../../metrics/get-trader-metrics');
const InvalidParameterError = require('../../errors/invalid-parameter-error');
const MissingParameterError = require('../../errors/missing-parameter-error');
const Token = require('../../../model/token');
const validatePeriod = require('../../middleware/validate-period');
const validateGranularity = require('../../middleware/validate-granularity');

const createRouter = () => {
  const router = new Router({ prefix: '/metrics' });

  router.get(
    '/network',
    validatePeriod('period'),
    async ({ request, response }, next) => {
      const period = request.query.period || TIME_PERIOD.MONTH;

      const { dateFrom, dateTo } = getDatesForTimePeriod(period);
      const granularity = determineGranularityForTimePeriod(period);
      const metrics = await getNetworkMetrics(dateFrom, dateTo, granularity);

      response.body = metrics;

      await next();
    },
  );

  router.get(
    '/token',
    validatePeriod('period'),
    async ({ request, response }, next) => {
      const tokenAddress = request.query.token;

      if (tokenAddress === undefined) {
        throw new MissingParameterError('token');
      }

      const period = request.query.period || TIME_PERIOD.MONTH;

      const { dateFrom, dateTo } = getDatesForTimePeriod(period);

      const granularity = determineGranularityForTimePeriod(period);
      const token = await Token.findOne({ address: tokenAddress });

      if (token === null) {
        throw new InvalidParameterError(
          `No tokens have been traded with an address of "${tokenAddress}"`,
          'Invalid query parameter: token',
        );
      }

      const metrics = await getTokenMetrics(
        token,
        dateFrom,
        dateTo,
        granularity,
      );

      response.body = metrics;

      await next();
    },
  );

  router.get(
    '/trader',
    validatePeriod('period'),
    async ({ request, response }, next) => {
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

      const period = request.query.period || TIME_PERIOD.MONTH;

      const { dateFrom, dateTo } = getDatesForTimePeriod(period);
      const granularity = determineGranularityForTimePeriod(period);
      const metrics = await getTraderMetrics(
        address,
        dateFrom,
        dateTo,
        granularity,
      );

      response.body = metrics;

      await next();
    },
  );

  router.get(
    '/relayer',
    validatePeriod('period'),
    async ({ request, response }, next) => {
      const period = request.query.period || TIME_PERIOD.MONTH;
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

      const { dateFrom, dateTo } = getDatesForTimePeriod(period);
      const granularity = determineGranularityForTimePeriod(period);
      const metrics = await getRelayerMetrics(
        relayerLookupId,
        dateFrom,
        dateTo,
        granularity,
      );

      response.body = metrics;

      await next();
    },
  );

  router.get(
    '/protocol',
    validatePeriod('period'),
    validateGranularity({ period: 'period', granularity: 'granularity' }),
    async ({ request, response }, next) => {
      const { granularity } = request.query;
      const period = request.query.period || TIME_PERIOD.MONTH;

      const { dateFrom, dateTo } = getDatesForTimePeriod(period);
      const metrics = await getProtocolMetrics(
        dateFrom,
        dateTo,
        granularity === undefined
          ? determineGranularityForTimePeriod(period)
          : granularity,
      );

      response.body = metrics;

      await next();
    },
  );

  router.get(
    '/active-trader',
    validatePeriod('period'),
    validateGranularity({ period: 'period', granularity: 'granularity' }),
    async ({ request, response }, next) => {
      const { granularity } = request.query;
      const period = request.query.period || TIME_PERIOD.MONTH;

      const { dateFrom, dateTo } = getDatesForTimePeriod(period);
      const metrics = await getActiveTraderMetrics(
        dateFrom,
        dateTo,
        granularity === undefined
          ? determineGranularityForTimePeriod(period)
          : granularity,
      );

      response.body = metrics;

      await next();
    },
  );

  return router;
};

module.exports = createRouter;
