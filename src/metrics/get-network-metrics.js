const _ = require('lodash');
const BigNumber = require('bignumber.js');

const { ZRX_TOKEN_ADDRESS } = require('../constants');
const Fill = require('../model/fill');
const formatTokenAmount = require('../tokens/format-token-amount');
const getDatesForTimePeriod = require('../util/get-dates-for-time-period');
const getMetricIntervalForTimePeriod = require('./get-metric-interval-for-time-period');

const getNetworkMetrics = async (period, tokens, { relayerId } = {}) => {
  const { dateFrom, dateTo } = getDatesForTimePeriod(period);
  const metricInterval = getMetricIntervalForTimePeriod(period);
  const optionalCriteria = _.compact([_.isNumber(relayerId) && { relayerId }]);
  const query = _.merge(
    { date: { $gte: dateFrom, $lte: dateTo } },
    ...optionalCriteria,
  );
  const metrics = await Fill.aggregate([
    {
      $match: query,
    },
    {
      $group: {
        _id: {
          date: `$roundedDates.${metricInterval}`,
        },
        localizedMakerFees: { $sum: `$conversions.USD.makerFee` },
        localizedTakerFees: { $sum: `$conversions.USD.takerFee` },
        makerFees: { $sum: '$makerFee' },
        takerFees: { $sum: '$takerFee' },
        tradeCount: { $sum: 1 },
        volume: { $sum: `$conversions.USD.amount` },
      },
    },
  ]).sort({ '_id.date': 'asc' });
  const zrxToken = tokens[ZRX_TOKEN_ADDRESS];

  if (zrxToken === undefined) {
    throw new Error('Cannot find ZRX token');
  }

  return metrics.map(metric => {
    const totalFees = new BigNumber(metric.makerFees.toString()).plus(
      metric.takerFees.toString(),
    );

    return {
      date: metric._id.date,
      fees: {
        USD: metric.localizedMakerFees + metric.localizedTakerFees,
        ZRX: formatTokenAmount(totalFees, zrxToken),
      },
      trades: metric.tradeCount,
      volume: metric.volume,
    };
  });
};

module.exports = getNetworkMetrics;
