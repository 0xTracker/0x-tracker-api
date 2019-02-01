const compress = require('koa-compress');
const consoleLogger = require('koa-logger');
const cors = require('koa-cors');
const helmet = require('koa-helmet');
const Koa = require('koa');
const signale = require('signale');

const error = require('./middleware/error');
const errorLogger = require('../util/error-logger');
const invalidUrl = require('./middleware/invalid-url');
const routes = require('./routes');

const logger = signale.scope('application');

const start = port => {
  const app = new Koa();

  errorLogger.attachToApp(app);

  app.use(error());
  app.use(helmet());
  app.use(cors());
  app.use(consoleLogger());
  app.use(compress());
  app.use(routes);
  app.use(invalidUrl());

  app.listen(port);

  if (process.env.NODE_ENV === 'development') {
    logger.start(`serving application at http://localhost:${port}`);
  } else {
    logger.start(`serving application on port ${port}`);
  }
};

module.exports = start;
