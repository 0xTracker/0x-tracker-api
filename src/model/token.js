const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');

const { Schema } = mongoose;

const tokenStatsShape = {
  trades: Number,
  volume: {
    token: Number,
    USD: Number,
  },
  volumeShare: Number,
};

const schema = Schema({
  address: String,
  decimals: Number,
  imageUrl: { type: String, trim: true },
  name: String,
  price: {
    lastTrade: {
      date: Date,
      id: { type: Schema.Types.ObjectId, Ref: 'Fill' },
    },
    lastPrice: Number,
  },
  stats: {
    '1m': tokenStatsShape,
    '7d': tokenStatsShape,
    '24h': tokenStatsShape,
  },
  symbol: String,
  type: Number,
});

schema.plugin(mongoosePaginate);

const Model = mongoose.model('Token', schema);

module.exports = Model;
