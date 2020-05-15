const AddressMetadata = require('../model/address-metadata');
const checkTraderExists = require('./check-trader-exists');

const getTrader = async address => {
  const addressMetadata = await AddressMetadata.findOne({ address }).lean();

  if (addressMetadata === null) {
    const exists = await checkTraderExists(address);

    if (!exists) {
      return null;
    }

    return { address, name: null };
  }

  return {
    address,
    description: addressMetadata.description,
    name: addressMetadata.name,
  };
};

module.exports = getTrader;
