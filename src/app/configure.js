const config = require('config');
const signale = require('signale');

const db = require('../util/db');
const errorLogger = require('../util/error-logger');

const logger = signale.scope('application');

const configure = () => {
  errorLogger.configure({
    bugsnagToken: config.get('bugsnag.token'),
  });
  db.connect(config.get('database.connectionString'));

  logger.success('application configured');
};

module.exports = configure;
