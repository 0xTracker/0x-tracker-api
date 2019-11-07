const Router = require('koa-router');

const { TIME_PERIOD } = require('../../../constants');
const getDatesForTimePeriod = require('../../../util/get-dates-for-time-period');
const getRelayersWith24HourStats = require('../../../relayers/get-relayers-with-24-hour-stats');
const getRelayersWithStatsForDates = require('../../../relayers/get-relayers-with-stats-for-dates');
const pagination = require('../../middleware/pagination');
const validatePeriod = require('../../middleware/validate-period');

const createRouter = () => {
  const router = new Router();

  router.get(
    '/relayers',
    pagination({ defaultLimit: 20, maxLimit: 50, maxPage: Infinity }),
    validatePeriod('statsPeriod'),
    async ({ pagination: { limit, page }, request, response }, next) => {
      const statsPeriod = request.query.statsPeriod || TIME_PERIOD.DAY;
      const { dateFrom, dateTo } = getDatesForTimePeriod(statsPeriod);

      const { relayers, resultCount } =
        statsPeriod === TIME_PERIOD.DAY
          ? await getRelayersWith24HourStats({
              page,
              limit,
            })
          : await getRelayersWithStatsForDates(dateFrom, dateTo, {
              page,
              limit,
            });

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
