const Router = require('koa-router');
const { TIME_PERIOD } = require('../../../constants');
const getLiquiditySourcesForPeriod = require('../../../liquidity-sources/get-liquidity-sources-for-period');
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
    middleware.metricGranularity({
      granularity: 'sparklineGranularity',
      period: 'statsPeriod',
    }),
    async ({ pagination, params, response }, next) => {
      const { limit, page } = pagination;
      const {
        sortBy,
        sortDirection,
        sparkline,
        sparklineGranularity,
        statsPeriod,
      } = params;

      const {
        liquiditySources,
        resultCount,
      } = await getLiquiditySourcesForPeriod(statsPeriod, {
        limit,
        page,
        sortBy,
        sortDirection,
        sparkline,
        sparklineGranularity,
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
