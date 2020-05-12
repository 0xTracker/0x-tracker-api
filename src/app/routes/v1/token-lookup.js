const _ = require('lodash');
const Router = require('koa-router');

const formatTokenType = require('../../../tokens/format-token-type');
const getCdnTokenImageUrl = require('../../../tokens/get-cdn-token-image-url');
const searchTokens = require('../../../tokens/search-tokens');

const createRouter = () => {
  const router = new Router();

  router.get('/token-lookup', async ({ request, response }, next) => {
    const { q } = request.query;

    const limit =
      request.query.limit !== undefined ? _.toNumber(request.query.limit) : 5;
    const tokens = await searchTokens(q, { limit });

    response.body = {
      limit,
      tokens: tokens.map(token => ({
        address: token.address,
        circulatingSupply: _.get(token, 'circulatingSupply', null),
        imageUrl: _.isString(token.imageUrl)
          ? getCdnTokenImageUrl(token.imageUrl)
          : null,
        name: _.get(token, 'name', null),
        symbol: _.get(token, 'symbol', null),
        totalSupply: _.get(token, 'totalSupply', null),
        type: formatTokenType(token.type),
      })),
      q,
    };

    await next();
  });

  return router;
};

module.exports = createRouter;
