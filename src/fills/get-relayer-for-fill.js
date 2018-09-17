const _ = require('lodash');

const getAllRelayers = require('../relayers/get-all-relayers');

const getRelayerForFill = fill => {
  const relayers = getAllRelayers();

  if (_.isNumber(fill.relayerId)) {
    return _.find(relayers, { lookupId: fill.relayerId });
  }

  return null;
};

module.exports = getRelayerForFill;
