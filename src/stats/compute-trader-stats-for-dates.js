const moment = require('moment');

const buildFillsQuery = require('../fills/build-fills-query');
const elasticsearch = require('../util/elasticsearch');

const getBasicStatsForDates = async (dateFrom, dateTo, filters) => {
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
      query: buildFillsQuery({ ...filters, dateFrom, dateTo }),
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

const computeTraderStatsForDates = async (dateFrom, dateTo, filters) => {
  const { prevDateFrom, prevDateTo } = getPreviousPeriod(dateFrom, dateTo);
  const specifiedPeriodStats = await getBasicStatsForDates(
    dateFrom,
    dateTo,
    filters,
  );
  const previousPeriodStats = await getBasicStatsForDates(
    prevDateFrom,
    prevDateTo,
    filters,
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
