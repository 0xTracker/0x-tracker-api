const _ = require('lodash');
const Router = require('koa-router');
const memoryCache = require('memory-cache');
const ms = require('ms');

const getTokens = require('../../tokens/get-tokens');
const Token = require('../../model/token');
const transformToken = require('../util/transform-token');

const router = new Router({ prefix: '/tokens' });

router.get('/', async ({ response }, next) => {
  const tokenModels = await getTokens();
  const tokens = _(tokenModels)
    .map(transformToken)
    .sortBy('symbol')
    .value();

  response.body = tokens;

  await next();
});

router.get('/:tokenAddress', async ({ params, response }, next) => {
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

module.exports = router;
