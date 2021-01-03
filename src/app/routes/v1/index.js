const Router = require('koa-router');

const createAddressesRouter = require('./addresses');
const createAdSlotsRouter = require('./ad-slots');
const createAppRouter = require('./app');
const createAppLookupRouter = require('./app-lookup');
const createAppsRouter = require('./apps');
const createArticlesRouter = require('./articles');
const createArticleSourcesRouter = require('./article-sources');
const createAssetBridgesRouter = require('./asset-bridges');
const createFillsRouter = require('./fills');
const createMetricsRouter = require('./metrics');
const createProtocolsRouter = require('./protocols');
const createRatesRouter = require('./rates');
const createRelayerRouter = require('./relayer');
const createRelayersRouter = require('./relayers');
const createStatsRouter = require('./stats');
const createTokenLookupRouter = require('./token-lookup');
const createTokenRouter = require('./token');
const createTokensRouter = require('./tokens');
const createTraderRouter = require('./trader');
const createTraderLookupRouter = require('./trader-lookup');
const createTradersRouter = require('./traders');
const createZrxPriceRouter = require('./zrx-price');

const createRouter = () => {
  const router = new Router();

  router.use(
    createAdSlotsRouter().routes(),
    createAddressesRouter().routes(),
    createAppRouter().routes(),
    createAppLookupRouter().routes(),
    createAppsRouter().routes(),
    createArticlesRouter().routes(),
    createArticleSourcesRouter().routes(),
    createFillsRouter().routes(),
    createMetricsRouter().routes(),
    createProtocolsRouter().routes(),
    createRatesRouter().routes(),
    createRelayerRouter().routes(),
    createRelayersRouter().routes(),
    createStatsRouter().routes(),
    createTokenLookupRouter().routes(),
    createTokenRouter().routes(),
    createTokensRouter().routes(),
    createTraderRouter().routes(),
    createTraderLookupRouter().routes(),
    createTradersRouter().routes(),
    createZrxPriceRouter().routes(),
    createAssetBridgesRouter().routes(),
  );

  return router;
};

module.exports = createRouter;
