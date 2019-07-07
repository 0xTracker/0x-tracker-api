const _ = require('lodash');

const AXIE_FIXTURE = require('../../../../fixtures/tokens/axie');
const BRAHMA_FIXTURE = require('../../../../fixtures/tokens/brahma');
const ETHFINEX_FIXTURE = require('../../../../fixtures/relayers/ethfinex');
const WETH_FIXTURE = require('../../../../fixtures/tokens/weth');
const ZRX_FIXTURE = require('../../../../fixtures/tokens/zrx');

const transformFill = require('./transform-fill');

const simpleFill = {
  id: '5b9107e00d05f400042e3494',
  prices: { maker: 0.275, taker: 3.6363636363636362, saved: true },
  makerAmount: 1,
  makerAsset: {
    assetProxyId: '0x02571792',
    tokenAddress: '0xf5b0a3efb8e8e4c201e2a935f110eaaf3ffecb8d',
    tokenId: 43381,
  },
  makerToken: '0xf5b0a3efb8e8e4c201e2a935f110eaaf3ffecb8d',
  takerAmount: 275000000000000000,
  takerAsset: {
    assetProxyId: '0xf47261b0',
    tokenAddress: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  },
  takerToken: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  blockHash:
    '0x104c0f29a6c776379a3d0e094d5321aa80d881139a654b179712a4cb6ab6a213',
  blockNumber: 103290935,
  conversions: {
    USD: {
      amount: 37.77675,
      makerFee: 0,
      takerFee: 0,
      makerPrice: 37.77675,
      takerPrice: 137.36999999999998,
    },
  },
  date: '2018-09-06T10:47:38.000Z',
  feeRecipient: '0xe269e891a2ec8585a378882ffa531141205e92e9',
  logIndex: 25,
  maker: '0x8dd688660ec0babd0b8a2f2de3232645f73cc5eb',
  makerFee: 15000000000000000000,
  orderHash:
    '0xd7cbdddb68cfa6216e867227a4cb8ca281e0d82921000b4b977d6038535482f5',
  protocolVersion: 2,
  relayerId: 21,
  roundedDates: {
    day: '2018-09-06T00:00:00.000Z',
    halfHour: '2018-09-06T10:30:00.000Z',
    hour: '2018-09-06T10:00:00.000Z',
    minute: '2018-09-06T10:47:00.000Z',
  },
  status: 1,
  taker: '0xe269e891a2ec8585a378882ffa531141205e92e9',
  takerFee: 5000000000000000000,
  tokenSaved: { maker: true, taker: true },
  transactionHash:
    '0x4c69e925be055eec7bc49cc681fd5267d1aca7e1db21f687ab19ab9d75b7447c',
};

const simpleV1Fill = {
  ...simpleFill,
  conversions: {
    USD: {
      amount: 1601.76195501,
      makerFee: 9.13,
      takerFee: 3.04,
      makerPrice: 224.42000000000002,
      takerPrice: 0.0053392065167000005,
    },
  },
  makerAmount: 7137340500000000000,
  makerAsset: undefined,
  makerToken: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  protocolVersion: 1,
  prices: { maker: 42032.46293209634, taker: 0.000023791135, saved: true },
  rates: {
    data: { ZRX: { USD: 0.6085 }, ETH: { USD: 224.42 } },
    saved: true,
  },
  takerAmount: 3e23,
  takerAsset: undefined,
  takerToken: '0xd7732e3783b0047aa251928960063f863ad022d8',
};

const tokens = {
  [AXIE_FIXTURE.address]: AXIE_FIXTURE,
  [BRAHMA_FIXTURE.address]: BRAHMA_FIXTURE,
  [WETH_FIXTURE.address]: WETH_FIXTURE,
  [ZRX_FIXTURE.address]: ZRX_FIXTURE,
};

const relayers = [ETHFINEX_FIXTURE];

describe('transformFill', () => {
  it('should transform V1 fill', () => {
    const viewModel = transformFill(tokens, relayers, simpleV1Fill);

    expect(viewModel).toMatchSnapshot();
  });

  it('should transform fill without relayer', () => {
    const fill = { ...simpleFill, relayerId: undefined };
    const viewModel = transformFill(tokens, relayers, fill);

    expect(viewModel.relayer).toBeNull();
  });

  it('should transform V1 fill with unrecognised maker token', () => {
    const fill = { ...simpleV1Fill, makerToken: '0x1234' };
    const viewModel = transformFill(tokens, relayers, fill);

    expect(
      viewModel.assets.find(asset => asset.traderType === 'maker'),
    ).toMatchSnapshot();
  });

  it('should transform V1 fill with unrecognised taker token', () => {
    const fill = { ...simpleV1Fill, takerToken: '0x9999' };
    const viewModel = transformFill(tokens, relayers, fill);

    expect(
      viewModel.assets.find(asset => asset.traderType === 'taker'),
    ).toMatchSnapshot();
  });

  it('should transform fill with unrecognised relayer', () => {
    const fill = { ...simpleFill, relayerId: 999 };
    const viewModel = transformFill(tokens, relayers, fill);

    expect(viewModel.relayer).toBeNull();
  });

  it('should transform pending fill', () => {
    const fill = { ...simpleFill, status: 0 };
    const viewModel = transformFill(tokens, relayers, fill);

    expect(viewModel.status).toBe('pending');
  });

  it('should transform successful fill', () => {
    const viewModel = transformFill(tokens, relayers, simpleFill);

    expect(viewModel.status).toBe('successful');
  });

  it('should transform failed fill', () => {
    const fill = { ...simpleV1Fill, status: 2 };
    const viewModel = transformFill(tokens, relayers, fill);

    expect(viewModel.status).toBe('failed');
  });

  it('should transform V2 fill', () => {
    const viewModel = transformFill(tokens, relayers, simpleFill);

    expect(viewModel).toMatchSnapshot();
  });

  it('should transform fill with unknown maker asset', () => {
    const viewModel = transformFill(tokens, relayers, {
      ...simpleFill,
      makerAsset: {
        assetProxyId: '0x02571792',
        tokenAddress: '0x12345',
        tokenId: 43381,
      },
    });

    const asset = _.find(viewModel.assets, { traderType: 'maker' });

    expect(asset).toMatchSnapshot();
  });

  it('should transform fill with unknown taker asset', () => {
    const viewModel = transformFill(tokens, relayers, {
      ...simpleFill,
      takerAsset: {
        assetProxyId: '0xf47261b0',
        tokenAddress: '0x12345',
      },
    });

    const asset = _.find(viewModel.assets, { traderType: 'taker' });

    expect(asset).toMatchSnapshot();
  });

  it('should transform ERC721 asset', () => {
    const viewModel = transformFill(tokens, relayers, simpleFill);
    const asset = _.find(viewModel.assets, { traderType: 'maker' });

    expect(asset).toMatchSnapshot();
  });

  it('should transform ERC20 asset', () => {
    const viewModel = transformFill(tokens, relayers, simpleFill);
    const asset = _.find(viewModel.assets, { traderType: 'taker' });

    expect(asset).toMatchSnapshot();
  });
});
