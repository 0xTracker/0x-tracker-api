const _ = require('lodash');

const transformRelayer = relayer => {
  return _.pick(relayer, ['id', 'imageUrl', 'name', 'slug', 'stats', 'url']);
};

module.exports = transformRelayer;
