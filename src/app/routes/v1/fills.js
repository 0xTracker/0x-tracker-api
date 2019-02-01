const Router = require('koa-router');

const Fill = require('../../../model/fill');
const getFilterForRelayer = require('../../../relayers/get-filter-for-relayer');
const getTokens = require('../../../tokens/get-tokens');
const pagination = require('../../middleware/pagination');
const searchFills = require('../../../fills/search-fills');
const transformFill = require('./util/transform-fill');

const createRouter = () => {
  const router = new Router({ prefix: '/fills' });

  router.get(
    '/',
    pagination({ defaultLimit: 20, maxLimit: 50, maxPage: Infinity }),
    async ({ pagination: { limit, page }, request, response }, next) => {
      const { address, token } = request.query;
      const relayerId = request.query.relayer;
      const query = request.query.q;

      const { docs, pages, total } = await searchFills({
        address,
        page,
        limit,
        query,
        token,
        ...getFilterForRelayer(relayerId),
      });

      const tokens = await getTokens();

      response.body = {
        fills: docs.map(fill => transformFill(fill, tokens)),
        limit,
        page,
        pageCount: pages,
        total,
      };

      await next();
    },
  );

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

  return router;
};

module.exports = createRouter;
