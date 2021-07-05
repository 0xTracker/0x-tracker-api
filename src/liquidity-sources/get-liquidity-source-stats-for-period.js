const _ = require('lodash');

const { TIME_PERIOD } = require('../constants');
const elasticsearch = require('../util/elasticsearch');
const getDatesForTimePeriod = require('../util/get-dates-for-time-period');
const getPercentageChange = require('../util/get-percentage-change');
const getPreviousPeriod = require('../util/get-previous-period');

const getStatsForDates = async (
  liquiditySourceId,
  dateFrom,
  dateTo,
  usePrecomputed,
) => {
  const result = await elasticsearch.getClient().search({
    index: usePrecomputed ? 'liquidity_source_metrics_daily' : 'fills',
    body: {
      aggs: {
        tradeCount: {
          sum: {
            field: usePrecomputed ? 'tradeCount' : 'tradeCountContribution',
          },
        },
        tradeVolume: {
          sum: {
            field: 'tradeVolume',
          },
        },
      },
      query: {
        bool: {
          filter: [
            {
              range: {
                date: {
                  gte: dateFrom,
                  lte: dateTo,
                },
              },
            },
            {
              term: {
                liquiditySourceId,
              },
            },
          ],
        },
      },
    },
  });

  const tradeVolume = result.body.aggregations.tradeVolume.value;
  const tradeCount = result.body.aggregations.tradeCount.value;

  return {
    avgTradeSize: tradeVolume / tradeCount,
    tradeCount,
    tradeVolume,
  };
};

const getLiquiditySourceStatsForPeriod = async (liquiditySourceId, period) => {
  const { dateFrom, dateTo } = getDatesForTimePeriod(period);
  const { prevDateFrom, prevDateTo } = getPreviousPeriod(dateFrom, dateTo);
  const usePrecomputed = period === 'day';

  const [stats, prevStats] = await Promise.all([
    getStatsForDates(liquiditySourceId, dateFrom, dateTo, usePrecomputed),
    period === TIME_PERIOD.ALL
      ? undefined
      : await getStatsForDates(
          liquiditySourceId,
          prevDateFrom,
          prevDateTo,
          usePrecomputed,
        ),
  ]);

  const { avgTradeSize, tradeCount, tradeVolume } = stats;

  const prevAvgTradeSize = _.get(prevStats, 'avgTradeSize', null);
  const prevTradeCount = _.get(prevStats, 'tradeCount', null);
  const prevTradeVolume = _.get(prevStats, 'tradeVolume', null);

  console.log(
    prevTradeCount,
    tradeCount,
    getPercentageChange(prevTradeCount, tradeCount),
  );

  return {
    avgTradeSize,
    avgTradeSizeChange: getPercentageChange(prevAvgTradeSize, avgTradeSize),
    tradeCount,
    tradeCountChange: getPercentageChange(prevTradeCount, tradeCount),
    tradeVolume: stats.tradeVolume,
    tradeVolumeChange: getPercentageChange(prevTradeVolume, tradeVolume),
  };
};

module.exports = getLiquiditySourceStatsForPeriod;
