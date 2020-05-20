const _ = require('lodash');
const Router = require('koa-router');

const searchRelayers = require('../../../relayers/search-relayers');

const createRouter = () => {
  const router = new Router();

  router.get('/relayer-lookup', async ({ request, response }, next) => {
    const { q } = request.query;

    const limit =
      request.query.limit !== undefined ? _.toNumber(request.query.limit) : 5;
    const relayers = await searchRelayers(q || null, { limit });

    response.body = {
      limit,
      relayers: relayers.map(relayer => relayer),
      q: q || null,
    };

    await next();
  });

  return router;
};

module.exports = createRouter;
