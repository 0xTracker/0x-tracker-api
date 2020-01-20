const _ = require('lodash');

const getRelayers = require('../relayers/get-relayers');

const getRelayerLookupId = async relayerId => {
  if (_.isEmpty(relayerId)) {
    return undefined;
  }

  if (relayerId === 'unknown') {
    return null;
  }

  const relayers = await getRelayers();
  const relayer = relayers[relayerId];

  return _.get(relayer, 'lookupId');
};

module.exports = getRelayerLookupId;
