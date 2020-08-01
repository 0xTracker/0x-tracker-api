const _ = require('lodash');

const transformApp = (app, stats) => {
  return _.pickBy(
    {
      categories: app.categories,
      id: app.id,
      logoUrl: _.get(app, 'logoUrl', null),
      name: app.name,
      stats,
      urlSlug: app.urlSlug,
      websiteUrl: _.get(app, 'websiteUrl', null),
    },
    val => val !== undefined,
  );
};

module.exports = transformApp;
