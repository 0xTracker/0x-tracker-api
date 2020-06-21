const { BigNumber } = require('@0xproject/utils');
const mongoose = require('mongoose');

const getFeesForFill = require('./get-fees-for-fill');
const V2_FILL = require('../fixtures/fills/v2');
const V3_FILL = require('../fixtures/fills/v3');

const { ObjectId } = mongoose.Types;

describe('getFeesForFill', () => {
  it('should return fees for V2 fill', () => {
    const fees = getFeesForFill(V2_FILL);

    expect(fees).toEqual([
      {
        amount: {
          USD: 0.000561919395752856,
          token: new BigNumber('0.001683905890778712'),
        },
        token: {
          address: '0xe41d2489571d322189246dafa5ebde1f4699f498',
          id: null,
          name: '0x Protocol Token',
          symbol: 'ZRX',
          type: 'erc-20',
        },
        traderType: 'maker',
      },
      {
        amount: { USD: 0.0011011989879, token: new BigNumber('0.003299967') },
        token: {
          address: '0xe41d2489571d322189246dafa5ebde1f4699f498',
          id: null,
          name: '0x Protocol Token',
          symbol: 'ZRX',
          type: 'erc-20',
        },
        traderType: 'taker',
      },
    ]);
  });

  it('should return fees for V3 fill', () => {
    const fees = getFeesForFill(V3_FILL);

    expect(fees).toEqual([
      {
        amount: { token: new BigNumber(0.00000074), USD: 0.000015 },
        token: {
          address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
          id: null,
          name: 'Wrapped Ether',
          symbol: 'WETH',
          type: 'erc-20',
        },
        traderType: 'taker',
      },
    ]);
  });

  it('should return empty array for V3 fill without fees', () => {
    const fees = getFeesForFill({ ...V3_FILL, fees: [] });
    expect(fees).toEqual([]);
  });

  it('should exclude zero value fees from V3 fill', () => {
    const fees = getFeesForFill({
      ...V3_FILL,
      fees: [
        ...V3_FILL.fees,
        {
          _id: ObjectId('5eebfc000df3692b190899d3'),
          amount: {
            token: 0,
          },
          tokenAddress: '0xf71f01bb0c0cb0739603c55950884a5690772676',
          traderType: 0,
        },
      ],
    });

    expect(fees).toEqual([
      {
        amount: { token: new BigNumber(0.00000074), USD: 0.000015 },
        token: {
          address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
          id: null,
          name: 'Wrapped Ether',
          symbol: 'WETH',
          type: 'erc-20',
        },
        traderType: 'taker',
      },
    ]);
  });

  it('should only return maker fee when V2 fill has no taker fee', () => {
    const fees = getFeesForFill({ ...V2_FILL, takerFee: 0 });

    expect(fees).toEqual([
      {
        amount: {
          USD: 0.000561919395752856,
          token: new BigNumber('0.001683905890778712'),
        },
        token: {
          address: '0xe41d2489571d322189246dafa5ebde1f4699f498',
          id: null,
          name: '0x Protocol Token',
          symbol: 'ZRX',
          type: 'erc-20',
        },
        traderType: 'maker',
      },
    ]);
  });

  it('should only return taker fee when V2 fill has no maker fee', () => {
    const fees = getFeesForFill({ ...V2_FILL, makerFee: 0 });

    expect(fees).toEqual([
      {
        amount: { USD: 0.0011011989879, token: new BigNumber('0.003299967') },
        token: {
          address: '0xe41d2489571d322189246dafa5ebde1f4699f498',
          id: null,
          name: '0x Protocol Token',
          symbol: 'ZRX',
          type: 'erc-20',
        },
        traderType: 'taker',
      },
    ]);
  });

  it('should return empty array when V2 fill has no fees', () => {
    const fees = getFeesForFill({ ...V2_FILL, makerFee: 0, takerFee: 0 });

    expect(fees).toEqual([]);
  });
});
