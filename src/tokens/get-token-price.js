const _ = require('lodash');

const getTokenPrices = require('./get-token-prices');

const getTokenPrice = async (address, period) => {
  const tokenPrices = await getTokenPrices([address], period);

  return _.get(tokenPrices, 0, null);
};

module.exports = getTokenPrice;
