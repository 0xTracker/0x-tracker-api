const Router = require('koa-router');

const { TIME_PERIOD } = require('../../../constants');
const getDatesForTimePeriod = require('../../../util/get-dates-for-time-period');
const getProtocolsWith24HourStats = require('../../../protocols/get-protocols-with-24-hour-stats');
const getProtocolsWithStatsForDates = require('../../../protocols/get-protocols-with-stats-for-dates');
const pagination = require('../../middleware/pagination');
const validatePeriod = require('../../middleware/validate-period');

const createRouter = () => {
  const router = new Router();

  router.get(
    '/protocols',
    pagination({ defaultLimit: 20, maxLimit: 50, maxPage: Infinity }),
    validatePeriod('statsPeriod'),
    async ({ pagination: { limit, page }, request, response }, next) => {
      const statsPeriod = request.query.statsPeriod || TIME_PERIOD.DAY;
      const { dateFrom, dateTo } = getDatesForTimePeriod(statsPeriod);

      const { protocols, resultCount } =
        statsPeriod === TIME_PERIOD.DAY
          ? await getProtocolsWith24HourStats({
              page,
              limit,
            })
          : await getProtocolsWithStatsForDates(dateFrom, dateTo, {
              page,
              limit,
            });

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
