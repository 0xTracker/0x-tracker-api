const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');

const schema = mongoose.Schema({
  appId: String,
  period: String,
  activeTraders: Number,
  activeTradersChange: Number,
});

schema.plugin(mongoosePaginate);

const Model = mongoose.model('AppStat', schema);

module.exports = Model;
