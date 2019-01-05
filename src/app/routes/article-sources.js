const _ = require('lodash');
const Router = require('koa-router');

const { ARTICLE_SOURCES } = require('../../constants');
const transformArticleSource = require('../util/transform-article-source');

const router = new Router({ prefix: '/article-sources' });

router.get('/', async ({ response }, next) => {
  response.body = _(ARTICLE_SOURCES).map(transformArticleSource);

  await next();
});

module.exports = router;
