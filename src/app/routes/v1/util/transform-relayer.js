const _ = require('lodash');

const transformRelayer = (relayer, stats) => {
  return _.pickBy(
    {
      id: relayer.id,
      imageUrl: _.get(relayer, 'imageUrl', null),
      name: relayer.name,
      slug: relayer.slug,
      stats,
      url: _.get(relayer, 'url', null),
    },
    val => val !== undefined,
  );
};

module.exports = transformRelayer;
