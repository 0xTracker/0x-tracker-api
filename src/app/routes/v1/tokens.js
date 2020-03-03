const _ = require('lodash');
const Router = require('koa-router');

const { TIME_PERIOD, TOKEN_TYPE } = require('../../../constants');
const formatTokenType = require('../../../tokens/format-token-type');
const getDatesForTimePeriod = require('../../../util/get-dates-for-time-period');
const getTokensWith24HourStats = require('../../../tokens/get-tokens-with-24-hour-stats');
const getTokensWithStatsForDates = require('../../../tokens/get-tokens-with-stats-for-dates');
const InvalidParameterError = require('../../errors/invalid-parameter-error');
const pagination = require('../../middleware/pagination');
const validatePeriod = require('../../middleware/validate-period');

const TOKEN_TYPE_MAP = {
  [TOKEN_TYPE.ERC20]: 'erc-20',
  [TOKEN_TYPE.ERC721]: 'erc-721',
  [TOKEN_TYPE.ERC1155]: 'erc-1155',
};

const TOKEN_TYPE_REVERSE_MAP = {
  'erc-20': TOKEN_TYPE.ERC20,
  'erc-721': TOKEN_TYPE.ERC721,
  'erc-1155': TOKEN_TYPE.ERC1155,
};

const validTokenTypes = _.values(TOKEN_TYPE_MAP);

const createRouter = () => {
  const router = new Router();

  router.get(
    '/tokens',
    pagination({ defaultLimit: 20, maxLimit: 50, maxPage: Infinity }),
    validatePeriod('statsPeriod'),
    async ({ pagination: { limit, page }, request, response }, next) => {
      const { type } = request.query;

      if (type !== undefined && !validTokenTypes.includes(type)) {
        throw new InvalidParameterError(
          `Must be one of: ${validTokenTypes.join(', ')}`,
          'Invalid query parameter: type',
        );
      }

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
          type: formatTokenType(token.type),
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
