const _ = require('lodash');
const Router = require('koa-router');

const getTokens = require('../../../tokens/get-tokens');
const transformToken = require('./util/transform-token');

const createRouter = () => {
  const router = new Router();

  router.get('/tokens', async ({ response }, next) => {
    const tokenModels = await getTokens();
    const tokens = _(tokenModels)
      .map(transformToken)
      .sortBy('symbol')
      .value();

    response.body = tokens;

    await next();
  });

  return router;
};

module.exports = createRouter;
