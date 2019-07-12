const _ = require('lodash');

const formatTokenAmount = require('../../../../tokens/format-token-amount');
const getCdnTokenImageUrl = require('../../../../tokens/get-cdn-token-image-url');

const formatStats = (stats, token) =>
  _.isEmpty(stats)
    ? undefined
    : {
        trades: stats.trades,
        volume: {
          token: _.has(token, 'decimals')
            ? formatTokenAmount(stats.volume.token, token).toString()
            : null,
          USD: stats.volume.USD,
        },
        volumeShare: stats.volumeShare,
      };

const transformToken = token => {
  const transformed = {
    address: token.address,
    imageUrl: token.imageUrl ? getCdnTokenImageUrl(token.imageUrl) : undefined,
    lastTrade: _.get(token, 'price.lastTrade'),
    name: token.name,
    price: _.has(token, 'price.lastPrice')
      ? {
          last: _.get(token, 'price.lastPrice'),
        }
      : undefined,
    stats:
      _.isEmpty(token.stats) || _.every(Object.values(token.stats), _.isEmpty)
        ? undefined
        : _.mapValues(token.stats, stats => formatStats(stats, token)),
    symbol: token.symbol,
  };

  return transformed;
};

module.exports = transformToken;
