const _ = require('lodash');
const ms = require('ms');

module.exports = {
  appVersion: null,
  bugsnag: {
    token: _.get(process.env, 'BUGSNAG_TOKEN', null),
  },
  database: {
    connectionString: process.env.CONNECTION_STRING,
    poolSize: process.env.POOL_SIZE || 30,
  },
  elasticsearch: {
    password: _.get(process.env, 'ELASTIC_SEARCH_PASSWORD', null),
    url: _.get(process.env, 'ELASTIC_SEARCH_URL', null),
    username: _.get(process.env, 'ELASTIC_SEARCH_USERNAME', null),
  },
  pino: {
    elasticsearch: {
      batchSize: 200,
      index: 'logs_api',
      url: _.get(process.env, 'PINO_ELASTIC_SEARCH_URL', null),
    },
  },
  port: process.env.PORT || 3001,
  tokenCache: {
    pollingInterval: ms('1 minute'),
  },
};
