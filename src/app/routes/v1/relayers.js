const Router = require('koa-router');

const Relayer = require('../../../model/relayer');
const transformRelayer = require('./util/transform-relayer');

const createRouter = () => {
  const router = new Router({ prefix: '/relayers' });

  router.get('/', async ({ response }, next) => {
    const relayers = await Relayer.find();
    const viewModels = relayers.map(transformRelayer);

    response.body = viewModels;

    await next();
  });

  return router;
};

module.exports = createRouter;
