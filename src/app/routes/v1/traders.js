const Router = require('koa-router');

const { TIME_PERIOD } = require('../../../constants');
const getDatesForTimePeriod = require('../../../util/get-dates-for-time-period');
const getTradersWith24HourStats = require('../../../traders/get-traders-with-24-hour-stats');
const getTradersWithStatsForDates = require('../../../traders/get-traders-with-stats-for-dates');
const InvalidParameterError = require('../../errors/invalid-parameter-error');
const pagination = require('../../middleware/pagination');
const validatePeriod = require('../../middleware/validate-period');

const parseBooleanString = value => {
  if (value === 'true') {
    return true;
  }

  if (value === 'false') {
    return false;
  }

  return undefined;
};

const createRouter = () => {
  const router = new Router();

  router.get(
    '/traders',
    pagination({ defaultLimit: 20, maxLimit: 50, maxPage: Infinity }),
    validatePeriod('statsPeriod'),
    async ({ pagination: { limit, page }, request, response }, next) => {
      const { excludeRelayers, type } = request.query;

      if (type !== undefined && type !== 'maker' && type !== 'taker') {
        throw new InvalidParameterError(
          'Must be one of: maker, taker',
          'Invalid query parameter: type',
        );
      }

      if (
        excludeRelayers !== undefined &&
        excludeRelayers !== 'true' &&
        excludeRelayers !== 'false'
      ) {
        throw new InvalidParameterError(
          'Must be one of: true, false',
          'Invalid query parameter: excludeRelayers',
        );
      }

      const statsPeriod = request.query.statsPeriod || TIME_PERIOD.DAY;
      const { dateFrom, dateTo } = getDatesForTimePeriod(statsPeriod);

      const { traders, resultCount } =
        statsPeriod === TIME_PERIOD.DAY
          ? await getTradersWith24HourStats({
              excludeRelayers: parseBooleanString(excludeRelayers),
              page,
              limit,
              type,
            })
          : await getTradersWithStatsForDates(dateFrom, dateTo, {
              excludeRelayers,
              page,
              limit,
              type,
            });

      response.body = {
        page,
        pageCount: Math.ceil(resultCount / limit),
        limit,
        total: resultCount,
        traders,
      };

      await next();
    },
  );

  return router;
};

module.exports = createRouter;
