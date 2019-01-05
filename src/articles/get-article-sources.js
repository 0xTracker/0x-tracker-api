const _ = require('lodash');

const { ARTICLE_SOURCES } = require('../constants');
const getAllRelayers = require('../relayers/get-all-relayers');

const getArticleSources = () => {
  const relayers = getAllRelayers();

  return _.mapValues(ARTICLE_SOURCES, source => {
    const relayer = source.relayer ? relayers[source.relayer] : undefined;

    return relayer
      ? {
          ..._.pick(relayer, 'name', 'imageUrl', 'url', 'slug'),
          type: 'relayer',
        }
      : { ...source, type: 'other' };
  });
};

module.exports = getArticleSources;
