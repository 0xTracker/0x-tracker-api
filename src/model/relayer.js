const mongoose = require('mongoose');

const schema = mongoose.Schema({
  feeRecipients: [String],
  id: String,
  imageUrl: String,
  lookupId: Number,
  name: String,
  orderMatcher: Boolean,
  slug: String,
  takerAddresses: [String],
  url: String,
});

const Model = mongoose.model('Relayer', schema);

module.exports = Model;
