const moment = require('moment');

const { GRANULARITY } = require('../constants');
const elasticsearch = require('../util/elasticsearch');

const getRelayerMetrics = async (relayerId, dateFrom, dateTo, granularity) => {
  if (granularity === GRANULARITY.HOUR) {
    const results = await elasticsearch.getClient().search({
      body: {
        query: {
          bool: {
            filter: [
              {
                range: {
                  date: {
                    gte: moment
                      .utc(dateFrom)
                      .startOf('hour')
                      .toDate(),
                    lte: moment
                      .utc(dateTo)
                      .endOf('hour')
                      .toDate(),
                  },
                },
              },
              {
                term: {
                  relayerId,
                },
              },
            ],
          },
        },
      },
      index: 'relayer_metrics_hourly',
      size: moment.utc(dateTo).diff(moment.utc(dateFrom), 'hours'),
    });

    return results.body.hits.hits.map(x => ({
      date: new Date(x._source.date),
      fillCount: x._source.fillCount,
      fillVolume: x._source.fillVolume,
      makerCount: x._source.makerCount,
      takerCount: x._source.takerCount,
      traderCount: x._source.traderCount,
      tradeCount: x._source.tradeCount,
      tradeVolume: x._source.tradeVolume,
    }));
  }

  const results = await elasticsearch.getClient().search({
    index: 'relayer_metrics_hourly',
    body: {
      aggs: {
        relayer_metrics_by_day: {
          date_histogram: {
            field: 'date',
            calendar_interval: '1d',
          },
          aggs: {
            fillCount: {
              sum: { field: 'fillCount' },
            },
            fillVolume: {
              sum: { field: 'fillVolume' },
            },
            makerCount: {
              sum: { field: 'makerCount' },
            },
            takerCount: {
              sum: { field: 'takerCount' },
            },
            traderCount: {
              sum: { field: 'traderCount' },
            },
            tradeCount: {
              sum: { field: 'tradeCount' },
            },
            tradeVolume: {
              sum: { field: 'tradeVolume' },
            },
          },
        },
      },
      size: 0,
      query: {
        bool: {
          filter: [
            {
              range: {
                date: {
                  gte: moment
                    .utc(dateFrom)
                    .startOf('day')
                    .toDate(),
                  lte: moment
                    .utc(dateTo)
                    .endOf('day')
                    .toDate(),
                },
              },
            },
            {
              term: {
                relayerId,
              },
            },
          ],
        },
      },
    },
  });

  return results.body.aggregations.relayer_metrics_by_day.buckets.map(x => ({
    date: new Date(x.key_as_string),
    fillCount: x.fillCount.value,
    fillVolume: x.fillVolume.value,
    makerCount: x.makerCount.value,
    takerCount: x.takerCount.value,
    traderCount: x.traderCount.value,
    tradeCount: x.tradeCount.value,
    tradeVolume: x.tradeVolume.value,
  }));
};

module.exports = getRelayerMetrics;
