const _ = require('lodash');

const { ARTICLE_SOURCES } = require('../constants');
const Relayer = require('../model/relayer');

const getArticleSources = async () => {
  const relayers = await Relayer.find();

  return _.mapValues(ARTICLE_SOURCES, source => {
    const sourceRelayer = source.relayer
      ? relayers.find(relayer => relayer.id === source.relayer)
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
