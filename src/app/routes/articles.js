const _ = require('lodash');
const Router = require('koa-router');

const Article = require('../../model/article');
const getArticleSources = require('../../articles/get-article-sources');
const transformArticle = require('../util/transform-article');

const router = new Router({ prefix: '/articles' });

router.get('/', async ({ response, request }, next) => {
  const sources = getArticleSources();
  const page = request.query.page || 1;
  const feed = _.findKey(
    sources,
    source => source.slug === request.query.source,
  );
  const articles = await Article.paginate(
    request.query.source ? { feed } : {},
    {
      sort: { date: -1 },
      limit: 12,
      page,
    },
  );

  response.body = {
    articles: _(articles.docs).map(transformArticle),
    limit: articles.limit,
    page: parseInt(articles.page, 10),
    pageCount: articles.pages,
    total: articles.total,
  };
  await next();
});

module.exports = router;
