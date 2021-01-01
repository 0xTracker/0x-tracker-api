const _ = require('lodash');

const { ARTICLE_SOURCES } = require('../../../../constants');

const transformArticle = article => {
  const source = ARTICLE_SOURCES[article.feed];

  return {
    ..._.pick(article, ['date', 'id', 'slug', 'summary', 'title', 'url']),
    imageUrl: _.get(article, 'metadata.og:image', null),
    source: {
      imageUrl: _.get(
        article,
        'feedMetadata.imageUrl',
        _.get(
          article,
          'feedMetadata.attributionEntity.logoUrl',
          _.get(source, 'imageUrl', null),
        ),
      ),
      name: _.get(
        article,
        'feedMetadata.name',
        _.get(
          article,
          'feedMetadata.attributionEntity.name',
          _.get(source, 'name', null),
        ),
      ),
      slug: _.get(
        article,
        'feedMetadata.urlSlug',
        _.get(
          article,
          'feedMetadata.attributionEntity.urlSlug',
          _.get(source, 'slug', null),
        ),
      ),
      url: _.get(
        article,
        'feedMetadata.websiteUrl',
        _.get(
          article,
          'feedMetadata.attributionEntity.websiteUrl',
          _.get(source, 'url', null),
        ),
      ),
    },
  };
};

module.exports = transformArticle;
