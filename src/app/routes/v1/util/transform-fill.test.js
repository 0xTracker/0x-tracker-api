const BRAHMA_FIXTURE = require('../../../../fixtures/tokens/brahma');
const ETHFINEX_FIXTURE = require('../../../../fixtures/relayers/ethfinex');
const WETH_FIXTURE = require('../../../../fixtures/tokens/weth');
const ZRX_FIXTURE = require('../../../../fixtures/tokens/zrx');

const transformFill = require('./transform-fill');

const simpleFill = {
  id: '5b9107e00d05f400042e3494',
  prices: { maker: 42032.46293209634, taker: 0.000023791135, saved: true },
  rates: {
    data: { ZRX: { USD: 0.6085 }, ETH: { USD: 224.42 } },
    saved: true,
  },
  roundedDates: {
    day: '2018-09-06T00:00:00.000Z',
    halfHour: '2018-09-06T10:30:00.000Z',
    hour: '2018-09-06T10:00:00.000Z',
    minute: '2018-09-06T10:47:00.000Z',
  },
  tokenSaved: { maker: true, taker: true },
  status: 1,
  blockHash:
    '0x104c0f29a6c776379a3d0e094d5321aa80d881139a654b179712a4cb6ab6a213',
  blockNumber: 103290935,
  date: '2018-09-06T10:47:38.000Z',
  feeRecipient: '0xe269e891a2ec8585a378882ffa531141205e92e9',
  logIndex: 25,
  maker: '0x8dd688660ec0babd0b8a2f2de3232645f73cc5eb',
  makerAmount: 7137340500000000000,
  makerFee: 15000000000000000000,
  makerToken: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  orderHash:
    '0xd7cbdddb68cfa6216e867227a4cb8ca281e0d82921000b4b977d6038535482f5',
  protocolVersion: 1,
  relayerId: 21,
  taker: '0xe269e891a2ec8585a378882ffa531141205e92e9',
  takerAmount: 3e23,
  takerFee: 5000000000000000000,
  takerToken: '0xd7732e3783b0047aa251928960063f863ad022d8',
  transactionHash:
    '0x4c69e925be055eec7bc49cc681fd5267d1aca7e1db21f687ab19ab9d75b7447c',
  conversions: {
    USD: {
      amount: 1601.76195501,
      makerFee: 9.13,
      takerFee: 3.04,
      makerPrice: 224.42000000000002,
      takerPrice: 0.0053392065167000005,
    },
  },
};

const simpleTokens = {
  [BRAHMA_FIXTURE.address]: BRAHMA_FIXTURE,
  [WETH_FIXTURE.address]: WETH_FIXTURE,
  [ZRX_FIXTURE.address]: ZRX_FIXTURE,
};

const simpleRelayers = [ETHFINEX_FIXTURE];

describe('transformFill', () => {
  it('should transform V1 fill', () => {
    const viewModel = transformFill(simpleTokens, simpleRelayers, simpleFill);

    expect(viewModel).toMatchSnapshot();
  });

  it('should transform fill without relayer', () => {
    const fill = { ...simpleFill, relayerId: undefined };
    const viewModel = transformFill(simpleTokens, simpleRelayers, fill);

    expect(viewModel.relayer).toBeNull();
  });

  it('should transform fill with unrecognised maker token', () => {
    const fill = { ...simpleFill, makerToken: '0x1234' };
    const viewModel = transformFill(simpleTokens, simpleRelayers, fill);

    expect(viewModel.makerToken).toEqual({
      address: '0x1234',
    });
  });

  it('should transform fill with unrecognised taker token', () => {
    const fill = { ...simpleFill, takerToken: '0x9999' };
    const viewModel = transformFill(simpleTokens, simpleRelayers, fill);

    expect(viewModel.takerToken).toEqual({
      address: '0x9999',
    });
  });

  it('should transform fill with unrecognised relayer', () => {
    const fill = { ...simpleFill, relayerId: 999 };
    const viewModel = transformFill(simpleTokens, simpleRelayers, fill);

    expect(viewModel.relayer).toBeNull();
  });

  it('should transform pending fill', () => {
    const fill = { ...simpleFill, status: 0 };
    const viewModel = transformFill(simpleTokens, simpleRelayers, fill);

    expect(viewModel.status).toBe('pending');
  });

  it('should transform successful fill', () => {
    const viewModel = transformFill(simpleTokens, simpleRelayers, simpleFill);

    expect(viewModel.status).toBe('successful');
  });

  it('should transform failed fill', () => {
    const fill = { ...simpleFill, status: 2 };
    const viewModel = transformFill(simpleTokens, simpleRelayers, fill);

    expect(viewModel.status).toBe('failed');
  });
});
