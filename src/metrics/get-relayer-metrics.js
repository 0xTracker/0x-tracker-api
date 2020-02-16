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
                    gte: dateFrom,
                    lte: dateTo,
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
      size: 200,
    });

    return results.body.hits.hits.map(x => ({
      date: new Date(x._source.date),
      fillCount: x._source.fillCount,
      fillVolume: x._source.fillVolume,
      tradeCount:
        relayerId === null ? x._source.fillCount : x._source.tradeCount,
      tradeVolume:
        relayerId === null ? x._source.fillVolume : x._source.tradeVolume,
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
                  gte: dateFrom,
                  lte: dateTo,
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
    date: new Date(x.key_as_string),
    fillCount: x.fillCount.value,
    fillVolume: x.fillVolume.value,
    tradeCount: relayerId === null ? x.fillCount.value : x.tradeCount.value,
    tradeVolume: relayerId === null ? x.fillVolume.value : x.tradeVolume.value,
  }));
};

module.exports = getRelayerMetrics;
