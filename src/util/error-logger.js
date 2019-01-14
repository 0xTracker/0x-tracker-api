const _ = require('lodash');
const bugsnag = require('@bugsnag/js');
const bugsnagKoa = require('@bugsnag/plugin-koa');
const signale = require('signale');

let bugsnagClient;

const logger = signale.scope('application');

const logError = (error, opts) => {
  const report = _.get(opts, 'report', false);

  if (bugsnagClient && report) {
    bugsnagClient.notify(error);
  }

  logger.error(error);
};

const configure = ({ appVersion, bugsnagToken }) => {
  if (_.isString(bugsnagToken)) {
    bugsnagClient = bugsnag({ apiKey: bugsnagToken, appVersion });
  }

  process.on('uncaughtException', logger.error);
  process.on('unhandledRejection', logger.error);
};

const attachToApp = app => {
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
