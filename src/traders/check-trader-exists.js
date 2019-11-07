const AddressMetric = require('../model/address-metric');

const checkTraderExists = async address => {
  const results = await AddressMetric.distinct('address', { address });

  return results.length === 1;
};

module.exports = checkTraderExists;
