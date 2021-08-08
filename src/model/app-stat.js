const mongoose = require('mongoose');

const schema = mongoose.Schema({
  appId: String,
  period: String,
  activeTraders: Number,
  activeTradersChange: Number,
});

const Model = mongoose.model('AppStat', schema);

module.exports = Model;
