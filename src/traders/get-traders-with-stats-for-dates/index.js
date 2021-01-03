const _ = require('lodash');

const getRelayerTakerAddresses = require('../../relayers/get-relayer-taker-addresses');
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

const getTradersWithStatsForDates = async (dateFrom, dateTo, options) => {
  const { appIds, excludeRelayers, page, limit, type } = _.defaults(
    {},
    options,
    {
      excludeRelayers: true,
      page: 1,
      limit: 20,
    },
  );

  const resolver = resolverFn(type);
  const relayerTakerAddresses = await getRelayerTakerAddresses();
  const result = await resolver(dateFrom, dateTo, {
    appIds,
    exclude: excludeRelayers ? relayerTakerAddresses : [],
    limit,
    page,
  });

  return result;
};

module.exports = getTradersWithStatsForDates;
