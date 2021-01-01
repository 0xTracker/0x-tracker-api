const _ = require('lodash');

const transformArticle = article => ({
  ..._.pick(article, ['date', 'id', 'slug', 'summary', 'title', 'url']),
  imageUrl: _.get(article, 'metadata.og:image', null),
  source: {
    imageUrl: _.get(
      article,
      'feedMetadata.imageUrl',
      _.get(article, 'feedMetadata.attributionEntity.logoUrl', null),
    ),
    name: _.get(
      article,
      'feedMetadata.name',
      _.get(article, 'feedMetadata.attributionEntity.name', null),
    ),
    slug: _.get(
      article,
      'feedMetadata.urlSlug',
      _.get(article, 'feedMetadata.attributionEntity.urlSlug', null),
    ),
    url: _.get(
      article,
      'feedMetadata.websiteUrl',
      _.get(article, 'feedMetadata.attributionEntity.websiteUrl', null),
    ),
  },
});

module.exports = transformArticle;
