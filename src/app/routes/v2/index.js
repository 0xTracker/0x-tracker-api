const Router = require('koa-router');

const createArticlesRouter = require('../v1/articles');
const createArticleSourcesRouter = require('../v1/article-sources');
const createFillsRouter = require('../v1/fills');
const createMetricsRouter = require('../v1/metrics');
const createRelayersRouter = require('../v1/relayers');
const createTokenRouter = require('../v1/token');
const createTokensRouter = require('./tokens');

const createRouter = () => {
  const router = new Router();

  router.use(
    createArticlesRouter().routes(),
    createArticleSourcesRouter().routes(),
    createFillsRouter().routes(),
    createMetricsRouter().routes(),
    createRelayersRouter().routes(),
    createTokenRouter().routes(),
    createTokensRouter().routes(),
  );

  return router;
};

module.exports = createRouter;
