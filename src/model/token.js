const mongoose = require('mongoose');

const { Schema } = mongoose;

const schema = Schema({
  address: String,
  circulatingSupply: Number,
  decimals: Number,
  imageUrl: { type: String, trim: true },
  name: String,
  symbol: String,
  totalSupply: Number,
  type: Number,
});

const Model = mongoose.model('Token', schema);

module.exports = Model;
