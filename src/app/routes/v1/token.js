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
    middleware.pagination({
      defaultLimit: 20,
      maxLimit: 50,
      maxPage: Infinity,
    }),
    async ({ pagination, params, response }, next) => {
      const { sortBy, statsPeriod, tokenAddress } = params;
      const { limit, page } = pagination;

      const token = await Token.findOne({
        address: tokenAddress,
      }).lean();

      if (_.isNull(token)) {
        response.status = 404;
        await next();
        return;
      }

      const { relayers, resultCount } = await getRelayersForTokenInPeriod(
        tokenAddress,
        statsPeriod,
        {
          sortBy,
          limit,
          page,
        },
      );

      response.body = {
        limit,
        page,
        pageCount: Math.ceil(resultCount / limit),
        relayers,
        sortBy,
        statsPeriod,
        total: resultCount,
      };

      await next();
    },
  );

  return router;
};

module.exports = createRouter;
