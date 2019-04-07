const _ = require('lodash');
const Router = require('koa-router');

const getRelayers = require('../../../relayers/get-relayers');
const transformRelayer = require('./util/transform-relayer');

const createRouter = () => {
  const router = new Router({ prefix: '/relayers' });

  router.get('/', async ({ response }, next) => {
    const relayers = await getRelayers();
    const viewModels = _.map(relayers, transformRelayer);

    response.body = viewModels;

    await next();
  });

  return router;
};

module.exports = createRouter;
