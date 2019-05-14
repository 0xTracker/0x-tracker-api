const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');

const { Schema } = mongoose;

const relayerStatsShape = {
  fees: {
    USD: Number,
    ZRX: String,
  },
  trades: Number,
  volume: Number,
  volumeShare: Number,
};

const schema = mongoose.Schema({
  feeRecipients: [String],
  id: String,
  imageUrl: String,
  lookupId: Number,
  name: String,
  orderMatcher: Boolean,
  prices: Schema.Types.Mixed,
  slug: String,
  stats: {
    '1m': relayerStatsShape,
    '7d': relayerStatsShape,
    '24h': relayerStatsShape,
  },
  takerAddresses: [String],
  url: String,
});

schema.plugin(mongoosePaginate);

const Model = mongoose.model('Relayer', schema);

module.exports = Model;
