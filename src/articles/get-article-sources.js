const _ = require('lodash');

const ArticleFeed = require('../model/article-feed');

const getArticleSources = async () => {
  const feeds = await ArticleFeed.find({ isActive: true }).populate(
    'attributionEntity',
  );

  return feeds
    .map(x => ({
      imageUrl: x.imageUrl || _.get(x, 'attributionEntity.logoUrl', null),
      name: x.name || _.get(x, 'attributionEntity.name', null),
      slug: x.urlSlug || _.get(x, 'attributionEntity.urlSlug', null),
      url: x.websiteUrl || _.get(x, 'attributionEntity.websiteUrl', null),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
};

module.exports = getArticleSources;
