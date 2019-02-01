const _ = require('lodash');
const Router = require('koa-router');
const memoryCache = require('memory-cache');
const ms = require('ms');

const Token = require('../../../model/token');
const transformToken = require('./util/transform-token');

const createRouter = () => {
  const router = new Router();

  router.get('/tokens/:tokenAddress', async ({ params, response }, next) => {
    const cacheKey = `tokens.${params.tokenAddress}`;
    const cachedToken = memoryCache.get(cacheKey);

    if (_.isObject(cachedToken)) {
      response.body = transformToken(cachedToken);
      await next();
      return;
    }

    const token = await Token.findOne({ address: params.tokenAddress });

    if (_.isNull(token)) {
      response.status = 404;
      await next();
      return;
    }

    memoryCache.put(cacheKey, token, ms('1 minute'));
    response.body = transformToken(token);
    await next();
  });

  return router;
};

module.exports = createRouter;
