const Router = require('koa-router');

const { TIME_PERIOD } = require('../../../constants');
const getDatesForTimePeriod = require('../../../util/get-dates-for-time-period');
const getRelayersWithStatsForDates = require('../../../relayers/get-relayers-with-stats-for-dates');
const middleware = require('../../middleware');

const createRouter = () => {
  const router = new Router();

  router.get(
    '/relayers',
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
      const { relayers, resultCount } = await getRelayersWithStatsForDates(
        dateFrom,
        dateTo,
        {
          page,
          limit,
        },
      );

      response.body = {
        relayers,
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
