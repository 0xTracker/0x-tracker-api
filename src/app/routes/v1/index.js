const Router = require('koa-router');

const createAdSlotsRouter = require('./ad-slots');
const createArticlesRouter = require('./articles');
const createArticleSourcesRouter = require('./article-sources');
const createAssetBridgesRouter = require('./asset-bridges');
const createFillsRouter = require('./fills');
const createMetricsRouter = require('./metrics');
const createProtocolsRouter = require('./protocols');
const createRelayerRouter = require('./relayer');
const createRelayersRouter = require('./relayers');
const createStatsRouter = require('./stats');
const createTokenRouter = require('./token');
const createTokensRouter = require('./tokens');
const createTradersRouter = require('./traders');
const createZrxPriceRouter = require('./zrx-price');

const createRouter = () => {
  const router = new Router();

  router.use(
    createAdSlotsRouter().routes(),
    createArticlesRouter().routes(),
    createArticleSourcesRouter().routes(),
    createFillsRouter().routes(),
    createMetricsRouter().routes(),
    createProtocolsRouter().routes(),
    createRelayerRouter().routes(),
    createRelayersRouter().routes(),
    createStatsRouter().routes(),
    createTokenRouter().routes(),
    createTokensRouter().routes(),
    createTradersRouter().routes(),
    createZrxPriceRouter().routes(),
    createAssetBridgesRouter().routes(),
  );

  return router;
};

module.exports = createRouter;
