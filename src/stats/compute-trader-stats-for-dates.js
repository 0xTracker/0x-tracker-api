const moment = require('moment');

const elasticsearch = require('../util/elasticsearch');

const getBasicStatsForDates = async (dateFrom, dateTo) => {
  const response = await elasticsearch.getClient().search({
    index: `fills`,
    body: {
      aggs: {
        makerCount: {
          cardinality: {
            field: 'maker',
            precision_threshold: 10000,
          },
        },
        takerCount: {
          cardinality: {
            field: 'taker',
            precision_threshold: 10000,
          },
        },
        traderCount: {
          cardinality: {
            field: 'traders',
            precision_threshold: 10000,
          },
        },
      },
      size: 0,
      query: {
        range: {
          date: {
            gte: dateFrom,
            lte: dateTo,
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

const getPreviousPeriod = (dateFrom, dateTo) => {
  const diff = moment(dateTo).diff(dateFrom);
  const prevDateTo = moment(dateFrom)
    .subtract('millisecond', 1)
    .toDate();
  const prevDateFrom = moment(prevDateTo)
    .subtract('millisecond', diff)
    .toDate();

  return { prevDateFrom, prevDateTo };
};

const getPercentageChange = (valueA, valueB) => {
  if (valueA === 0) {
    return null;
  }

  return ((valueB - valueA) / valueA) * 100;
};

const computeTraderStatsForDates = async (dateFrom, dateTo) => {
  const { prevDateFrom, prevDateTo } = getPreviousPeriod(dateFrom, dateTo);
  const specifiedPeriodStats = await getBasicStatsForDates(dateFrom, dateTo);
  const previousPeriodStats = await getBasicStatsForDates(
    prevDateFrom,
    prevDateTo,
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
