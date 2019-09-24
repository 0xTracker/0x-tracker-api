const Router = require('koa-router');

const { TIME_PERIOD, TOKEN_TYPE } = require('../../../constants');
const getDatesForTimePeriod = require('../../../util/get-dates-for-time-period');
const getTokensWith24HourStats = require('../../../tokens/get-tokens-with-24-hour-stats');
const getTokensWithStatsForDates = require('../../../tokens/get-tokens-with-stats-for-dates');
const pagination = require('../../middleware/pagination');

const TOKEN_TYPE_MAP = {
  [TOKEN_TYPE.ERC20]: 'erc-20',
  [TOKEN_TYPE.ERC721]: 'erc-721',
};

const TOKEN_TYPE_REVERSE_MAP = {
  'erc-20': TOKEN_TYPE.ERC20,
  'erc-721': TOKEN_TYPE.ERC721,
};

const createRouter = () => {
  const router = new Router();

  router.get(
    '/tokens',
    pagination({ defaultLimit: 20, maxLimit: 50, maxPage: Infinity }),
    async ({ pagination: { limit, page }, request, response }, next) => {
      const { type } = request.query;
      const statsPeriod = request.query.statsPeriod || TIME_PERIOD.DAY;
      const { dateFrom, dateTo } = getDatesForTimePeriod(statsPeriod);

      const { tokens, resultCount } =
        statsPeriod === TIME_PERIOD.DAY
          ? await getTokensWith24HourStats({
              page,
              limit,
              type: TOKEN_TYPE_REVERSE_MAP[type],
            })
          : await getTokensWithStatsForDates(dateFrom, dateTo, {
              page,
              limit,
              type: TOKEN_TYPE_REVERSE_MAP[type],
            });

      response.body = {
        tokens: tokens.map(token => ({
          ...token,
          type: TOKEN_TYPE_MAP[token.type],
        })),
        page,
        pageCount: Math.ceil(resultCount / limit),
        limit,
        total: resultCount,
      };

      await next();
    },
  );

  return router;
};

module.exports = createRouter;
