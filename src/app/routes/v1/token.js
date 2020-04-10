const _ = require('lodash');
const Router = require('koa-router');

const { TIME_PERIOD } = require('../../../constants');
const getDatesForTimePeriod = require('../../../util/get-dates-for-time-period');
const getTokenPrice = require('../../../tokens/get-token-price');
const middleware = require('../../middleware');
const Token = require('../../../model/token');
const transformToken = require('./util/transform-token');

const createRouter = () => {
  const router = new Router();

  router.get(
    '/tokens/:tokenAddress',
    middleware.timePeriod('statsPeriod', TIME_PERIOD.DAY),
    async ({ params, response }, next) => {
      const token = await Token.findOne({
        address: params.tokenAddress,
      }).lean();

      if (_.isNull(token)) {
        response.status = 404;
        await next();
        return;
      }
      const { dateFrom, dateTo } = getDatesForTimePeriod(params.statsPeriod);
      const price = await getTokenPrice(token.address, {
        from: dateFrom,
        to: dateTo,
      });

      response.body = transformToken(token, price);

      await next();
    },
  );

  return router;
};

module.exports = createRouter;
