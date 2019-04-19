const _ = require('lodash');
const Router = require('koa-router');

const Token = require('../../../model/token');
const transformToken = require('./util/transform-token');

const createRouter = ({ transformer } = {}) => {
  const router = new Router();

  router.get('/tokens/:tokenAddress', async ({ params, response }, next) => {
    const token = await Token.findOne({ address: params.tokenAddress }).lean();

    if (_.isNull(token)) {
      response.status = 404;
      await next();
      return;
    }

    response.body = transformer ? transformer(token) : transformToken(token);

    await next();
  });

  return router;
};

module.exports = createRouter;
