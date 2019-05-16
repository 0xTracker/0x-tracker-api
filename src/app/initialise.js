const config = require('config');

const configure = require('./configure');
const tokenCache = require('../tokens/token-cache');

const initialise = async () => {
  configure();

  await tokenCache.initialise({
    pollingInterval: config.get('tokenCache.pollingInterval'),
  });
};

module.exports = initialise;
