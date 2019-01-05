const _ = require('lodash');

const { ARTICLE_SOURCES } = require('../../constants');
const transformArticleSource = require('./transform-article-source');

const transformArticle = article => {
  const source = ARTICLE_SOURCES[article.feed];

  return {
    ..._.pick(article, ['date', 'id', 'summary', 'title', 'url']),
    source: transformArticleSource(source),
  };
};

module.exports = transformArticle;
