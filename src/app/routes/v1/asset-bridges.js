const Router = require('koa-router');

const { TIME_PERIOD } = require('../../../constants');
const getAssetBridgesForPeriod = require('../../../asset-bridges/get-asset-bridges-for-period');
const middleware = require('../../middleware');

const createRouter = () => {
  const router = new Router({ prefix: '/asset-bridges' });

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
        assetBridges,
        resultCount,
      } = await getAssetBridgesForPeriod(statsPeriod, { limit, page });

      response.body = {
        assetBridges,
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
