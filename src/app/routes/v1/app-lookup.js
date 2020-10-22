const _ = require('lodash');
const Router = require('koa-router');

const searchApps = require('../../../apps/search-apps');

const createRouter = () => {
  const router = new Router();

  router.get('/app-lookup', async ({ request, response }, next) => {
    const { q } = request.query;

    const limit =
      request.query.limit !== undefined ? _.toNumber(request.query.limit) : 5;
    const apps = await searchApps(q || null, { limit });

    response.body = {
      apps,
      limit,
      q: q || null,
    };

    await next();
  });

  return router;
};

module.exports = createRouter;
