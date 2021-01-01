const mongoose = require('mongoose');

const { Schema } = mongoose;

const schema = Schema({
  _id: { required: true, type: String },
  attributionEntityId: String,
  feedUrl: { required: true, type: String },
  imageUrl: String,
  isActive: { default: true, required: true, type: Boolean },
  name: String,
  urlSlug: String,
  websiteUrl: String,
});

schema.virtual('attributionEntity', {
  ref: 'AttributionEntity',
  localField: 'attributionEntityId',
  foreignField: '_id',
  justOne: true,
});

const ArticleFeed = mongoose.model('ArticleFeed', schema);

module.exports = ArticleFeed;
