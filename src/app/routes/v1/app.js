const Router = require('koa-router');

const { TIME_PERIOD } = require('../../../constants');
const getAppById = require('../../../apps/get-app-by-id');
const getAppStatsForPeriod = require('../../../apps/get-app-stats-for-period');
const middleware = require('../../middleware');
const transformApp = require('./util/transform-app');

const createRouter = () => {
  const router = new Router({ prefix: '/apps/:id' });

  router.get(
    '/',
    middleware.timePeriod('statsPeriod', TIME_PERIOD.DAY),
    async ({ params, response }, next) => {
      const { id, statsPeriod } = params;
      const app = await getAppById(id);

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

  return router;
};

module.exports = createRouter;
