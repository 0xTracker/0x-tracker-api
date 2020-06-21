const mongoose = require('mongoose');

const { ObjectId } = mongoose.Types;

module.exports = {
  _id: ObjectId('5eebfbeed61d6316f3a63720'),
  conversions: {
    USD: {
      makerFee: 0,
      takerFee: 0,
      amount: 0.0858807,
      protocolFee: 1.044495,
    },
  },
  hasValue: true,
  immeasurable: false,
  status: 1,
  assets: [
    {
      tokenResolved: true,
      _id: ObjectId('5eebfc000df3692b190899d1'),
      amount: 1e18,
      tokenAddress: '0xd6a55c63865affd67e2fb9f284f87b7a9e5ff3bd',
      actor: 0,
      price: {
        USD: 0.0858807,
      },
      value: {
        USD: 0.0858807,
      },
    },
    {
      tokenResolved: true,
      _id: ObjectId('5eebfc000df3692b190899d0'),
      amount: 370000000000000.0,
      tokenAddress: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
      actor: 1,
      price: {
        USD: 232.11,
      },
      value: {
        USD: 0.0858807,
      },
    },
  ],
  blockHash:
    '0x61972a5d542ccdeb83e28c80472f0d46951cd67722e0aefa143dccfe83ba9f4a',
  blockNumber: 10292676,
  date: Date('2020-06-18T23:39:13.000Z'),
  eventId: ObjectId('5eebfbeed61d6316f3a63720'),
  fees: [
    {
      _id: ObjectId('5eebfc000df3692b190899d2'),
      amount: {
        token: 740000000000.0,
        USD: 0.000015,
      },
      token: {
        _id: ObjectId('5a3c789201d64f914cbc509b'),
        address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        __v: 0,
        name: 'Wrapped Ether',
        symbol: 'WETH',
        decimals: 18,
        imageUrl:
          'https://raw.githubusercontent.com/TrustWallet/tokens/master/tokens/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2.png',
        price: {
          lastTrade: {
            id: ObjectId('5ec9898596b8d44745b88fbe'),
            date: Date('2020-05-23T20:35:08.000Z'),
          },
          lastPrice: 208.18,
        },
        type: 0,
        resolved: true,
        updatedAt: Date('2020-06-21T16:35:09.995Z'),
        createdAt: Date('2020-04-11T19:22:30.410Z'),
        totalSupply: 2126895.60799883,
      },
      tokenAddress: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
      traderType: 1,
    },
  ],
  feeRecipient: '0x10aa8c82e3656170baae80d189b8b7dcea6865c9',
  logIndex: 124,
  maker: '0xd00995a10db2e58a1a90270485056629134b151b',
  orderHash:
    '0x34621e3d3d201fab88e5fa28bbe275d43cb972c5a0300f41b2b10006351d2e45',
  protocolFee: 4500000000000000.0,
  protocolVersion: 3,
  relayerId: 34,
  senderAddress: '0x4aa817c6f383c8e8ae77301d18ce48efb16fd2be',
  taker: '0x4aa817c6f383c8e8ae77301d18ce48efb16fd2be',
  transactionHash:
    '0x0bcbb490f4ff1f209d69daa2347eb2bcdf57726224d3be5c62a2e65f45860c02',
  __v: 0,
  pricingStatus: 0,
};
