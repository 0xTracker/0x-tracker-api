const _ = require('lodash');
const bugsnag = require('@bugsnag/js');
const bugsnagKoa = require('@bugsnag/plugin-koa');

const { getLogger } = require('./logging');

let bugsnagClient;

const logError = (error, metadata) => {
  const logger = getLogger('application');

  if (bugsnagClient) {
    bugsnagClient.notify(error, metadata);
  }

  logger.error(error);
};

const configure = ({ appVersion, bugsnagToken }) => {
  const logger = getLogger('application');

  if (_.isString(bugsnagToken)) {
    bugsnagClient = bugsnag({ apiKey: bugsnagToken, appVersion });
  }

  process.on('uncaughtException', logger.error);
  process.on('unhandledRejection', logger.error);
};

const attachToApp = app => {
  const logger = getLogger('application');

  if (bugsnagClient) {
    bugsnagClient.use(bugsnagKoa);

    const bugsnagMiddleware = bugsnagClient.getPlugin('koa');

    app.use(bugsnagMiddleware.requestHandler);
    app.on('error', bugsnagMiddleware.errorHandler);
  }

  app.on('error', error => {
    logger.error(error);
  });
};

module.exports = {
  attachToApp,
  configure,
  logError,
};
