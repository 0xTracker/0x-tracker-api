const buildFillsQuery = require('../fills/build-fills-query');
const elasticsearch = require('../util/elasticsearch');
const getPercentageChange = require('../util/get-percentage-change');
const getPreviousPeriod = require('../util/get-previous-period');

const getBasicStatsForDates = async (dateFrom, dateTo, filters) => {
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
