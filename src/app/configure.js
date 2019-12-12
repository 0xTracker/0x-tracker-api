const config = require('config');
const signale = require('signale');

const db = require('../util/db');
const elasticsearch = require('../util/elasticsearch');
const errorLogger = require('../util/error-logger');

const logger = signale.scope('application');

const configure = () => {
  errorLogger.configure({
    appVersion: config.get('appVersion'),
    bugsnagToken: config.get('bugsnag.token'),
  });
  db.connect(config.get('database.connectionString'), {
    poolSize: config.get('database.poolSize'),
  });
  elasticsearch.configure({
    node: config.get('elasticsearch.url'),
    auth: {
      username: config.get('elasticsearch.username'),
      password: config.get('elasticsearch.password'),
    },
  });

  logger.success('application configured');
};

module.exports = configure;
