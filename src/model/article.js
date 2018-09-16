const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');

const schema = mongoose.Schema({
  author: String,
  date: { type: Date, index: -1 },
  feed: String,
  guid: { type: String, index: true },
  summary: String,
  title: String,
  url: String,
});

schema.plugin(mongoosePaginate);

const Model = mongoose.model('Article', schema);

module.exports = Model;
