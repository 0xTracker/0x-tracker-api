const Router = require('koa-router');

const createAddressesRouter = require('./addresses');
const createArticlesRouter = require('./articles');
const createArticleSourcesRouter = require('./article-sources');
const createFillsRouter = require('./fills');
const createMetricsRouter = require('./metrics');
const createRelayersRouter = require('./relayers');
const createStatsRouter = require('./stats');
const createTokenRouter = require('./token');
const createTokensRouter = require('./tokens');
const createTradersRouter = require('./traders');
const createZrxPriceRouter = require('./zrx-price');

const createRouter = () => {
  const router = new Router();

  router.use(
    createAddressesRouter().routes(),
    createArticlesRouter().routes(),
    createArticleSourcesRouter().routes(),
    createFillsRouter().routes(),
    createMetricsRouter().routes(),
    createRelayersRouter().routes(),
    createStatsRouter().routes(),
    createTokenRouter().routes(),
    createTokensRouter().routes(),
    createTradersRouter().routes(),
    createZrxPriceRouter().routes(),
  );

  return router;
};

module.exports = createRouter;
