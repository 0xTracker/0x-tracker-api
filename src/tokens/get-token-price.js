const _ = require('lodash');

const getDatesForTimePeriod = require('../util/get-dates-for-time-period');
const getTokenPrices = require('./get-token-prices');

const getTokenPrice = async (address, period) => {
  const { dateFrom, dateTo } = getDatesForTimePeriod(period);
  const tokenPrices = await getTokenPrices([address], {
    from: dateFrom,
    to: dateTo,
  });

  return _.get(tokenPrices, 0, null);
};

module.exports = getTokenPrice;
