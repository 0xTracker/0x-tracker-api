const axios = require('axios');
const Router = require('koa-router');

const createRouter = () => {
  const router = new Router({ prefix: '/zrx-price' });

  router.get('/', async ({ response, request }, next) => {
    const currency = request.query.currency || 'USD';
    const { data } = await axios.get(
      `https://min-api.cryptocompare.com/data/pricemultifull?fsyms=ZRX&tsyms=${currency}&tryConversion=true`,
    );

    const price = {
      value: data.RAW.ZRX[currency].PRICE,
      change: data.RAW.ZRX[currency].CHANGEPCT24HOUR,
    };

    response.body = price;

    await next();
  });

  return router;
};

module.exports = createRouter;
