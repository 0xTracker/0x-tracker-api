const _ = require('lodash');
const getRelayer = require('../relayers/get-relayer');

const getFilterForRelayer = relayerId => {
  const relayer = _.isString(relayerId) && getRelayer(relayerId);

  return { relayerId: _.get(relayer, 'lookupId') };
};

module.exports = getFilterForRelayer;
