const _ = require('lodash');
const { BigNumber } = require('@0xproject/utils');

const { FILL_ACTOR } = require('../../../../constants');
const AXIE_FIXTURE = require('../../../../fixtures/tokens/axie');
const BRAHMA_FIXTURE = require('../../../../fixtures/tokens/brahma');
const ETHFINEX_FIXTURE = require('../../../../fixtures/relayers/ethfinex');
const Fill = require('../../../../model/fill');
const WETH_FIXTURE = require('../../../../fixtures/tokens/weth');
const ZRX_FIXTURE = require('../../../../fixtures/tokens/zrx');

const transformFill = require('./transform-fill');

const axieMaker = {
  actor: FILL_ACTOR.MAKER,
  amount: 1,
  price: {
    USD: 37.77675,
  },
  tokenAddress: '0xf5b0a3efb8e8e4c201e2a935f110eaaf3ffecb8d',
  tokenId: 43381,
};

const wethTaker = {
  actor: FILL_ACTOR.TAKER,
  amount: 275000000000000000,
  price: {
    USD: 137.36999999999998,
  },
  tokenAddress: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
};

const brahmaTaker = {
  actor: FILL_ACTOR.TAKER,
  amount: 3e23,
  price: { USD: 0.0053392065167000005 },
  tokenAddress: '0xd7732e3783b0047aa251928960063f863ad022d8',
};

const wethMaker = {
  actor: FILL_ACTOR.MAKER,
  amount: 7137340500000000000,
  price: {
    USD: 224.42000000000002,
  },
  tokenAddress: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
};

const simpleFill = {
  assets: [axieMaker, wethTaker],
  id: '5b9107e00d05f400042e3494',
  conversions: {
    USD: {
      amount: 37.77675,
      makerFee: 0.2,
      takerFee: 0.3,
    },
  },
  date: '2018-09-06T10:47:38.000Z',
  fees: [],
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
  assets: [wethMaker, brahmaTaker],
  conversions: {
    USD: {
      amount: 1601.76195501,
      makerFee: 9.13,
      takerFee: 3.04,
    },
  },
  fees: [],
  protocolVersion: 1,
};

const simpleTokens = {
  [AXIE_FIXTURE.address]: AXIE_FIXTURE,
  [BRAHMA_FIXTURE.address]: BRAHMA_FIXTURE,
  [WETH_FIXTURE.address]: WETH_FIXTURE,
  [ZRX_FIXTURE.address]: ZRX_FIXTURE,
};

const relayers = [ETHFINEX_FIXTURE];

describe('transformFill', () => {
  it('should transform V1 fill', () => {
    const viewModel = transformFill(simpleTokens, relayers, simpleV1Fill);

    expect(viewModel).toMatchSnapshot();
  });

  it('should transform fill without relayer', () => {
    const fill = { ...simpleFill, relayerId: undefined };
    const viewModel = transformFill(simpleTokens, relayers, fill);

    expect(viewModel.relayer).toBeNull();
  });

  it('should transform V1 fill with unrecognised maker asset', () => {
    const fill = {
      ...simpleV1Fill,
      assets: [{ ...wethMaker, tokenAddress: '0x1234' }, brahmaTaker],
    };
    const viewModel = transformFill(simpleTokens, relayers, fill);

    expect(
      viewModel.assets.find(asset => asset.traderType === 'maker'),
    ).toMatchSnapshot();
  });

  it('should transform V1 fill with unrecognised taker asset', () => {
    const fill = {
      ...simpleV1Fill,
      assets: [wethMaker, { ...brahmaTaker, tokenAddress: '0x9999' }],
    };
    const viewModel = transformFill(simpleTokens, relayers, fill);

    expect(
      viewModel.assets.find(asset => asset.traderType === 'taker'),
    ).toMatchSnapshot();
  });

  it('should transform fill with unrecognised relayer', () => {
    const fill = { ...simpleFill, relayerId: 999 };
    const viewModel = transformFill(simpleTokens, relayers, fill);

    expect(viewModel.relayer).toBeNull();
  });

  it('should transform pending fill', () => {
    const fill = { ...simpleFill, status: 0 };
    const viewModel = transformFill(simpleTokens, relayers, fill);

    expect(viewModel.status).toBe('pending');
  });

  it('should transform successful fill', () => {
    const viewModel = transformFill(simpleTokens, relayers, simpleFill);

    expect(viewModel.status).toBe('successful');
  });

  it('should transform failed fill', () => {
    const fill = { ...simpleV1Fill, status: 2 };
    const viewModel = transformFill(simpleTokens, relayers, fill);

    expect(viewModel.status).toBe('failed');
  });

  it('should transform V2 fill', () => {
    const viewModel = transformFill(simpleTokens, relayers, simpleFill);

    expect(viewModel).toMatchSnapshot();
  });

  it('should transform ERC721 asset', () => {
    const viewModel = transformFill(simpleTokens, relayers, simpleFill);
    const asset = _.find(viewModel.assets, { traderType: 'maker' });

    expect(asset).toMatchSnapshot();
  });

  it('should transform ERC20 asset', () => {
    const viewModel = transformFill(simpleTokens, relayers, simpleFill);
    const asset = _.find(viewModel.assets, { traderType: 'taker' });

    expect(asset).toMatchSnapshot();
  });

  it('should transform V3 fill', () => {
    const fill = new Fill({
      ...simpleFill,
      conversions: {
        USD: {
          protocolFee: 0.2,
        },
      },
      fees: [
        {
          amount: { token: 5000000000000000, USD: 0.3 },
          tokenAddress: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
          traderType: 0,
        },
        {
          amount: { token: 1 },
          tokenAddress: '0xf5b0a3efb8e8e4c201e2a935f110eaaf3ffecb8d',
          tokenId: 58,
          traderType: 1,
        },
      ],
      protocolFee: 7000000000000000,
      protocolVersion: 3,
      makerFee: undefined,
      takerFee: undefined,
    });
    const viewModel = transformFill(simpleTokens, relayers, fill);

    expect(viewModel.makerFee).toBeUndefined();
    expect(viewModel.takerFee).toBeUndefined();
    expect(viewModel.protocolFee).toEqual({
      ETH: new BigNumber(0.007),
      USD: 0.2,
    });
    expect(viewModel.fees).toEqual([
      {
        amount: { token: new BigNumber('0.005'), USD: 0.3 },
        token: {
          address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
          id: undefined,
          name: 'Wrapped Ether',
          symbol: 'WETH',
          type: 'erc-20',
        },
        traderType: 'maker',
      },
      {
        amount: { token: new BigNumber('1'), USD: undefined },
        token: {
          address: '0xf5b0a3efb8e8e4c201e2a935f110eaaf3ffecb8d',
          id: 58,
          name: 'Axie',
          symbol: 'AXIE',
          type: 'erc-721',
        },
        traderType: 'taker',
      },
    ]);
  });
});
