const mongoose = require('mongoose');

const { Schema } = mongoose;

const schema = Schema({
  data: Schema.Types.Mixed,
  key: String,
});

const Model = mongoose.model('CacheEntry', schema);

module.exports = Model;
