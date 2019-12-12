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
  port: process.env.PORT || 3001,
  tokenCache: {
    pollingInterval: ms('1 minute'),
  },
};
