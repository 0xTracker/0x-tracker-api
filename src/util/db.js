const mongoose = require('mongoose');

const { logError } = require('./error-logger');
const { getLogger } = require('./logging');

mongoose.Promise = global.Promise;
mongoose.set('debug', process.env.MONGOOSE_DEBUG === 'true');

module.exports = {
  connect: (connectionString, options = {}) => {
    const logger = getLogger('database');

    mongoose.connect(connectionString, {
      poolSize: options.poolSize,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Queries should time out if they take longer than 10 seconds
    mongoose.set('maxTimeMS', 10000);

    mongoose.connection.on('connected', () => {
      logger.info('database connection established');
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
