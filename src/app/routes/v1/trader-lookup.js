const _ = require('lodash');
const Router = require('koa-router');

const searchTraders = require('../../../traders/search-traders');

const createRouter = () => {
  const router = new Router();

  router.get('/trader-lookup', async ({ request, response }, next) => {
    const { q } = request.query;

    const limit =
      request.query.limit !== undefined ? _.toNumber(request.query.limit) : 5;
    const traders = await searchTraders(q || null, { limit });

    response.body = {
      limit,
      traders,
      q: q || null,
    };

    await next();
  });

  return router;
};

module.exports = createRouter;
