const axios = require('axios');
const moment = require('moment');
const Router = require('koa-router');

const { getLogger } = require('../../../util/logging');

let lastRates;
let lastUpdated;

const getRates = async () => {
  const stale =
    lastRates === undefined ||
    moment(lastUpdated)
      .add('1', 'hour')
      .toDate() < new Date();

  if (!stale) {
    return lastRates;
  }

  const logger = getLogger('rates');
  const { data } = await axios.get(
    `https://min-api.cryptocompare.com/data/pricemulti?fsyms=USD&tsyms=AUD,BTC,GBP,CNY,ETH,EUR,JPY,KRW,USD&api_key=${process.env.CRYPTOCOMPARE_API_KEY}`,
  );

  lastUpdated = new Date();
  lastRates = data;

  logger.info('refreshed rates');

  return lastRates;
};

const createRouter = () => {
  const router = new Router({ prefix: '/rates' });

  router.get('/', async ({ response }, next) => {
    const rates = await getRates();

    response.body = rates;

    await next();
  });

  return router;
};

module.exports = createRouter;
