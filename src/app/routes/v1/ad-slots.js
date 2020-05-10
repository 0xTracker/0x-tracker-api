const _ = require('lodash');
const Router = require('koa-router');

const getAdSlotContentForToken = require('../../../advertising/get-ad-slot-content-for-token');
const getContentForCurrentAdSlot = require('../../../advertising/get-content-for-current-ad-slot');

const createRouter = () => {
  const router = new Router({ prefix: '/ad-slots' });

  router.get('/current', async ({ response }, next) => {
    const adSlot = await getContentForCurrentAdSlot();

    if (adSlot === null) {
      response.body = null;
      await next();
      return;
    }

    response.body = adSlot;

    await next();
  });

  router.get('/:tokenAddress/:tokenId', async ({ params, response }, next) => {
    const { tokenAddress } = params;
    const tokenId = _.toNumber(params.tokenId);
    const adSlot = await getAdSlotContentForToken(tokenAddress, tokenId);

    if (adSlot === null) {
      response.status = 404;
      await next();
      return;
    }

    response.body = adSlot;

    await next();
  });

  // router.get('/:feedSlug/:articleSlug', async ({ response, params }, next) => {
  //   const { feedSlug, articleSlug } = params;
  //   const sources = await getArticleSources();
  //   const feed = _.findKey(sources, s => s.slug === feedSlug);
  //   const article = await Article.findOne({ feed, slug: articleSlug }).lean();

  //   if (article === null) {
  //     response.status = 404;
  //     await next();
  //     return;
  //   }

  //   const source = _.find(sources, s => s.slug === feedSlug);
  //   const { author, content, date, slug, summary, title, url } = article;

  //   response.body = {
  //     author,
  //     content,
  //     date,
  //     slug,
  //     source,
  //     summary,
  //     title,
  //     url,
  //   };

  //   await next();
  // });

  return router;
};

module.exports = createRouter;
