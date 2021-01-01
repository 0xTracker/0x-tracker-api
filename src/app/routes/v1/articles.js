const _ = require('lodash');
const Router = require('koa-router');

const Article = require('../../../model/article');
const ArticleFeed = require('../../../model/article-feed');
const middleware = require('../../middleware');
const transformArticle = require('./util/transform-article');
const AttributionEntity = require('../../../model/attribution-entity');

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

const getArticleFeedBySlug = async slug => {
  const slugFeed = await ArticleFeed.findOne({ urlSlug: slug }).populate({
    path: 'attributionEntity',
  });

  if (slugFeed !== null) {
    return slugFeed;
  }

  const slugAttributionEntity = await AttributionEntity.findOne({
    urlSlug: slug,
  });

  if (slugAttributionEntity === null) {
    return null;
  }

  const attributionFeed = await ArticleFeed.findOne({
    attributionEntityId: slugAttributionEntity.id,
  }).populate({
    path: 'attributionEntity',
  });

  return attributionFeed;
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
      const { source } = request.query;

      const sourceFeed =
        source === undefined ? undefined : await getArticleFeedBySlug(source);

      const editorsChoice = parseBoolean(request.query.editorsChoice);

      const query = _.pickBy(
        {
          feed: sourceFeed ? sourceFeed.id : undefined,
          editorsChoice:
            editorsChoice === true || editorsChoice === undefined
              ? editorsChoice
              : { $in: [false, null] },
        },
        i => i !== undefined,
      );

      const articles = await Article.paginate(query, {
        sort: { date: -1 },
        limit: pagination.limit,
        page: pagination.page,
        populate: { path: 'feedMetadata', populate: 'attributionEntity' },
      });

      response.body = {
        articles: _(articles.docs).map(transformArticle),
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

    const feed = await getArticleFeedBySlug(feedSlug);
    const article = await Article.findOne({
      feed: feed.id,
      slug: articleSlug,
    });

    if (article === null) {
      response.status = 404;
      await next();
      return;
    }

    const { author, content, date, slug, summary, title, url } = article;

    response.body = {
      author,
      content,
      date,
      slug,
      source: {
        imageUrl:
          feed.imageUrl || _.get(feed, 'attributionEntity.logoUrl', null),
        name: feed.name || _.get(feed, 'attributionEntity.name', null),
        slug: feed.urlSlug || _.get(feed, 'attributionEntity.urlSlug', null),
        url:
          feed.websiteUrl || _.get(feed, 'attributionEntity.websiteUrl', null),
      },
      summary,
      title,
      url,
    };

    await next();
  });

  return router;
};

module.exports = createRouter;
