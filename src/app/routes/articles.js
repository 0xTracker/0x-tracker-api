const _ = require('lodash');
const Router = require('koa-router');

const Article = require('../../model/article');

const router = new Router({ prefix: '/articles' });

router.get('/', async ({ response, request }, next) => {
  const page = request.query.page || 1;
  const articles = await Article.paginate(
    {},
    { sort: { date: -1 }, limit: 12, page },
  );

  response.body = {
    articles: _(articles.docs).map(model =>
      _.pick(model, [
        'author',
        'date',
        'feed',
        'guid',
        'summary',
        'title',
        'url',
      ]),
    ),
    limit: articles.limit,
    page: parseInt(articles.page, 10),
    pageCount: articles.pages,
    total: articles.total,
  };
  await next();
});

module.exports = router;
