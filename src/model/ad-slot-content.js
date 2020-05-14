const mongoose = require('mongoose');

const schema = mongoose.Schema({
  dateFrom: Date,
  dateTo: Date,
  description: String,
  imageUrl: String,
  submissionEmail: String,
  submissionStatus: Number,
  tokenAddress: String,
  tokenId: Number,
  title: String,
  type: Number,
  url: String,
});

const Model = mongoose.model('AdSlotContent', schema);

module.exports = Model;
