const _ = require('lodash');

const Relayer = require('../model/relayer');

const getRelayerLookupId = async relayerId => {
  if (_.isEmpty(relayerId)) {
    return undefined;
  }

  const relayer = await Relayer.findOne({ id: relayerId });

  return _.get(relayer, 'lookupId');
};

module.exports = getRelayerLookupId;
