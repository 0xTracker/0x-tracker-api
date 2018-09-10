const signale = require('signale');

const logger = signale.scope('application');

const start = port => {
  if (process.env.NODE_ENV === 'development') {
    logger.start(`serving application at http://localhost:${port}`);
  } else {
    logger.start(`serving application on port ${port}`);
  }
};

module.exports = start;
