const _ = require('lodash');

const getAllRelayers = require('../../relayers/get-all-relayers');

const transformArticleSource = source => {
  const relayers = getAllRelayers();
  const relayer = source.relayer ? relayers[source.relayer] : undefined;

  return relayer
    ? {
        ..._.pick(relayer, 'id', 'name', 'imageUrl', 'url', 'slug'),
        type: 'relayer',
      }
    : { ...source, type: 'other' };
};

module.exports = transformArticleSource;
