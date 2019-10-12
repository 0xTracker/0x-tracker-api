const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');

const { FILL_STATUS } = require('../constants');

const { Schema } = mongoose;

const schema = Schema({
  assets: [
    {
      actor: Number,
      amount: Number,
      price: {
        USD: Number,
      },
      tokenAddress: String,
      tokenId: Number,
    },
  ],
  conversions: {
    USD: {
      amount: Number,
      makerFee: Number,
      takerFee: Number,
    },
  },
  date: Date,
  feeRecipient: String,
  maker: String,
  makerFee: Number,
  orderHash: String,
  protocolFee: Number,
  protocolVersion: Number,
  relayerId: Number,
  senderAddress: String,
  status: { default: FILL_STATUS.PENDING, type: Number },
  taker: String,
  takerFee: Number,
  transactionHash: String,
});

schema.plugin(mongoosePaginate);

const Model = mongoose.model('Fill', schema);

module.exports = Model;
