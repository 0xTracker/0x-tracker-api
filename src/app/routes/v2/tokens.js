const Router = require('koa-router');

const pagination = require('../../middleware/pagination');
const Token = require('../../../model/token');
const transformToken = require('./util/transform-token');

const SORT_BY_DEFAULT = '24h-volume-share';
const SORT_BY_MAPPINGS = {
  '24h-volume-share': 'stats.24h.volumeShare',
  '7d-volume-share': 'stats.7d.volumeShare',
  '1m-volume-share': 'stats.1m.volumeShare',
};

const createRouter = () => {
  const router = new Router();

  router.get(
    '/tokens',
    pagination({ defaultLimit: 20, maxLimit: 50, maxPage: Infinity }),
    async ({ pagination: { limit, page }, request, response }, next) => {
      const sortBy =
        SORT_BY_MAPPINGS[request.query.sortBy] ||
        SORT_BY_MAPPINGS[SORT_BY_DEFAULT];
      const { resolved } = request.query;

      const { docs, pages, total } = await Token.paginate(
        resolved !== undefined
          ? { resolved: resolved === 'true' ? { $in: [null, true] } : false }
          : undefined,
        {
          sort: { [sortBy]: -1 },
          lean: true,
          limit,
          page,
        },
      );

      response.body = {
        limit,
        page,
        pageCount: pages,
        tokens: docs.map(transformToken),
        total,
      };

      await next();
    },
  );

  return router;
};

module.exports = createRouter;
