const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');

const { FILL_STATUS } = require('../constants');

const { Schema } = mongoose;

const schema = Schema({
  blockHash: String,
  blockNumber: Number,
  conversions: {
    USD: {
      amount: Number,
      makerFee: Number,
      makerPrice: Number,
      takerFee: Number,
      takerPrice: Number,
    },
  },
  date: Date,
  feeRecipient: String,
  logIndex: Number,
  maker: String,
  makerAsset: {
    assetProxyId: String,
    tokenAddress: String,
    tokenId: Number,
  },
  makerAmount: Number,
  makerFee: Number,
  makerToken: String,
  orderHash: String,
  prices: {
    maker: Number,
    taker: Number,
    saved: { default: false, type: Boolean },
  },
  protocolVersion: Number,
  rates: {
    data: Schema.Types.Mixed,
    saved: { default: false, type: Boolean },
  },
  relayerId: Number,
  roundedDates: {
    day: Date,
    halfHour: Date,
    hour: Date,
    minute: Date,
  },
  senderAddress: String,
  status: { default: FILL_STATUS.PENDING, type: Number },
  taker: String,
  takerAsset: {
    assetProxyId: String,
    tokenAddress: String,
    tokenId: Number,
  },
  takerAmount: Number,
  takerFee: Number,
  takerToken: String,
  tokenSaved: {
    maker: Boolean,
    taker: Boolean,
  },
  transactionHash: String,
});

schema.plugin(mongoosePaginate);

const Model = mongoose.model('Fill', schema);

module.exports = Model;
