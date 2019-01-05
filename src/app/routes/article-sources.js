const Router = require('koa-router');

const getArticleSources = require('../../articles/get-article-sources');

const router = new Router({ prefix: '/article-sources' });

router.get('/', async ({ response }, next) => {
  response.body = Object.values(getArticleSources());

  await next();
});

module.exports = router;
