const Router = require('koa-router');

const { TIME_PERIOD } = require('../../../constants');
const getLiquiditySourcesForPeriod = require('../../../liquidity-sources/get-liquidity-sources-for-period');
const middleware = require('../../middleware');

const createRouter = () => {
  const router = new Router({ prefix: '/liquidity-sources' });

  router.get(
    '/',
    middleware.pagination({
      defaultLimit: 20,
      maxLimit: 50,
      maxPage: Infinity,
    }),
    middleware.timePeriod('statsPeriod', TIME_PERIOD.DAY),
    async ({ pagination, params, response }, next) => {
      const { limit, page } = pagination;
      const { statsPeriod } = params;
      const {
        liquiditySources,
        resultCount,
      } = await getLiquiditySourcesForPeriod(statsPeriod, { limit, page });

      response.body = {
        liquiditySources,
        page,
        pageCount: Math.ceil(resultCount / limit),
        limit,
        statsPeriod,
        total: resultCount,
      };

      await next();
    },
  );

  return router;
};

module.exports = createRouter;
