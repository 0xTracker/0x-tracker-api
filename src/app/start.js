const compress = require('koa-compress');
const etag = require('koa-etag');
const helmet = require('koa-helmet');
const Koa = require('koa');

const errorLogger = require('../util/error-logger');
const logging = require('../util/logging');
const middleware = require('./middleware');
const routes = require('./routes');

const start = port => {
  const logger = logging.getLogger('application');
  const app = new Koa();

  errorLogger.attachToApp(app);

  app.use(logging.getMiddleware());
  app.use(middleware.error());
  app.use(helmet());
  app.use(middleware.cors());
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
