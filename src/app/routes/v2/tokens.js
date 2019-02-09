const Router = require('koa-router');

const pagination = require('../../middleware/pagination');
const Token = require('../../../model/token');
const transformToken = require('./util/transform-token');

const createRouter = () => {
  const router = new Router();

  router.get(
    '/tokens',
    pagination({ defaultLimit: 20, maxLimit: 50, maxPage: Infinity }),
    async ({ pagination: { limit, page }, response }, next) => {
      const { docs, pages, total } = await Token.paginate(undefined, {
        sort: { date: -1 },
        lean: true,
        limit,
        page,
      });

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
