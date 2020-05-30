const _ = require('lodash');

const transformArticle = (sources, article) => {
  const source = sources[article.feed];

  return {
    ..._.pick(article, ['date', 'id', 'slug', 'summary', 'title', 'url']),
    imageUrl: _.get(article, 'metadata.og:image', null),
    source,
  };
};

module.exports = transformArticle;
