const _ = require('lodash');
const ethers = require('ethers');
const Router = require('koa-router');

const { InvalidParameterError } = require('../../errors');
const getAdSlotContentForToken = require('../../../advertising/get-ad-slot-content-for-token');
const getContentForCurrentAdSlot = require('../../../advertising/get-content-for-current-ad-slot');
const isSlotToken = require('../../../advertising/is-slot-token');
const microsponsors = require('../../../advertising/microsponsors');
const saveAdSlotContentSubmission = require('../../../advertising/save-ad-slot-content-submission');

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

  router.patch(
    '/:tokenAddress/:tokenId',
    async ({ params, response, request }, next) => {
      const { tokenAddress } = params;
      const tokenId = _.toNumber(params.tokenId);

      const tokenMetadata = await microsponsors.getTokenMetadata(
        tokenAddress,
        tokenId,
      );

      if (!isSlotToken(tokenMetadata)) {
        response.status = 404;
        await next();
        return;
      }

      const { message, signature } = request.body;
      const signer = ethers.utils.verifyMessage(message, signature);

      if (tokenMetadata.owner !== signer) {
        throw new InvalidParameterError(
          'Signature did not originate from token owner',
          'Invalid body parameter: signature',
        );
      }

      const parsedMessage = JSON.parse(request.body.message);
      const adSlotContent = await saveAdSlotContentSubmission(
        tokenMetadata,
        parsedMessage,
      );

      response.body = adSlotContent;

      await next();
    },
  );

  return router;
};

module.exports = createRouter;
