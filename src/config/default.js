const _ = require('lodash');

module.exports = {
  appVersion: null,
  bugsnag: {
    token: _.get(process.env, 'BUGSNAG_TOKEN', null),
  },
  database: {
    connectionString: process.env.CONNECTION_STRING,
  },
  port: process.env.PORT || 3001,
};
