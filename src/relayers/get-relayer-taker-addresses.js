const _ = require('lodash');

const getRelayers = require('./get-relayers');

const getRelayerTakerAddresses = async () => {
  const relayers = await getRelayers();
  const addresses = _(relayers)
    .map(relayer => relayer.takerAddresses)
    .flatten()
    .compact()
    .value();

  return addresses;
};

module.exports = getRelayerTakerAddresses;
