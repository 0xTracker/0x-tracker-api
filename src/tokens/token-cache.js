const _ = require('lodash');
const signale = require('signale');

const { logError } = require('../util/error-logger');
const Token = require('../model/token');

let keyedTokens = {};

const logger = signale.scope('token cache');

const startPolling = interval => {
  setInterval(() => {
    logger.time('fetch tokens');

    Token.find()
      .lean()
      .then(tokens => {
        logger.timeEnd('fetch tokens');

        keyedTokens = _.keyBy(tokens, 'address');

        logger.success(`token cache refreshed with ${tokens.length} tokens`);
      })
      .catch(logError);
  }, interval);

  logger.info(`polling for new tokens every ${interval}ms`);
};

const initialise = async ({ pollingInterval }) => {
  logger.time('fetch tokens');
  const tokens = await Token.find().lean();
  logger.timeEnd('fetch tokens');

  keyedTokens = _.keyBy(tokens, 'address');

  logger.success(`initialised token cache with ${tokens.length} tokens`);

  startPolling(pollingInterval);
};

const getTokens = () => _.clone(keyedTokens);

const getToken = tokenAddress => _.clone(keyedTokens[tokenAddress]);

module.exports = { getToken, getTokens, initialise };
