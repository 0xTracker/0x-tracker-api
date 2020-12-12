const axios = require('axios');
const memoryCache = require('memory-cache');
const ms = require('ms');
const Router = require('koa-router');

const { getLogger } = require('../../../util/logging');

const CACHE_KEY = 'rates';

const getRates = async () => {
  const cached = memoryCache.get(CACHE_KEY);

  if (cached !== null) {
    return cached;
  }

  const logger = getLogger('rates');
  const { data } = await axios.get(
    `https://min-api.cryptocompare.com/data/pricemulti?fsyms=USD&tsyms=AUD,BTC,GBP,CNY,ETH,EUR,JPY,KRW,USD&api_key=${process.env.CRYPTOCOMPARE_API_KEY}`,
  );

  const dataWithLastUpdated = { ...data, lastUpdated: new Date() };

  memoryCache.put(CACHE_KEY, dataWithLastUpdated, ms('1 hour'));
  logger.info('refreshed rates');

  return dataWithLastUpdated;
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
