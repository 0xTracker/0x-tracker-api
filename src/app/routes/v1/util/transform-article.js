const _ = require('lodash');

const transformArticle = (sources, article) => {
  const source = sources[article.feed];

  return {
    ..._.pick(article, ['date', 'id', 'summary', 'title', 'url']),
    source,
  };
};

module.exports = transformArticle;
