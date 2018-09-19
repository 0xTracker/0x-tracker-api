const _ = require('lodash');
const BigNumber = require('bignumber.js');

const Fill = require('../model/fill');
const formatTokenAmount = require('../tokens/format-token-amount');
const getDatesForTimePeriod = require('../util/get-dates-for-time-period');
const getMetricIntervalForTimePeriod = require('./get-metric-interval-for-time-period');
const Token = require('../model/token');

const getTokenVolume = async (tokenAddress, period) => {
  const { dateFrom, dateTo } = getDatesForTimePeriod(period);

  const metricInterval = getMetricIntervalForTimePeriod(period);
  const token = await Token.findOne({ address: tokenAddress });

  const getDataFor = side =>
    Fill.aggregate([
      {
        $match: {
          date: { $gte: new Date(dateFrom), $lte: new Date(dateTo) },
          [`${side}Token`]: tokenAddress,
        },
      },
      {
        $group: {
          _id: {
            date: `$roundedDates.${metricInterval}`,
          },
          localizedVolume: { $sum: `$conversions.USD.amount` },
          volume: { $sum: `$${side}Amount` },
        },
      },
    ]);

  const data = _.flatten(
    await Promise.all([getDataFor('maker'), getDataFor('taker')]),
  );

  const combinedData = _(data)
    .groupBy('_id.date')
    .map(groupedDataPoints => ({
      date: groupedDataPoints[0]._id.date,
      localizedVolume: _.reduce(
        groupedDataPoints,
        (accumulator, metric) => accumulator + metric.localizedVolume,
        0,
      ),
      volume: _.reduce(
        groupedDataPoints,
        (accumulator, metric) => accumulator.plus(metric.volume.toString()),
        new BigNumber(0),
      ),
    }))
    .orderBy('date', 'asc')
    .value();

  return combinedData.map(dataPoint => ({
    date: dataPoint.date,
    volume: {
      USD: dataPoint.localizedVolume,
      [token.symbol]: formatTokenAmount(dataPoint.volume, token),
    },
  }));
};

module.exports = getTokenVolume;
