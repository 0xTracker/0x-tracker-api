const mongoose = require('mongoose');

const schema = mongoose.Schema({
  _id: { required: true, type: String },
  categories: [{ required: true, type: String }],
  logoUrl: { required: true, type: String },
  name: { required: true, type: String },
  urlSlug: { required: true, type: String },
  websiteUrl: String,
});

const App = mongoose.model('App', schema);

module.exports = App;
