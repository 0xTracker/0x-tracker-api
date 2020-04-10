const _ = require('lodash');
const Router = require('koa-router');

const { TIME_PERIOD } = require('../../../constants');
const getTokenPrice = require('../../../tokens/get-token-price');
const getTokenStatsForPeriod = require('../../../tokens/get-token-stats-for-period');
const middleware = require('../../middleware');
const Token = require('../../../model/token');
const transformToken = require('./util/transform-token');

const createRouter = () => {
  const router = new Router();

  router.get(
    '/tokens/:tokenAddress',
    middleware.timePeriod('statsPeriod', TIME_PERIOD.DAY),
    async ({ params, response }, next) => {
      const { statsPeriod, tokenAddress } = params;

      const token = await Token.findOne({
        address: tokenAddress,
      }).lean();

      if (_.isNull(token)) {
        response.status = 404;
        await next();
        return;
      }

      const [price, stats] = await Promise.all([
        getTokenPrice(token.address, statsPeriod),
        getTokenStatsForPeriod(token, statsPeriod),
      ]);

      response.body = transformToken(token, price, stats, statsPeriod);

      await next();
    },
  );

  return router;
};

module.exports = createRouter;
