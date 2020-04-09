const _ = require('lodash');

const getTokenPriceMetrics = require('./get-token-price-metrics');
const getTokenVolumeMetrics = require('./get-token-volume-metrics');

const getTokenMetrics = async (tokenAddress, period, granularity) => {
  const [volumeMetrics, priceMetrics] = await Promise.all([
    getTokenVolumeMetrics(tokenAddress, period, granularity),
    getTokenPriceMetrics(tokenAddress, period, granularity),
  ]);

  const metrics = volumeMetrics.map(x => {
    const price = priceMetrics.find(
      y => y.date.toISOString() === x.date.toISOString(),
    );

    return {
      ...x,
      price: {
        close: _.get(price, 'close', null),
      },
    };
  });

  return metrics;
};

module.exports = getTokenMetrics;
