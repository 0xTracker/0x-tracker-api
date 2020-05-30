const _ = require('lodash');
const Router = require('koa-router');

const { TIME_PERIOD } = require('../../../constants');
const getRelayerBySlug = require('../../../relayers/get-relayer-by-slug');
const getRelayerStatsForPeriod = require('../../../relayers/get-relayer-stats-for-period');
const getTokensForRelayerInPeriod = require('../../../tokens/get-tokens-for-relayer-in-period');
const middleware = require('../../middleware');
const transformRelayer = require('./util/transform-relayer');

const createRouter = () => {
  const router = new Router({ prefix: '/relayers/:slug' });

  router.get(
    '/',
    middleware.timePeriod('statsPeriod', TIME_PERIOD.DAY),
    async ({ params, response }, next) => {
      const { slug, statsPeriod } = params;
      const relayer = await getRelayerBySlug(slug);

      if (_.isNull(relayer)) {
        response.status = 404;
        await next();
        return;
      }

      const stats = await getRelayerStatsForPeriod(
        relayer.lookupId,
        statsPeriod,
      );

      const viewModel = transformRelayer(relayer, stats);

      response.body = viewModel;

      await next();
    },
  );

  router.get(
    '/tokens',
    middleware.timePeriod('statsPeriod', TIME_PERIOD.DAY),
    middleware.enum(
      'sortBy',
      ['fillCount', 'fillVolumeUSD', 'tradeCount', 'tradeVolumeUSD'],
      'tradeVolumeUSD',
    ),
    middleware.pagination({
      defaultLimit: 20,
      maxLimit: 50,
      maxPage: Infinity,
    }),
    async ({ pagination, params, response }, next) => {
      const { slug, sortBy, statsPeriod } = params;
      const { limit, page } = pagination;

      const relayer = await getRelayerBySlug(slug);

      if (_.isNull(relayer)) {
        response.status = 404;
        await next();
        return;
      }

      const { tokens, resultCount } = await getTokensForRelayerInPeriod(
        relayer.lookupId,
        statsPeriod,
        {
          sortBy,
          limit,
          page,
        },
      );

      response.body = {
        limit,
        page,
        pageCount: Math.ceil(resultCount / limit),
        tokens,
        sortBy,
        statsPeriod,
        total: resultCount,
      };

      await next();
    },
  );

  return router;
};

module.exports = createRouter;
