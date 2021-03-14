const Router = require('koa-router');
const { TIME_PERIOD } = require('../../../constants');
const getLiquiditySourcesForPeriod = require('../../../liquidity-sources/get-liquidity-sources-for-period');
const getGranularityForSparkline = require('../../../metrics/get-granularity-for-sparkline');
const middleware = require('../../middleware');

const createRouter = () => {
  const router = new Router();

  router.get(
    '/liquidity-sources',
    middleware.pagination({
      defaultLimit: 20,
      maxLimit: 50,
      maxPage: Infinity,
    }),
    middleware.timePeriod('statsPeriod', TIME_PERIOD.DAY, {
      allowCustom: true,
    }),
    middleware.enum('sortBy', ['tradeCount', 'tradeVolume'], 'tradeVolume'),
    middleware.enum('sortDirection', ['asc', 'desc'], 'desc'),
    middleware.enum('sparkline', ['none', 'tradeCount', 'tradeVolume'], 'none'),
    async ({ pagination, params, response }, next) => {
      const { limit, page } = pagination;
      const { sortBy, sortDirection, sparkline, statsPeriod } = params;

      const {
        liquiditySources,
        resultCount,
      } = await getLiquiditySourcesForPeriod(statsPeriod, {
        limit,
        page,
        sortBy,
        sortDirection,
        sparkline,
        sparklineGranularity: getGranularityForSparkline(statsPeriod),
      });

      response.body = {
        liquiditySources,
        page,
        pageCount: Math.ceil(resultCount / limit),
        limit,
        total: resultCount,
      };

      await next();
    },
  );

  return router;
};

module.exports = createRouter;
