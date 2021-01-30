const _ = require('lodash');

const getDatesForTimePeriod = require('../../util/get-dates-for-time-period');
const getMakers = require('./get-makers');
const getTakers = require('./get-takers');
const getTraders = require('./get-traders');

const resolverFn = type => {
  return {
    [undefined]: getTraders,
    maker: getMakers,
    taker: getTakers,
  }[type];
};

const getTradersWithStatsForPeriod = async (period, options) => {
  const { dateFrom, dateTo } = getDatesForTimePeriod(period);
  const { appIds, page, limit, type } = _.defaults({}, options, {
    page: 1,
    limit: 20,
  });

  const resolver = resolverFn(type);
  const result = await resolver(dateFrom, dateTo, {
    appIds,
    limit,
    page,
    usePrecomputed: period !== 'day',
  });

  return result;
};

module.exports = getTradersWithStatsForPeriod;
