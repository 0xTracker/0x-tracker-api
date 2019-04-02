const _ = require('lodash');
const Router = require('koa-router');

const Fill = require('../../../model/fill');
const getRelayerLookupId = require('../../../relayers/get-relayer-lookup-id');
const getTokens = require('../../../tokens/get-tokens');
const pagination = require('../../middleware/pagination');
const Relayer = require('../../../model/relayer');
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

      const relayerLookupId = await getRelayerLookupId(relayerId);

      const { docs, pages, total } = await searchFills({
        address,
        limit,
        page,
        query,
        relayerId: relayerLookupId,
        token,
      });

      const tokens = await getTokens();
      const relayers = await Relayer.find().lean();

      response.body = {
        fills: docs.map(_.partial(transformFill, tokens, relayers)),
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
    const relayers = await Relayer.find().lean();

    response.body = transformFill(tokens, relayers, fill);

    await next();
  });

  return router;
};

module.exports = createRouter;
