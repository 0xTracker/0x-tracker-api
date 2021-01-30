const Router = require('koa-router');

const { TIME_PERIOD } = require('../../../constants');
const getProtocolsWithStatsForPeriod = require('../../../protocols/get-protocols-with-stats-for-period');
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

      if (
        sortBy !== undefined &&
        sortBy !== 'tradeVolume' &&
        sortBy !== 'tradeCount'
      ) {
        throw new InvalidParameterError(
          'Must be one of: tradeCount, tradeVolume',
          'Invalid query parameter: sortBy',
        );
      }

      const { protocols, resultCount } = await getProtocolsWithStatsForPeriod(
        statsPeriod,
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
