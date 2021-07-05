const _ = require('lodash');
const Router = require('koa-router');
const { TIME_PERIOD } = require('../../../constants');
const middleware = require('../../middleware');
const getLiquiditySourceBySlug = require('../../../liquidity-sources/get-liquidity-source-by-slug');
const getLiquiditySourceStatsForPeriod = require('../../../liquidity-sources/get-liquidity-source-stats-for-period');

const createRouter = () => {
  const router = new Router({ prefix: '/liquidity-sources/:slug' });

  router.get(
    '/',
    middleware.timePeriod('statsPeriod', TIME_PERIOD.DAY, {
      allowCustom: true,
    }),
    async ({ params, response }, next) => {
      const { slug, statsPeriod } = params;
      const liquiditySource = await getLiquiditySourceBySlug(slug);

      if (liquiditySource === null) {
        response.status = 404;
        await next();
        return;
      }

      const stats = await getLiquiditySourceStatsForPeriod(
        liquiditySource._id,
        statsPeriod,
      );

      response.body = {
        categories: liquiditySource.categories,
        description: _.get(liquiditySource, 'description', null),
        id: liquiditySource._id,
        logoUrl: _.get(liquiditySource, 'logoUrl', null),
        name: liquiditySource.name,
        stats,
        urlSlug: liquiditySource.urlSlug,
        websiteUrl: _.get(liquiditySource, 'websiteUrl', null),
      };

      await next();
    },
  );

  return router;
};

module.exports = createRouter;
