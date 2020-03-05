const compress = require('koa-compress');
const consoleLogger = require('koa-logger');
const etag = require('koa-etag');
const helmet = require('koa-helmet');
const Koa = require('koa');
const signale = require('signale');

const errorLogger = require('../util/error-logger');
const middleware = require('./middleware');
const routes = require('./routes');

const logger = signale.scope('application');

const start = port => {
  const app = new Koa();

  errorLogger.attachToApp(app);

  app.use(middleware.error());
  app.use(helmet());
  app.use(middleware.cors());
  app.use(consoleLogger());
  app.use(compress());
  app.use(etag());
  app.use(middleware.cacheControl());
  app.use(routes);
  app.use(middleware.invalidUrl());

  app.listen(port);

  if (process.env.NODE_ENV === 'development') {
    logger.info(`serving application at http://localhost:${port}`);
  } else {
    logger.info(`serving application on port ${port}`);
  }
};

module.exports = start;
