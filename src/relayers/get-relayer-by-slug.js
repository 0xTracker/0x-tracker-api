const Relayer = require('../model/relayer');

const getRelayerBySlug = async slug => {
  if (slug === 'unknown') {
    return {
      id: 'unknown',
      name: 'Unknown',
      slug: 'unknown',
    };
  }

  const relayer = await Relayer.findOne({ slug }).lean();

  return relayer;
};

module.exports = getRelayerBySlug;
