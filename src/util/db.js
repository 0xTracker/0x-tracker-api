const mongoose = require('mongoose');
const signale = require('signale');

const { logError } = require('./error-logger');

const logger = signale.scope('mongodb');

mongoose.Promise = global.Promise;

module.exports = {
  connect: (connectionString, options = {}) => {
    mongoose.connect(connectionString, {
      poolSize: options.poolSize,
      useNewUrlParser: true,
    });

    // Queries should time out if they take longer than 10 seconds
    mongoose.set('maxTimeMS', 10000);

    mongoose.connection.on('connected', () => {
      logger.success('database connection established');
    });

    mongoose.connection.on('error', err => {
      logError(err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('database connection terminated');
    });
  },
  disconnect: () => {
    mongoose.disconnect();
  },
};
