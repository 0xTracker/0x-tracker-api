const mongoose = require('mongoose');

const { FILL_STATUS } = require('../constants');

const { Schema } = mongoose;

const schema = Schema({
  assets: [
    {
      actor: Number,
      amount: Number,
      bridgeAddress: String,
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
      protocolFee: Number,
      takerFee: Number,
    },
  },
  date: Date,
  fees: [
    {
      amount: { token: Number, USD: Number },
      tokenAddress: String,
      tokenId: Number,
      traderType: Number,
    },
  ],
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

schema.virtual('relayer', {
  ref: 'Relayer',
  localField: 'relayerId',
  foreignField: 'lookupId',
  justOne: true,
});

const Model = mongoose.model('Fill', schema);

module.exports = Model;
