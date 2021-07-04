const mongoose = require('mongoose');

const { Schema } = mongoose;

const schema = Schema({
  address: String,
  decimals: Number,
  imageUrl: { type: String, trim: true },
  name: String,
  symbol: String,
  type: Number,
});

const Model = mongoose.model('Token', schema);

module.exports = Model;
