const _ = require('lodash');
const axios = require('axios');
const cache = require('memory-cache');
const ms = require('ms');
const Router = require('koa-router');

const router = new Router({ prefix: '/zrx-price' });

router.get('/', async ({ response, request }, next) => {
  const currency = request.query.currency || 'USD';
  const cacheKey = `zrxPrice.${currency}`;
  let price = cache.get(cacheKey);

  if (!_.isPlainObject(price)) {
    const { data } = await axios.get(
      `https://min-api.cryptocompare.com/data/pricemultifull?fsyms=ZRX&tsyms=${currency}&tryConversion=true`,
    );

    price = {
      value: data.RAW.ZRX[currency].PRICE,
      change: data.RAW.ZRX[currency].CHANGEPCT24HOUR,
    };

    cache.put(cacheKey, price, ms('1 minute'));
  }

  response.body = price;

  await next();
});

module.exports = router;
