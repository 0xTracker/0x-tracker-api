const _ = require('lodash');
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
    middleware.timePeriod('statsPeriod', TIME_PERIOD.DAY, {
      allowCustom: true,
    }),
    middleware.enum(
      'sortBy',
      ['activeTraders', 'tradeCount', 'tradeVolume'],
      'tradeVolume',
    ),
    middleware.enum('sortDirection', ['asc', 'desc'], 'desc'),
    async ({ pagination, params, request, response }, next) => {
      const { category } = request.query;
      const { limit, page } = pagination;
      const { sortBy, sortDirection, statsPeriod } = params;
      const { dateFrom, dateTo } = getDatesForTimePeriod(statsPeriod);
      const { apps, resultCount } = await getAppsWithStatsForDates(
        dateFrom,
        dateTo,
        {
          category: _.isEmpty(category) ? undefined : category,
          page,
          limit,
          sortBy,
          sortDirection,
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
