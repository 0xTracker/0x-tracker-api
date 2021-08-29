const _ = require('lodash');
const { TIME_PERIOD } = require('../constants');
const elasticsearch = require('../util/elasticsearch');
const getDatesForTimePeriod = require('../util/get-dates-for-time-period');
const getPercentageChange = require('../util/get-percentage-change');
const getPreviousPeriod = require('../util/get-previous-period');

const getTokenStatsForDates = async (
  token,
  dateFrom,
  dateTo,
  { usePrecomputed },
) => {
  const res = await elasticsearch.getClient().search({
    index: !usePrecomputed ? 'traded_tokens' : 'token_metrics_daily',
    body: {
      aggs: {
        tradeCount: {
          sum: {
            field: !usePrecomputed ? 'tradeCountContribution' : 'tradeCount',
          },
        },
        tradeVolume: {
          sum: { field: !usePrecomputed ? 'tradedAmount' : 'tradeVolume' },
        },
        tradeVolumeUSD: {
          sum: {
            field: !usePrecomputed ? 'tradedAmountUSD' : 'tradeVolumeUsd',
          },
        },
        minPriceUSD: {
          min: {
            field: !usePrecomputed ? 'priceUSD' : 'minPrice',
          },
        },
        maxPriceUSD: {
          max: {
            field: !usePrecomputed ? 'priceUSD' : 'maxPrice',
          },
        },
        priced: {
          filter: {
            exists: { field: !usePrecomputed ? 'priceUSD' : 'openPrice' },
          },
          aggs: {
            firstDoc: {
              top_hits: {
                size: 1,
                sort: {
                  date: {
                    order: 'asc',
                  },
                },
                _source: {
                  includes: [
                    'date',
                    'fillId',
                    usePrecomputed ? 'openPrice' : 'priceUSD',
                  ],
                },
              },
            },
            lastDoc: {
              top_hits: {
                size: 1,
                sort: {
                  date: {
                    order: 'desc',
                  },
                },
                _source: {
                  includes: [
                    'date',
                    'fillId',
                    usePrecomputed ? 'closePrice' : 'priceUSD',
                  ],
                },
              },
            },
          },
        },
      },
      size: 0,
      query: {
        bool: {
          filter: [
            {
              term: {
                [!usePrecomputed ? 'tokenAddress' : 'address']: token.address,
              },
            },
            {
              range: {
                date: {
                  gte: dateFrom,
                  lte: dateTo,
                },
              },
            },
          ],
        },
      },
    },
  });

  const {
    maxPriceUSD,
    minPriceUSD,
    priced,
    tradeCount,
    tradeVolume,
    tradeVolumeUSD,
  } = res.body.aggregations;

  const { firstDoc, lastDoc } = priced;

  return {
    price: {
      close: _.get(
        lastDoc,
        `hits.hits[0]._source[${usePrecomputed ? 'closePrice' : 'priceUSD'}]`,
      ),
      open: _.get(
        firstDoc,
        `hits.hits[0]._source[${usePrecomputed ? 'openPrice' : 'priceUSD'}]`,
      ),
      high: maxPriceUSD.value,
      low: minPriceUSD.value,
    },
    tradeCount: tradeCount.value,
    tradeVolume: {
      token: tradeVolume.value,
      USD: tradeVolumeUSD.value,
    },
  };
};

const getTokenStatsForPeriod = async (token, period) => {
  const usePrecomputed = period !== 'day';
  const { dateFrom, dateTo } = getDatesForTimePeriod(period);
  const { prevDateFrom, prevDateTo } = getPreviousPeriod(dateFrom, dateTo);

  const [stats, prevStats] = await Promise.all([
    getTokenStatsForDates(token, dateFrom, dateTo, { usePrecomputed }),
    period !== TIME_PERIOD.ALL
      ? getTokenStatsForDates(token, prevDateFrom, prevDateTo, {
          usePrecomputed,
        })
      : null,
  ]);

  const prevClosePrice = prevStats ? prevStats.price.close : null;
  const prevTradeCount = prevStats ? prevStats.tradeCount : null;
  const prevTradeVolume = prevStats ? prevStats.tradeVolume.token : null;
  const prevTradeVolumeUsd = prevStats ? prevStats.tradeVolume.USD : null;

  return {
    ...stats,
    price: {
      change: getPercentageChange(prevClosePrice, stats.price.close),
      ...stats.price,
    },
    tradeCountChange: getPercentageChange(prevTradeCount, stats.tradeCount),
    tradeVolumeChange: {
      token: getPercentageChange(prevTradeVolume, stats.tradeVolume.token),
      USD: getPercentageChange(prevTradeVolumeUsd, stats.tradeVolume.USD),
    },
  };
};

module.exports = getTokenStatsForPeriod;
