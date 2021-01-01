const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');

const schema = mongoose.Schema({
  author: String,
  content: String,
  date: Date,
  feed: String,
  guid: String,
  metadata: mongoose.Schema.Types.Mixed,
  slug: String,
  summary: String,
  title: String,
  url: String,
});

schema.plugin(mongoosePaginate);

schema.virtual('feedMetadata', {
  ref: 'ArticleFeed',
  localField: 'feed',
  foreignField: '_id',
  justOne: true,
});

const Model = mongoose.model('Article', schema);

module.exports = Model;
