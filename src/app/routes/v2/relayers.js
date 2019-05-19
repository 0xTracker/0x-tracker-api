const Router = require('koa-router');

const pagination = require('../../middleware/pagination');
const Relayer = require('../../../model/relayer');
const transformRelayer = require('./util/transform-relayer');

const SORT_BY_DEFAULT = '24h-volume-share';
const SORT_BY_MAPPINGS = {
  '24h-volume-share': 'stats.24h.volumeShare',
  '7d-volume-share': 'stats.7d.volumeShare',
  '1m-volume-share': 'stats.1m.volumeShare',
};

const createRouter = () => {
  const router = new Router();

  router.get(
    '/relayers',
    pagination({ defaultLimit: 20, maxLimit: 50, maxPage: Infinity }),
    async ({ pagination: { limit, page }, request, response }, next) => {
      const sortBy =
        SORT_BY_MAPPINGS[request.query.sortBy] ||
        SORT_BY_MAPPINGS[SORT_BY_DEFAULT];

      const { docs, pages, total } = await Relayer.paginate(undefined, {
        select: 'id imageUrl name slug stats url',
        sort: { [sortBy]: -1 },
        lean: true,
        limit,
        page,
      });

      response.body = {
        limit,
        page,
        pageCount: pages,
        relayers: docs.map(transformRelayer),
        total,
      };

      await next();
    },
  );

  return router;
};

module.exports = createRouter;
