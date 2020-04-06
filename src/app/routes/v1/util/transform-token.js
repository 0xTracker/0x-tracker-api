const _ = require('lodash');

const { TOKEN_TYPE } = require('../../../../constants');
const formatTokenType = require('../../../../tokens/format-token-type');
const getCdnTokenImageUrl = require('../../../../tokens/get-cdn-token-image-url');

const transformToken = (token, price) => {
  return {
    address: token.address,
    imageUrl: _.isString(token.imageUrl)
      ? getCdnTokenImageUrl(token.imageUrl)
      : undefined,
    lastTrade:
      price !== null
        ? {
            date: price.date,
            id: price.fillId,
          }
        : null,
    name: token.name,
    price: {
      change:
        token.type === TOKEN_TYPE.ERC20
          ? _.get(price, 'priceChange', null)
          : null,
      last:
        token.type === TOKEN_TYPE.ERC20 ? _.get(price, 'priceUSD', null) : null,
    },
    symbol: token.symbol,
    type: formatTokenType(token.type),
  };
};

module.exports = transformToken;
