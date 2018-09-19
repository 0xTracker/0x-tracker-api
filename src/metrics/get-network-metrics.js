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
  const dataPoints = await Fill.aggregate([
    {
      $match: query,
    },
    {
      $group: {
        _id: {
          date: `$roundedDates.${metricInterval}`,
        },
        count: { $sum: 1 },
        localizedMakerFees: { $sum: `$conversions.USD.makerFee` },
        localizedTakerFees: { $sum: `$conversions.USD.takerFee` },
        makerFees: { $sum: '$makerFee' },
        takerFees: { $sum: '$takerFee' },
        volume: { $sum: `$conversions.USD.amount` },
      },
    },
  ]).sort({ '_id.date': 'asc' });
  const zrxToken = tokens[ZRX_TOKEN_ADDRESS];

  if (zrxToken === undefined) {
    throw new Error('Cannot find ZRX token');
  }

  return dataPoints.map(dataPoint => {
    const totalFees = new BigNumber(dataPoint.makerFees.toString()).plus(
      dataPoint.takerFees.toString(),
    );

    return {
      date: dataPoint._id.date,
      fees: {
        USD: dataPoint.localizedMakerFees + dataPoint.localizedTakerFees,
        ZRX: formatTokenAmount(totalFees, zrxToken),
      },
      fills: dataPoint.count,
      volume: dataPoint.volume,
    };
  });
};

module.exports = getNetworkMetrics;
