const body = require('koa-body');
const compress = require('koa-compress');
const etag = require('koa-etag');
const helmet = require('koa-helmet');
const Koa = require('koa');

const { getLogger } = require('../util/logging');
const errorLogger = require('../util/error-logger');
const middleware = require('./middleware');
const router = require('./routes');

const start = port => {
  const logger = getLogger('application');
  const app = new Koa();

  errorLogger.attachToApp(app);

  app.use(middleware.error());
  app.use(helmet());
  app.use(middleware.cors());
  app.use(compress());
  app.use(etag());
  app.use(middleware.cacheControl());
  app.use(body());
  app.use(router.routes());
  app.use(router.allowedMethods());
  app.use(middleware.invalidUrl());
  app.listen(port);

  if (process.env.NODE_ENV === 'development') {
    logger.info(`serving application at http://localhost:${port}`);
  } else {
    logger.info(`serving application on port ${port}`);
  }
};

module.exports = start;
