const _ = require('lodash');
const Router = require('koa-router');

const getTrader = require('../../../traders/get-trader');

const createRouter = () => {
  const router = new Router({ prefix: '/traders/:address' });

  router.get('/', async ({ params, response }, next) => {
    const { address } = params;
    const trader = await getTrader(address);

    if (_.isNull(trader)) {
      response.status = 404;
      await next();
      return;
    }

    response.body = trader;

    await next();
  });

  return router;
};

module.exports = createRouter;
