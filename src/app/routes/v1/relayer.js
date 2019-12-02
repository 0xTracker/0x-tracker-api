const _ = require('lodash');
const Router = require('koa-router');

const getRelayerBySlug = require('../../../relayers/get-relayer-by-slug');
const transformRelayer = require('./util/transform-relayer');

const createRouter = () => {
  const router = new Router({ prefix: '/relayers/:slug' });

  router.get('/', async ({ params, response }, next) => {
    const { slug } = params;
    const relayer = await getRelayerBySlug(slug);

    if (_.isNull(relayer)) {
      response.status = 404;
      await next();
      return;
    }

    const viewModel = transformRelayer(relayer);

    response.body = viewModel;

    await next();
  });

  return router;
};

module.exports = createRouter;
