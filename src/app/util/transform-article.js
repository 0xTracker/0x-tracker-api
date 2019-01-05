const _ = require('lodash');

const getArticleSources = require('../../articles/get-article-sources');

const transformArticle = article => {
  const sources = getArticleSources();
  const source = sources[article.feed];

  return {
    ..._.pick(article, ['date', 'id', 'summary', 'title', 'url']),
    source,
  };
};

module.exports = transformArticle;
