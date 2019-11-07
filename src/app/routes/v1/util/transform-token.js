const _ = require('lodash');

const formatTokenType = require('../../../../tokens/format-token-type');
const getCdnTokenImageUrl = require('../../../../tokens/get-cdn-token-image-url');

const transformToken = token => {
  return {
    address: token.address,
    imageUrl:
      token.imageUrl !== undefined
        ? getCdnTokenImageUrl(token.imageUrl)
        : undefined,
    lastTrade: _.get(token, 'price.lastTrade'),
    name: token.name,
    price: _.isNumber(token, 'price.lastPrice')
      ? {
          ...token.price,
          last: token.price.lastPrice,
        }
      : undefined,
    symbol: token.symbol,
    type: formatTokenType(token.type),
  };
};

module.exports = transformToken;
