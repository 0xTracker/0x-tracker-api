const elasticsearch = require('../util/elasticsearch');
const getDatesForTimePeriod = require('../util/get-dates-for-time-period');
const getPercentageChange = require('../util/get-percentage-change');
const getPreviousPeriod = require('../util/get-previous-period');

const getBasicStatsForDates = async (dateFrom, dateTo, usePrecomputed) => {
  if (usePrecomputed) {
    const response = await elasticsearch.getClient().search({
      index: 'trader_metrics_daily',
      body: {
        aggs: {
          traderCount: {
            cardinality: {
              field: 'address',
            },
          },
          makers: {
            filter: {
              range: {
                makerTrades: {
                  gt: 0,
                },
              },
            },
            aggs: {
              makerCount: {
                cardinality: {
                  field: 'address',
                },
              },
            },
          },
          takers: {
            filter: {
              range: {
                takerTrades: {
                  gt: 0,
                },
              },
            },
            aggs: {
              takerCount: {
                cardinality: {
                  field: 'address',
                },
              },
            },
          },
        },
        size: 0,
        query: {
          range: {
            date: {
              gte: dateFrom.toISOString(),
              lte: dateTo.toISOString(),
            },
          },
        },
      },
    });

    const { aggregations } = response.body;

    return {
      makerCount: aggregations.makers.makerCount.value,
      takerCount: aggregations.takers.takerCount.value,
      traderCount: aggregations.traderCount.value,
    };
  }

  const response = await elasticsearch.getClient().search({
    index: 'fills',
    body: {
      aggs: {
        traderCount: {
          cardinality: {
            field: 'traders',
          },
        },
        makerCount: {
          cardinality: {
            field: 'maker',
          },
        },
        takerCount: {
          cardinality: {
            field: 'taker',
          },
        },
      },
      size: 0,
      query: {
        range: {
          date: {
            gte: dateFrom.toISOString(),
            lte: dateTo.toISOString(),
          },
        },
      },
    },
  });

  const { aggregations } = response.body;
  const { makerCount, takerCount, traderCount } = aggregations;

  return {
    makerCount: makerCount.value,
    takerCount: takerCount.value,
    traderCount: traderCount.value,
  };
};

const computeTraderStatsForDates = async period => {
  const { dateFrom, dateTo } = getDatesForTimePeriod(period);
  const { prevDateFrom, prevDateTo } = getPreviousPeriod(dateFrom, dateTo);

  const specifiedPeriodStats = await getBasicStatsForDates(
    dateFrom,
    dateTo,
    period !== 'day',
  );

  const previousPeriodStats = await getBasicStatsForDates(
    prevDateFrom,
    prevDateTo,
    period !== 'day',
  );

  return {
    makerCount: specifiedPeriodStats.makerCount,
    makerCountChange: getPercentageChange(
      previousPeriodStats.makerCount,
      specifiedPeriodStats.makerCount,
    ),
    takerCount: specifiedPeriodStats.takerCount,
    takerCountChange: getPercentageChange(
      previousPeriodStats.takerCount,
      specifiedPeriodStats.takerCount,
    ),
    traderCount: specifiedPeriodStats.traderCount,
    traderCountChange: getPercentageChange(
      previousPeriodStats.traderCount,
      specifiedPeriodStats.traderCount,
    ),
  };
};

module.exports = computeTraderStatsForDates;
