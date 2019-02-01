const _ = require('lodash');
const Router = require('koa-router');

const getAllRelayers = require('../../../relayers/get-all-relayers');

const createRouter = () => {
  const router = new Router({ prefix: '/relayers' });

  router.get('/', async ({ response }, next) => {
    const relayers = _.map(getAllRelayers(), relayer =>
      _.pick(relayer, ['id', 'imageUrl', 'name', 'slug', 'url']),
    );

    response.body = relayers;
    await next();
  });

  return router;
};

module.exports = createRouter;
