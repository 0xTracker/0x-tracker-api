const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');

const { Schema } = mongoose;

const schema = Schema({
  address: { type: String, index: true, unique: true },
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
  symbol: String,
});

schema.plugin(mongoosePaginate);

const Model = mongoose.model('Token', schema);

module.exports = Model;
