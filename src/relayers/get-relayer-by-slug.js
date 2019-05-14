const Relayer = require('../model/relayer');

const getRelayerBySlug = async slug => {
  const relayer = await Relayer.findOne({ slug }).lean();

  return relayer;
};

module.exports = getRelayerBySlug;
