const Router = require('koa-router');

const { TIME_PERIOD } = require('../../../constants');
const getDatesForTimePeriod = require('../../../util/get-dates-for-time-period');
const getProtocolsWithStatsForDates = require('../../../protocols/get-protocols-with-stats-for-dates');
const InvalidParameterError = require('../../errors/invalid-parameter-error');
const middleware = require('../../middleware');

const createRouter = () => {
  const router = new Router();

  router.get(
    '/protocols',
    middleware.pagination({
      defaultLimit: 20,
      maxLimit: 50,
      maxPage: Infinity,
    }),
    middleware.timePeriod('statsPeriod', TIME_PERIOD.DAY, {
      allowCustom: true,
    }),
    async ({ pagination, params, request, response }, next) => {
      const { limit, page } = pagination;
      const { sortBy } = request.query;
      const { statsPeriod } = params;
      const { dateFrom, dateTo } = getDatesForTimePeriod(statsPeriod);

      if (
        sortBy !== undefined &&
        sortBy !== 'fillVolume' &&
        sortBy !== 'fillCount' &&
        sortBy !== 'tradeVolume' &&
        sortBy !== 'tradeCount'
      ) {
        throw new InvalidParameterError(
          'Must be one of: fillCount, fillVolume, tradeCount, tradeVolume',
          'Invalid query parameter: sortBy',
        );
      }

      const { protocols, resultCount } = await getProtocolsWithStatsForDates(
        dateFrom,
        dateTo,
        {
          page,
          limit,
          sortBy,
        },
      );

      response.body = {
        protocols,
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
