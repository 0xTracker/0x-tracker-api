const _ = require('lodash');

const getCdnTokenImageUrl = require('../../../../tokens/get-cdn-token-image-url');

const transformToken = token => {
  const transformed = {
    address: token.address,
    imageUrl: token.imageUrl ? getCdnTokenImageUrl(token.imageUrl) : undefined,
    lastTrade: _.get(token, 'price.lastTrade'),
    name: token.name,
    price: {
      last: _.get(token, 'price.lastPrice'),
    },
    symbol: token.symbol,
  };

  return transformed;
};

module.exports = transformToken;
