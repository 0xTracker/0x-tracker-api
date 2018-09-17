const getAllRelayers = require('./get-all-relayers');

const getRelayer = relayerId => {
  const relayers = getAllRelayers();

  return relayers[relayerId];
};

module.exports = getRelayer;
