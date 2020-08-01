const _ = require('lodash');

const App = require('../model/app');
const elasticsearch = require('../util/elasticsearch');

const getAppsWithStatsForDates = async (dateFrom, dateTo, options) => {
  const { page, limit } = _.defaults({}, options, {
    page: 1,
    limit: 20,
  });

  const response = await elasticsearch.getClient().search({
    index: 'app_fill_attributions',
    body: {
      aggs: {
        apps: {
          terms: {
            field: 'appId',
            order: { totalVolume: 'desc' },
            size: limit * page,
          },
          aggs: {
            relayedTrades: {
              sum: {
                field: 'relayedTrades',
              },
            },
            relayedVolume: {
              sum: {
                field: 'relayedVolume',
              },
            },
            sourcedTrades: {
              sum: {
                field: 'sourcedTrades',
              },
            },
            sourcedVolume: {
              sum: {
                field: 'sourcedVolume',
              },
            },
            totalTrades: {
              sum: {
                field: 'totalTrades',
              },
            },
            totalVolume: {
              sum: {
                field: 'totalVolume',
              },
            },
            bucket_truncate: {
              bucket_sort: {
                size: limit,
                from: (page - 1) * limit,
              },
            },
          },
        },
        appCount: {
          cardinality: {
            field: 'appId',
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

  const appCount = response.body.aggregations.appCount.value;
  const appBuckets = response.body.aggregations.apps.buckets;
  const appIds = appBuckets.map(bucket => bucket.key);
  const apps = await App.find({ _id: { $in: appIds } }).lean();

  const appsWithStats = appBuckets.map(bucket => {
    const appId = bucket.key;
    const app = apps.find(r => r._id === appId);

    return {
      categories: app.categories,
      id: app.id,
      logoUrl: _.get(app, 'logoUrl', null),
      name: app.name,
      stats: {
        relayedTrades: bucket.relayedTrades.value,
        relayedVolume: bucket.relayedVolume.value,
        sourcedTrades: bucket.sourcedTrades.value,
        sourcedVolume: bucket.sourcedVolume.value,
        totalVolume: bucket.totalVolume.value,
        totalTrades: bucket.totalTrades.value,
      },
      urlSlug: app.urlSlug,
      websiteUrl: _.get(app, 'websiteUrl', null),
    };
  });

  return {
    apps: appsWithStats,
    resultCount: appCount,
  };
};

module.exports = getAppsWithStatsForDates;
