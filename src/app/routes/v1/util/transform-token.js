const _ = require('lodash');

const { TOKEN_TYPE } = require('../../../../constants');
const formatTokenType = require('../../../../tokens/format-token-type');
const getCdnTokenImageUrl = require('../../../../tokens/get-cdn-token-image-url');

const getOptionalTokenValue = (token, key) =>
  _.isNil(token[key]) ? null : token[key];

const transformToken = (token, tokenPrice, stats, statsPeriod) => {
  const name = getOptionalTokenValue(token, 'name');
  const symbol = getOptionalTokenValue(token, 'symbol');
  const type = formatTokenType(token.type);

  const price =
    token.type === TOKEN_TYPE.ERC20
      ? {
          change: _.get(tokenPrice, 'priceChange', null),
          close: _.get(tokenPrice, 'priceUSD', null),
          high: _.get(tokenPrice, 'maxPriceUSD', null),
          last: _.get(tokenPrice, 'priceUSD', null),
          low: _.get(tokenPrice, 'minPriceUSD', null),
          open: _.get(tokenPrice, 'openPriceUSD', null),
        }
      : {
          change: null,
          close: null,
          high: _.get(tokenPrice, 'maxPriceUSD', null),
          last: null,
          low: _.get(tokenPrice, 'minPriceUSD', null),
          open: null,
        };

  const imageUrl = _.isString(token.imageUrl)
    ? getCdnTokenImageUrl(token.imageUrl)
    : null;

  const lastTrade =
    _.get(tokenPrice, 'fillId', null) !== null
      ? {
          date: tokenPrice.date,
          id: tokenPrice.fillId,
        }
      : null;

  return {
    address: token.address,
    imageUrl,
    lastTrade,
    name,
    price,
    stats,
    statsPeriod,
    symbol,
    type,
  };
};

module.exports = transformToken;
