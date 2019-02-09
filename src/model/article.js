const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');

const schema = mongoose.Schema({
  author: String,
  date: Date,
  feed: String,
  guid: String,
  summary: String,
  title: String,
  url: String,
});

schema.plugin(mongoosePaginate);

const Model = mongoose.model('Article', schema);

module.exports = Model;
