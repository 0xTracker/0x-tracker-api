const _ = require('lodash');
const Router = require('koa-router');

const { TIME_PERIOD } = require('../../../constants');
const getRelayersForTokenInPeriod = require('../../../relayers/get-relayers-for-token-in-period');
const getTokenPrice = require('../../../tokens/get-token-price');
const getTokenStatsForPeriod = require('../../../tokens/get-token-stats-for-period');
const middleware = require('../../middleware');
const Token = require('../../../model/token');
const transformToken = require('./util/transform-token');

const createRouter = () => {
  const router = new Router({ prefix: '/tokens/:tokenAddress' });

  router.get(
    '/',
    middleware.timePeriod('statsPeriod', TIME_PERIOD.DAY),
    async ({ params, response }, next) => {
      const { statsPeriod, tokenAddress } = params;

      const token = await Token.findOne({
        address: tokenAddress,
      }).lean();

      if (_.isNull(token)) {
        response.status = 404;
        await next();
        return;
      }

      const [price, stats] = await Promise.all([
        getTokenPrice(token.address, statsPeriod),
        getTokenStatsForPeriod(token, statsPeriod),
      ]);

      response.body = transformToken(token, price, stats, statsPeriod);

      await next();
    },
  );

  router.get(
    '/relayers',
    middleware.timePeriod('statsPeriod', TIME_PERIOD.DAY),
    middleware.enum(
      'sortBy',
      ['fillCount', 'fillVolumeUSD', 'tradeCount', 'tradeVolumeUSD'],
      'tradeVolumeUSD',
    ),
    middleware.limit(50, 10),
    async ({ params, response }, next) => {
      const { limit, sortBy, statsPeriod, tokenAddress } = params;

      const token = await Token.findOne({
        address: tokenAddress,
      }).lean();

      if (_.isNull(token)) {
        response.status = 404;
        await next();
        return;
      }

      const relayers = await getRelayersForTokenInPeriod(
        tokenAddress,
        statsPeriod,
        { sortBy, limit },
      );

      response.body = { limit, relayers, sortBy, statsPeriod };

      await next();
    },
  );

  return router;
};

module.exports = createRouter;
