const mongoose = require('mongoose');

const { FILL_STATUS } = require('../constants');

const { Schema } = mongoose;

require('./attribution-entity');
require('./transaction');

const schema = Schema({
  affiliateAddress: String,
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
  attributions: [
    {
      entityId: String,
      type: {
        type: Number,
      },
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

schema.virtual('assets.token', {
  ref: 'Token',
  localField: 'assets.tokenAddress',
  foreignField: 'address',
  justOne: true,
});

schema.virtual('assets.bridgeMetadata', {
  ref: 'AddressMetadata',
  localField: 'assets.bridgeAddress',
  foreignField: 'address',
  justOne: true,
});

schema.virtual('fees.token', {
  ref: 'Token',
  localField: 'fees.tokenAddress',
  foreignField: 'address',
  justOne: true,
});

schema.virtual('affiliate', {
  ref: 'AddressMetadata',
  localField: 'affiliateAddress',
  foreignField: 'address',
  justOne: true,
});

schema.virtual('makerMetadata', {
  ref: 'AddressMetadata',
  localField: 'maker',
  foreignField: 'address',
  justOne: true,
});

schema.virtual('takerMetadata', {
  ref: 'AddressMetadata',
  localField: 'taker',
  foreignField: 'address',
  justOne: true,
});

schema.virtual('transaction', {
  ref: 'Transaction',
  localField: 'transactionHash',
  foreignField: 'hash',
  justOne: true,
});

schema.virtual('attributions.entity', {
  ref: 'AttributionEntity',
  localField: 'attributions.entityId',
  foreignField: '_id',
  justOne: true,
});

schema.virtual('senderMetadata', {
  ref: 'AddressMetadata',
  localField: 'senderAddress',
  foreignField: 'address',
  justOne: true,
});

schema.virtual('feeRecipientMetadata', {
  ref: 'AddressMetadata',
  localField: 'feeRecipient',
  foreignField: 'address',
  justOne: true,
});

const Model = mongoose.model('Fill', schema);

module.exports = Model;
