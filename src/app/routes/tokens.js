const _ = require('lodash');
const Router = require('koa-router');
const memoryCache = require('memory-cache');
const ms = require('ms');

const Token = require('../../model/token');
const transformToken = require('../util/transform-token');

const router = new Router({ prefix: '/tokens' });

router.get('/', async ({ response }, next) => {
  const cacheKey = 'tokens';
  const cachedTokens = memoryCache.get(cacheKey);

  if (_.isArray(cachedTokens)) {
    response.body = cachedTokens;
    await next();
    return;
  }

  const tokenModels = await Token.find();
  const tokens = _(tokenModels)
    .map(transformToken)
    .sortBy('symbol')
    .value();

  memoryCache.put(cacheKey, tokens, ms('1 minute'));

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

  memoryCache.put(cacheKey, token, ms('5 seconds'));
  response.body = transformToken(token);
  await next();
});

module.exports = router;
