const _ = require('lodash');

const transformRelayer = relayer => {
  return _.pick(relayer, ['id', 'imageUrl', 'name', 'slug', 'url']);
};

module.exports = transformRelayer;
