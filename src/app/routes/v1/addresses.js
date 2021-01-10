const Router = require('koa-router');

const { TIME_PERIOD } = require('../../../constants');
const InvalidParameterError = require('../../errors/invalid-parameter-error');
const middleware = require('../../middleware');
const getAddressesForPeriod = require('../../../addresses/get-addresses-for-period');

const createRouter = () => {
  const router = new Router();

  router.get(
    '/addresses',
    middleware.pagination({
      defaultLimit: 20,
      maxLimit: 50,
      maxPage: Infinity,
    }),
    middleware.timePeriod('statsPeriod', TIME_PERIOD.DAY, {
      allowCustom: true,
    }),
    middleware.apps('apps'),
    middleware.enum('sortBy', ['tradeCount', 'tradeVolume'], 'tradeVolume'),
    middleware.enum('sortDirection', ['asc', 'desc'], 'desc'),
    async ({ pagination, params, request, response }, next) => {
      const { type } = request.query;

      if (
        type !== 'affiliate' &&
        type !== 'bridge' &&
        type !== 'feeRecipient' &&
        type !== 'maker' &&
        type !== 'sender' &&
        type !== 'taker' &&
        type !== 'transactionFrom' &&
        type !== 'transactionTo'
      ) {
        throw new InvalidParameterError(
          'Must be one of: affiliate, bridge, feeRecipient, maker, sender, taker, transactionFrom, transactionTo',
          'Invalid query parameter: type',
        );
      }

      const { limit, page } = pagination;
      const { apps, sortBy, sortDirection, statsPeriod } = params;
      const { results, resultCount } = await getAddressesForPeriod(
        type,
        statsPeriod,
        {
          appIds: apps,
          page,
          sortBy,
          sortDirection,
          limit,
        },
      );

      response.body = {
        limit,
        page,
        pageCount: Math.ceil(resultCount / limit),
        results,
        total: resultCount,
      };

      await next();
    },
  );

  return router;
};

module.exports = createRouter;
