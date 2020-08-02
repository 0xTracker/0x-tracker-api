const App = require('../model/app');

const getAppBySlug = async slug => {
  const app = await App.findOne({ urlSlug: slug }).lean();

  return app;
};

module.exports = getAppBySlug;
