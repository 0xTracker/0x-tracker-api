const Relayer = require('../model/relayer');

const searchRelayers = async (query, options) => {
  const relayers = await Relayer.find(
    query.length > 0 ? { name: new RegExp(query, 'ig') } : {},
  )
    .sort({ name: 1 })
    .limit(options.limit)
    .lean();

  return relayers;
};

module.exports = searchRelayers;
