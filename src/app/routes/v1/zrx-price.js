const _ = require('lodash');
const axios = require('axios');
const Router = require('koa-router');

const { logError } = require('../../../util/error-logger');

const createRouter = () => {
  const router = new Router({ prefix: '/zrx-price' });

  router.get('/', async ({ response, request }, next) => {
    const currency = request.query.currency || 'USD';

    let data;

    try {
      const apiResponse = await axios.get(
        `https://min-api.cryptocompare.com/data/pricemultifull?fsyms=ZRX&tsyms=${currency}&tryConversion=true`,
      );
      data = apiResponse.data;
    } catch (error) {
      logError('Unable to fetch ZRX price', { error });

      throw error;
    }

    const price = _.get(data, `RAW.ZRX.${currency}.PRICE`);
    const priceChange = _.get(data, `RAW.ZRX.${currency}.CHANGEPCT24HOUR`);

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
