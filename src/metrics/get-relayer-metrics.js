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
              relayerId !== null
                ? {
                    term: {
                      relayerId,
                    },
                  }
                : undefined,
            ].filter(x => x !== undefined),
          },
        },
      },
      index:
        relayerId === null
          ? 'unknown_relayer_metrics_hourly'
          : 'relayer_metrics_hourly',
      size: 168,
    });

    return results.body.hits.hits.map(x => ({
      activeMakers: x._source.makerCount,
      activeTakers: x._source.takerCount,
      activeTraders: x._source.traderCount,
      date: new Date(x._source.date),
      fillCount: x._source.fillCount,
      fillVolume: x._source.fillVolume,
      tradeCount: x._source.tradeCount,
      tradeVolume: x._source.tradeVolume,
    }));
  }

  const results = await elasticsearch.getClient().search({
    index:
      relayerId === null
        ? 'unknown_relayer_metrics_hourly'
        : 'relayer_metrics_hourly',
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
            relayerId !== null
              ? {
                  term: {
                    relayerId,
                  },
                }
              : undefined,
          ].filter(x => x !== undefined),
        },
      },
    },
  });

  return results.body.aggregations.relayer_metrics_by_day.buckets.map(x => ({
    activeMakers: x.makerCount.value,
    activeTakers: x.takerCount.value,
    activeTraders: x.traderCount.value,
    date: new Date(x.key_as_string),
    fillCount: x.fillCount.value,
    fillVolume: x.fillVolume.value,
    tradeCount: x.tradeCount.value,
    tradeVolume: x.tradeVolume.value,
  }));
};

module.exports = getRelayerMetrics;
