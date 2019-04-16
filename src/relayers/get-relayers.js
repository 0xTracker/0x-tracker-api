const _ = require('lodash');
const memoryCache = require('memory-cache');
const ms = require('ms');

const Relayer = require('../model/relayer');

const getRelayers = async ({ ttl = ms('1 minute') } = {}) => {
  const cached = memoryCache.get('relayers');

  if (cached !== null) {
    return cached;
  }

  const relayers = await Relayer.find({}).lean();
  const relayersKeyedById = _.keyBy(relayers, 'id');

  memoryCache.put('relayers', relayersKeyedById, ttl);

  return relayersKeyedById;
};

module.exports = getRelayers;
