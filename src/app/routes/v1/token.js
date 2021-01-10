const _ = require('lodash');
const Router = require('koa-router');

const { TIME_PERIOD } = require('../../../constants');
const getAppsForTokenInPeriod = require('../../../apps/get-apps-for-token-in-period');
const getTokenPrice = require('../../../tokens/get-token-price');
const getTokenStatsForPeriod = require('../../../tokens/get-token-stats-for-period');
const middleware = require('../../middleware');
const Token = require('../../../model/token');
const transformToken = require('./util/transform-token');

const createRouter = () => {
  const router = new Router({ prefix: '/tokens/:tokenAddress' });

  router.get(
    '/',
    middleware.timePeriod('statsPeriod', TIME_PERIOD.DAY, {
      allowCustom: true,
    }),
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
    '/apps',
    middleware.timePeriod('statsPeriod', TIME_PERIOD.DAY, {
      allowCustom: true,
    }),
    middleware.enum(
      'sortBy',
      ['tradeCount', 'tradeVolumeUSD'],
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

      const { apps, resultCount } = await getAppsForTokenInPeriod(
        tokenAddress,
        statsPeriod,
        {
          sortBy,
          limit,
          page,
        },
      );

      response.body = {
        apps,
        limit,
        page,
        pageCount: Math.ceil(resultCount / limit),
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
