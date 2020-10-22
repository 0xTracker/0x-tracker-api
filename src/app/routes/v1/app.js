const Router = require('koa-router');

const { TIME_PERIOD } = require('../../../constants');
const getAppBySlug = require('../../../apps/get-app-by-slug');
const getAppStatsForPeriod = require('../../../apps/get-app-stats-for-period');
const middleware = require('../../middleware');
const transformApp = require('./util/transform-app');
const getTokensForAppInPeriod = require('../../../tokens/get-tokens-for-app-in-period');

const createRouter = () => {
  const router = new Router({ prefix: '/apps/:slug' });

  router.get(
    '/',
    middleware.timePeriod('statsPeriod', TIME_PERIOD.DAY),
    async ({ params, response }, next) => {
      const { slug, statsPeriod } = params;
      const app = await getAppBySlug(slug);

      if (app === null) {
        response.status = 404;
        await next();
        return;
      }

      const stats = await getAppStatsForPeriod(app._id, statsPeriod);
      const viewModel = transformApp(app, stats);

      response.body = viewModel;

      await next();
    },
  );

  router.get(
    '/tokens',
    middleware.timePeriod('statsPeriod', TIME_PERIOD.DAY),
    middleware.enum(
      'sortBy',
      ['tradeCount', 'tradeVolumeUSD'],
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

      const app = await getAppBySlug(slug);

      if (app === null) {
        response.status = 404;
        await next();
        return;
      }

      const { tokens, resultCount } = await getTokensForAppInPeriod(
        app._id,
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
