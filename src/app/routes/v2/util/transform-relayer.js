const _ = require('lodash');

const transformRelayer = relayer => {
  return _.pick(relayer, ['imageUrl', 'name', 'slug', 'stats', 'url']);
};

module.exports = transformRelayer;
