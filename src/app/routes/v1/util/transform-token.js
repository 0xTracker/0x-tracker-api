const _ = require('lodash');

const { TOKEN_TYPE } = require('../../../../constants');
const formatTokenType = require('../../../../tokens/format-token-type');
const getCdnTokenImageUrl = require('../../../../tokens/get-cdn-token-image-url');

const transformToken = (token, price, stats, statsPeriod) => {
  return {
    address: token.address,
    imageUrl: _.isString(token.imageUrl)
      ? getCdnTokenImageUrl(token.imageUrl)
      : undefined,
    lastTrade: _.isObject(price)
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
      close:
        token.type === TOKEN_TYPE.ERC20 ? _.get(price, 'priceUSD', null) : null,
      high:
        token.type === TOKEN_TYPE.ERC20
          ? _.get(price, 'maxPriceUSD', null)
          : null,
      last:
        token.type === TOKEN_TYPE.ERC20 ? _.get(price, 'priceUSD', null) : null,
      low:
        token.type === TOKEN_TYPE.ERC20
          ? _.get(price, 'minPriceUSD', null)
          : null,
      open:
        token.type === TOKEN_TYPE.ERC20
          ? _.get(price, 'openPriceUSD', null)
          : null,
    },
    stats,
    statsPeriod,
    symbol: token.symbol,
    type: formatTokenType(token.type),
  };
};

module.exports = transformToken;
