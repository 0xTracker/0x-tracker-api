const _ = require('lodash');

const AddressMetadata = require('../model/address-metadata');
const checkTraderExists = require('./check-trader-exists');

const getTrader = async address => {
  const exists = await checkTraderExists(address);

  if (!exists) {
    return null;
  }

  const addressMetadata = await AddressMetadata.findOne({ address }).lean();

  if (addressMetadata === null) {
    return { address, name: null };
  }

  return {
    address,
    description: _.get(addressMetadata, 'description', null),
    imageUrl: _.get(addressMetadata, 'imageUrl', null),
    name: _.get(addressMetadata, 'name', null),
    url: _.get(addressMetadata, 'url', null),
  };
};

module.exports = getTrader;
