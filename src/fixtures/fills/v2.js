const mongoose = require('mongoose');

const { ObjectId } = mongoose.Types;

const V2_FILL = {
  _id: ObjectId('5d014e95c180f10004894f3a'),
  rates: {
    data: {
      ZRX: {
        USD: 0.3337,
      },
      ETH: {
        USD: 257.83,
      },
    },
  },
  status: 1,
  blockHash:
    '0xcfbb787812b61bf83a123d6f9c387745caf7838b9ea056796c794d556a808ec4',
  blockNumber: 127162120,
  date: Date('2019-06-12T19:08:08.000Z'),
  feeRecipient: '0x2a5f5f36c20d7e56358db78bbfac0bace25c1198',
  logIndex: 82,
  maker: '0x05ef80bbca154cd63b43728421dea896fdbc5295',
  makerFee: 1683905890778712.0,
  orderHash:
    '0x259aaa6227f23abd85c01b4e6ba4300195d60e970a07113560c7ab38739196f6',
  protocolVersion: 2,
  relayerId: 22,
  senderAddress: '0x409b512e1cf94500877c5353b2a0c13b2d24914f',
  taker: '0x409b512e1cf94500877c5353b2a0c13b2d24914f',
  takerFee: 3299967000000000.0,
  transactionHash:
    '0x0d6f5746a29b4f9707b64ab03efb2be6182648c4b8f6f7cbeef15ada5e066ea3',
  __v: 2,
  conversions: {
    USD: {
      amount: 0.5615481244626,
      makerFee: 0.000561919395752856,
      takerFee: 0.0011011989879,
    },
  },
  hasValue: true,
  assets: [
    {
      tokenResolved: true,
      _id: ObjectId('5d34d5a3776b8100040ae821'),
      actor: 0,
      amount: 2177978220000000.0,
      price: {
        USD: 257.83,
      },
      tokenAddress: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
      value: {
        USD: 0.5615481244626,
      },
    },
    {
      tokenResolved: true,
      _id: ObjectId('5d34d5a3776b8100040ae820'),
      actor: 1,
      amount: 1.099989e18,
      price: {
        USD: 0.5105034,
      },
      tokenAddress: '0xe41d2489571d322189246dafa5ebde1f4699f498',
      value: {
        USD: 0.5615481244626,
      },
    },
  ],
  pricingStatus: 0,
  immeasurable: false,
};

module.exports = V2_FILL;
