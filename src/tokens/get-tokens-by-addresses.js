const _ = require('lodash');

const { getTokens } = require('./token-cache');

const getTokensByAddresses = addresses => {
  if (addresses.length === 0) {
    return {};
  }

  const allTokens = getTokens();

  return _.pick(allTokens, addresses);
};

module.exports = getTokensByAddresses;
