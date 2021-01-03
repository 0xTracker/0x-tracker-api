const _ = require('lodash');
const Router = require('koa-router');

const { TIME_PERIOD } = require('../../../constants');
const AddressMetadata = require('../../../model/address-metadata');
const getDatesForTimePeriod = require('../../../util/get-dates-for-time-period');
const getTradersWithStatsForDates = require('../../../traders/get-traders-with-stats-for-dates');
const InvalidParameterError = require('../../errors/invalid-parameter-error');
const middleware = require('../../middleware');

const createRouter = () => {
  const router = new Router();

  router.get(
    '/traders',
    middleware.pagination({
      defaultLimit: 20,
      maxLimit: 50,
      maxPage: Infinity,
    }),
    middleware.timePeriod('statsPeriod', TIME_PERIOD.DAY),
    middleware.apps('apps'),
    async ({ pagination, params, request, response }, next) => {
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

      const { limit, page } = pagination;
      const { apps, statsPeriod } = params;
      const { dateFrom, dateTo } = getDatesForTimePeriod(statsPeriod);
      const { traders, resultCount } = await getTradersWithStatsForDates(
        dateFrom,
        dateTo,
        {
          appIds: apps,
          excludeRelayers,
          page,
          limit,
          type,
        },
      );

      const addresses = traders.map(trader => trader.address);

      const addressMetadatas = await AddressMetadata.find({
        address: { $in: addresses },
      }).lean();

      response.body = {
        page,
        pageCount: Math.ceil(resultCount / limit),
        limit,
        total: resultCount,
        traders: traders.map(trader => {
          const metadata = addressMetadatas.find(
            m => m.address === trader.address,
          );

          return {
            ...trader,
            imageUrl: _.get(metadata, 'imageUrl', null),
            name: _.get(metadata, 'name', null),
          };
        }),
      };

      await next();
    },
  );

  return router;
};

module.exports = createRouter;
