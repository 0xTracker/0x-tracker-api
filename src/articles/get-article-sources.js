const _ = require('lodash');

const { ARTICLE_SOURCES } = require('../constants');
const getRelayers = require('../relayers/get-relayers');

const getArticleSources = async () => {
  const relayers = await getRelayers();

  return _.mapValues(ARTICLE_SOURCES, source => {
    const sourceRelayer = source.relayer
      ? _.find(relayers, relayer => relayer.id === source.relayer)
      : undefined;

    return sourceRelayer
      ? {
          ..._.pick(sourceRelayer, 'name', 'imageUrl', 'url', 'slug'),
          type: 'relayer',
        }
      : { ...source, type: 'other' };
  });
};

module.exports = getArticleSources;
