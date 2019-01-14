const _ = require('lodash');
const bugsnag = require('@bugsnag/js');
const signale = require('signale');

let bugsnagClient;

const logger = signale.scope('application');

const logError = error => {
  if (bugsnagClient) {
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

module.exports = {
  configure,
  logError,
};
