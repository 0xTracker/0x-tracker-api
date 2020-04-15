const _ = require('lodash');

const { TOKEN_TYPE } = require('../../../../constants');
const formatTokenType = require('../../../../tokens/format-token-type');
const getCdnTokenImageUrl = require('../../../../tokens/get-cdn-token-image-url');

const getOptionalTokenValue = (token, key) =>
  _.isNil(token[key]) ? null : token[key];

const calculateMarketCap = (circulatingSupply, totalSupply, currentPrice) => {
  const supply = circulatingSupply !== null ? circulatingSupply : totalSupply;

  if (currentPrice === null || supply === null) {
    return null;
  }

  return supply * currentPrice;
};

const transformToken = (token, tokenPrice, stats, statsPeriod) => {
  const circulatingSupply = getOptionalTokenValue(token, 'circulatingSupply');
  const name = getOptionalTokenValue(token, 'name');
  const symbol = getOptionalTokenValue(token, 'symbol');
  const totalSupply = getOptionalTokenValue(token, 'totalSupply');
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

  const marketCap = calculateMarketCap(
    circulatingSupply,
    totalSupply,
    price.close,
  );

  return {
    address: token.address,
    circulatingSupply,
    imageUrl,
    lastTrade,
    marketCap,
    name,
    price,
    stats,
    statsPeriod,
    symbol,
    totalSupply,
    type,
  };
};

module.exports = transformToken;
