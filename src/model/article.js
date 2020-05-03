const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');

const schema = mongoose.Schema({
  author: String,
  content: String,
  date: Date,
  feed: String,
  guid: String,
  slug: String,
  summary: String,
  title: String,
  url: String,
});

schema.plugin(mongoosePaginate);

const Model = mongoose.model('Article', schema);

module.exports = Model;
