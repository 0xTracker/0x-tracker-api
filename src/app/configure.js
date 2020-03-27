const config = require('config');

const db = require('../util/db');
const elasticsearch = require('../util/elasticsearch');
const errorLogger = require('../util/error-logger');
const logging = require('../util/logging');

const configure = () => {
  logging.init(config.get('pino'));
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
};

module.exports = configure;
