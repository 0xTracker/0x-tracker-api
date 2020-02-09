const moment = require('moment');

const { ETH_TOKEN_DECIMALS, GRANULARITY } = require('../constants');
const elasticsearch = require('../util/elasticsearch');
const formatTokenAmount = require('../tokens/format-token-amount');

const getNetworkMetrics = async (dateFrom, dateTo, granularity) => {
  if (granularity === GRANULARITY.HOUR) {
    const results = await elasticsearch.getClient().search({
      body: {
        query: {
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
      },
      index: 'network_metrics_hourly',
      size: moment.utc(dateTo).diff(moment.utc(dateFrom), 'hours'),
    });

    return results.body.hits.hits.map(x => ({
      activeMakers: x._sourcemakerCount,
      activeTakers: x._source.takerCount,
      activeTraders: x._source.traderCount,
      date: new Date(x._source.date),
      fillCount: x._source.fillCount,
      fillVolume: x._source.fillVolume,
      protocolFees: {
        ETH: formatTokenAmount(x._source.protocolFeesETH, ETH_TOKEN_DECIMALS),
        USD: x._source.protocolFeesUSD,
      },
      tradeCount: x._source.tradeCount,
      tradeVolume: x._source.tradeVolume,
    }));
  }

  const results = await elasticsearch.getClient().search({
    index: 'network_metrics_hourly',
    body: {
      aggs: {
        network_metrics_by_day: {
          date_histogram: {
            field: 'date',
            calendar_interval: granularity,
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
            protocolFeesETH: {
              sum: { field: 'protocolFeesETH' },
            },
            protocolFeesUSD: {
              sum: { field: 'protocolFeesUSD' },
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
    },
  });

  return results.body.aggregations.network_metrics_by_day.buckets.map(x => ({
    activeMakers: x.makerCount.value,
    activeTraders: x.traderCount.value,
    activeTakers: x.takerCount.value,
    date: new Date(x.key_as_string),
    fillCount: x.fillCount.value,
    fillVolume: x.fillVolume.value,
    protocolFees: {
      ETH: formatTokenAmount(x.protocolFeesETH.value, ETH_TOKEN_DECIMALS),
      USD: x.protocolFeesUSD.value,
    },
    tradeCount: x.tradeCount.value,
    tradeVolume: x.tradeVolume.value,
  }));
};

module.exports = getNetworkMetrics;
