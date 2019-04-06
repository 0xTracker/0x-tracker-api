const mongoose = require('mongoose');

const { Schema } = mongoose;

const schema = mongoose.Schema({
  feeRecipients: [String],
  id: String,
  imageUrl: String,
  lookupId: Number,
  name: String,
  orderMatcher: Boolean,
  prices: Schema.Types.Mixed,
  slug: String,
  stats: Schema.Types.Mixed,
  takerAddresses: [String],
  url: String,
});

const Model = mongoose.model('Relayer', schema);

module.exports = Model;
