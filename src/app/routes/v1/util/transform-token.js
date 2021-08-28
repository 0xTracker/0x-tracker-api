const _ = require('lodash');

const formatTokenType = require('../../../../tokens/format-token-type');
const getCdnTokenImageUrl = require('../../../../tokens/get-cdn-token-image-url');

const getOptionalTokenValue = (token, key) =>
  _.isNil(token[key]) ? null : token[key];

const transformToken = (token, stats, statsPeriod) => {
  const name = getOptionalTokenValue(token, 'name');
  const symbol = getOptionalTokenValue(token, 'symbol');
  const type = formatTokenType(token.type);

  const imageUrl = _.isString(token.imageUrl)
    ? getCdnTokenImageUrl(token.imageUrl)
    : null;

  return {
    address: token.address,
    imageUrl,
    name,
    price: stats.price,
    stats: {
      tradeCount: stats.tradeCount,
      tradeCountChange: stats.tradeCountChange,
      tradeVolume: stats.tradeVolume,
      tradeVolumeChange: stats.tradeVolumeChange,
    },
    statsPeriod,
    symbol,
    type,
  };
};

module.exports = transformToken;
