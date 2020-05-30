const _ = require('lodash');
const Router = require('koa-router');

const Article = require('../../../model/article');
const getArticleSources = require('../../../articles/get-article-sources');
const middleware = require('../../middleware');
const transformArticle = require('./util/transform-article');

const parseBoolean = booleanString => {
  if (
    booleanString === undefined ||
    booleanString === null ||
    booleanString.trim().length === 0
  ) {
    return undefined;
  }

  return booleanString === 'true';
};

const createRouter = () => {
  const router = new Router({ prefix: '/articles' });

  router.get(
    '/',
    middleware.pagination({
      defaultLimit: 12,
      maxLimit: 50,
      maxPage: Infinity,
    }),
    async ({ pagination, response, request }, next) => {
      const sources = await getArticleSources();
      const editorsChoice = parseBoolean(request.query.editorsChoice);

      const feed = _.findKey(
        sources,
        source => source.slug === request.query.source,
      );

      const query = _.pickBy(
        {
          feed: request.query.source ? feed : undefined,
          editorsChoice:
            editorsChoice === true || editorsChoice === undefined
              ? editorsChoice
              : { $in: [false, null] },
        },
        i => i !== undefined,
      );

      const articles = await Article.paginate(query, {
        sort: { date: -1 },
        lean: true,
        limit: pagination.limit,
        page: pagination.page,
      });

      response.body = {
        articles: _(articles.docs).map(_.partial(transformArticle, sources)),
        limit: articles.limit,
        page: parseInt(articles.page, 10),
        pageCount: articles.pages,
        total: articles.total,
      };

      await next();
    },
  );

  router.get('/:feedSlug/:articleSlug', async ({ response, params }, next) => {
    const { feedSlug, articleSlug } = params;
    const sources = await getArticleSources();
    const feed = _.findKey(sources, s => s.slug === feedSlug);
    const article = await Article.findOne({ feed, slug: articleSlug }).lean();

    if (article === null) {
      response.status = 404;
      await next();
      return;
    }

    const source = _.find(sources, s => s.slug === feedSlug);
    const { author, content, date, slug, summary, title, url } = article;

    response.body = {
      author,
      content,
      date,
      slug,
      source,
      summary,
      title,
      url,
    };

    await next();
  });

  return router;
};

module.exports = createRouter;
