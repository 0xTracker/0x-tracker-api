const _ = require('lodash');

const AXIE_FIXTURE = require('../../../../fixtures/tokens/axie');
const BRAHMA_FIXTURE = require('../../../../fixtures/tokens/brahma');
const ETHFINEX_FIXTURE = require('../../../../fixtures/relayers/ethfinex');
const WETH_FIXTURE = require('../../../../fixtures/tokens/weth');
const ZRX_FIXTURE = require('../../../../fixtures/tokens/zrx');

const transformFill = require('./transform-fill');

const simpleFill = {
  id: '5b9107e00d05f400042e3494',
  conversions: {
    USD: {
      amount: 37.77675,
      makerFee: 0,
      takerFee: 0,
    },
  },
  date: '2018-09-06T10:47:38.000Z',
  feeRecipient: '0xe269e891a2ec8585a378882ffa531141205e92e9',
  maker: '0x8dd688660ec0babd0b8a2f2de3232645f73cc5eb',
  makerFee: 15000000000000000000,
  orderHash:
    '0xd7cbdddb68cfa6216e867227a4cb8ca281e0d82921000b4b977d6038535482f5',
  protocolVersion: 2,
  relayerId: 21,
  status: 1,
  taker: '0xe269e891a2ec8585a378882ffa531141205e92e9',
  takerFee: 5000000000000000000,
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
    },
  },
  protocolVersion: 1,
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
    const fill = { ...simpleV1Fill };
    const viewModel = transformFill(tokens, relayers, fill);

    expect(
      viewModel.assets.find(asset => asset.traderType === 'maker'),
    ).toMatchSnapshot();
  });

  it('should transform V1 fill with unrecognised taker token', () => {
    const fill = { ...simpleV1Fill };
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
    });

    const asset = _.find(viewModel.assets, { traderType: 'maker' });

    expect(asset).toMatchSnapshot();
  });

  it('should transform fill with unknown taker asset', () => {
    const viewModel = transformFill(tokens, relayers, {
      ...simpleFill,
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
