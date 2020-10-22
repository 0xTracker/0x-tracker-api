const _ = require('lodash');
const moment = require('moment');

const AttributionEntity = require('../model/attribution-entity');
const elasticsearch = require('../util/elasticsearch');

const getSuggestedApps = async limit => {
  const response = await elasticsearch.getClient().search({
    index: 'fills',
    body: {
      aggs: {
        attributions: {
          nested: { path: 'attributions' },
          aggs: {
            apps: {
              filter: {
                terms: {
                  'attributions.type': [0, 1],
                },
              },
              aggs: {
                stats_by_app: {
                  terms: {
                    field: 'attributions.id',
                    order: { 'attribution>tradeVolume': 'desc' },
                    size: limit,
                  },
                  aggs: {
                    attribution: {
                      reverse_nested: {},
                      aggs: {
                        tradeVolume: {
                          sum: {
                            field: 'tradeVolume',
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      size: 0,
      query: {
        range: {
          date: {
            gte: moment()
              .subtract(30, 'days')
              .toDate(),
          },
        },
      },
    },
  });

  const appBuckets =
    response.body.aggregations.attributions.apps.stats_by_app.buckets;
  const appIds = appBuckets.map(bucket => bucket.key);
  const apps = await AttributionEntity.find({ _id: { $in: appIds } }).lean();

  return appBuckets.map(bucket => {
    const app = apps.find(a => a._id === bucket.key);

    return {
      id: app._id,
      logoUrl: _.get(app, 'logoUrl', null),
      name: app.name,
      urlSlug: app.urlSlug,
      websiteUrl: _.get(app, 'websiteUrl', null),
    };
  });
};

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

const searchApps = async (query, options) => {
  if (query === '' || query === null) {
    const suggestedApps = await getSuggestedApps(options.limit);

    return suggestedApps;
  }

  const matchingApps = await AttributionEntity.find({
    name: new RegExp(escapeRegex(query), 'ig'),
  })
    .sort({ name: 1 })
    .limit(options.limit)
    .lean();

  return matchingApps.map(app => ({
    id: app._id,
    logoUrl: _.get(app, 'logoUrl', null),
    name: app.name,
    urlSlug: app.urlSlug,
    websiteUrl: _.get(app, 'websiteUrl', null),
  }));
};

module.exports = searchApps;
