const { KNOWN_ASSET_BRIDGES } = require('../constants');

const getAssetBridgeName = address => {
  if (address === undefined) {
    return undefined;
  }

  const matchingBridge = KNOWN_ASSET_BRIDGES.find(bridge =>
    bridge.addresses.includes(address),
  );

  return matchingBridge === undefined ? undefined : matchingBridge.name;
};

module.exports = getAssetBridgeName;
