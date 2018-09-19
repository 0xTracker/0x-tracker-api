const _ = require('lodash');
const Router = require('koa-router');

const Fill = require('../../model/fill');
const getFilterForRelayer = require('../../relayers/get-filter-for-relayer');
const getTokens = require('../../tokens/get-tokens');
const searchFills = require('../../fills/search-fills');
const transformFill = require('../util/transform-fill');

const router = new Router({ prefix: '/fills' });

const DEFAULT_LIMIT = 50;
const DEFAULT_PAGE = 1;
const MAX_LIMIT = 100;
const MAX_PAGE = Infinity;

router.get('/', async ({ request, response }, next) => {
  const { address, token } = request.query;
  const relayerId = request.query.relayer;
  const query = request.query.q;
  const page = _.clamp(
    _.toNumber(_.get(request, 'query.page', DEFAULT_PAGE)),
    1,
    MAX_PAGE,
  );
  const limit = _.clamp(
    _.toNumber(_.get(request, 'query.limit', DEFAULT_LIMIT)),
    1,
    MAX_LIMIT,
  );

  const fills = await searchFills({
    address,
    page,
    limit,
    query,
    token,
    ...getFilterForRelayer(relayerId),
  });

  const tokens = await getTokens();

  response.body = {
    fills: fills.docs.map(fill => transformFill(fill, tokens)),
    limit: fills.limit,
    page: fills.page,
    pageCount: fills.pages,
    total: fills.total,
  };

  await next();
});

router.get('/:id', async ({ params, response }, next) => {
  const fill = await Fill.findById(params.id);

  if (fill === null) {
    response.status = 404;
    await next();
    return;
  }

  const tokens = await getTokens();
  response.body = transformFill(fill, tokens);

  await next();
});

module.exports = router;
