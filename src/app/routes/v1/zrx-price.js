const _ = require('lodash');
const axios = require('axios');
const Router = require('koa-router');

const { logError } = require('../../../util/error-logger');

const createRouter = () => {
  const router = new Router({ prefix: '/zrx-price' });

  router.get('/', async ({ response, request }, next) => {
    const currency = _.toLower(request.query.currency || 'USD');

    let data;

    try {
      const apiResponse = await axios.get(
        `https://api.coingecko.com/api/v3/simple/price?ids=0x&vs_currencies=${currency}&include_24hr_change=true`,
      );
      data = apiResponse.data;
    } catch (error) {
      logError('Unable to fetch ZRX price', { error });

      throw error;
    }

    const price = _.get(data, `0x.${currency}`);
    const priceChange = _.get(data, `0x.${currency}_24h_change`);

    if (!_.isNumber(price) || !_.isNumber(priceChange)) {
      logError('Invalid ZRX price response', { responseData: data });

      throw new Error('Invalid ZRX price response');
    }

    response.body = {
      value: price,
      change: priceChange,
    };

    await next();
  });

  return router;
};

module.exports = createRouter;
