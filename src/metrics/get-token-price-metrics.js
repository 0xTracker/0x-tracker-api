const _ = require('lodash');

const elasticsearch = require('../util/elasticsearch');
const getDatesForMetrics = require('../util/get-dates-for-metrics');

const getPriceForPreviousPeriod = async (tokenAddress, currentPeriodStart) => {
  const results = await elasticsearch.getClient().search({
    index: 'traded_tokens',
    body: {
      query: {
        bool: {
          filter: [
            {
              term: {
                tokenAddress,
              },
            },
            {
              range: {
                date: {
                  lt: currentPeriodStart,
                },
              },
            },
            {
              range: {
                priceUSD: { gt: 0 },
              },
            },
            {
              range: {
                tradedAmountUSD: { gte: 1 },
              },
            },
          ],
        },
      },
      sort: {
        date: 'desc',
      },
      size: 1,
    },
  });

  return _.get(results, 'body.hits.hits[0]._source.priceUSD', null);
};

const getTokenMetrics = async (tokenAddress, period, granularity) => {
  const { dateFrom, dateTo } = getDatesForMetrics(period, granularity);

  const results = await elasticsearch.getClient().search({
    index: 'traded_tokens',
    body: {
      query: {
        bool: {
          filter: [
            {
              term: {
                tokenAddress,
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
            {
              range: {
                priceUSD: { gt: 0 },
              },
            },
            {
              range: {
                tradedAmountUSD: { gte: 1 },
              },
            },
          ],
        },
      },
      size: 0,
      aggs: {
        stats_by_date: {
          date_histogram: {
            field: 'date',
            calendar_interval: granularity,
            extended_bounds: {
              min: dateFrom,
              max: dateTo,
            },
          },
          aggs: {
            lastTrade: {
              top_hits: {
                size: '1',
                sort: [
                  {
                    date: {
                      order: 'desc',
                    },
                  },
                ],
                _source: { includes: ['priceUSD'] },
              },
            },
          },
        },
      },
    },
  });

  const prices = results.body.aggregations.stats_by_date.buckets.map(x => ({
    date: new Date(x.key_as_string),
    close: _.get(x, 'lastTrade.hits.hits.0._source.priceUSD'),
  }));

  const prevPeriodPrice = await getPriceForPreviousPeriod(
    tokenAddress,
    dateFrom,
  );

  const reducedPrices = prices.reduce((acc, value, index) => {
    const prev = index > 0 ? acc[index - 1] : undefined;
    const open = prev !== undefined ? prev.close : prevPeriodPrice;

    if (value.close === undefined && prev !== undefined) {
      return acc.concat({ date: value.date, close: prev.close, open });
    }

    if (value.close === undefined) {
      return acc.concat({ date: value.date, close: open, open });
    }

    return acc.concat({ ...value, open });
  }, []);

  return reducedPrices;
};

module.exports = getTokenMetrics;
