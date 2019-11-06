const moment = require('moment');
const mongoose = require('mongoose');
const Router = require('koa-router');

const { getTokens } = require('../../../tokens/token-cache');
const Fill = require('../../../model/fill');
const getRelayerLookupId = require('../../../relayers/get-relayer-lookup-id');
const getRelayers = require('../../../relayers/get-relayers');
const InvalidParameterError = require('../../errors/invalid-parameter-error');
const pagination = require('../../middleware/pagination');
const searchFills = require('../../../fills/search-fills');
const transformFill = require('./util/transform-fill');
const transformFills = require('./util/transform-fills');

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

      if (relayerId !== undefined && relayerLookupId === undefined) {
        throw new InvalidParameterError(
          `No relayer exists with an ID of "${relayerId}"`,
          `Invalid query parameter: relayer`,
        );
      }

      const { docs, pages, total } = await searchFills(
        {
          address,
          dateFrom: moment().subtract(6, 'months'),
          query,
          relayerId: relayerLookupId,
          token,
        },
        { limit, page },
      );

      const tokens = getTokens();
      const relayers = await getRelayers();

      response.body = {
        fills: transformFills(tokens, relayers, docs),
        limit,
        page,
        pageCount: pages,
        total,
      };

      await next();
    },
  );

  router.get('/:id', async ({ params, response }, next) => {
    const fillId = params.id;
    const fill = mongoose.Types.ObjectId.isValid(fillId)
      ? await Fill.findById(fillId)
      : null;

    if (fill === null) {
      response.status = 404;
      await next();
      return;
    }

    const tokens = getTokens();
    const relayers = await getRelayers();

    response.body = transformFill(tokens, relayers, fill);

    await next();
  });

  return router;
};

module.exports = createRouter;
