const Router = require('koa-router');

const { TIME_PERIOD } = require('../../../constants');
const getAppsWithStatsForDates = require('../../../apps/get-apps-with-stats-for-dates');
const getDatesForTimePeriod = require('../../../util/get-dates-for-time-period');
const middleware = require('../../middleware');

const createRouter = () => {
  const router = new Router();

  router.get(
    '/apps',
    middleware.pagination({
      defaultLimit: 20,
      maxLimit: 50,
      maxPage: Infinity,
    }),
    middleware.timePeriod('statsPeriod', TIME_PERIOD.DAY),
    async ({ pagination, params, response }, next) => {
      const { limit, page } = pagination;
      const { statsPeriod } = params;
      const { dateFrom, dateTo } = getDatesForTimePeriod(statsPeriod);
      const { apps, resultCount } = await getAppsWithStatsForDates(
        dateFrom,
        dateTo,
        {
          page,
          limit,
        },
      );

      response.body = {
        apps,
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
