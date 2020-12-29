const _ = require('lodash');
const { BigNumber } = require('@0xproject/utils');

const { FILL_ACTOR } = require('../../../../constants');
const AXIE_FIXTURE = require('../../../../fixtures/tokens/axie');
const BRAHMA_FIXTURE = require('../../../../fixtures/tokens/brahma');
const WETH_FIXTURE = require('../../../../fixtures/tokens/weth');

const transformFill = require('./transform-fill');

const axieMaker = {
  actor: FILL_ACTOR.MAKER,
  amount: 1,
  price: {
    USD: 37.77675,
  },
  tokenAddress: '0xf5b0a3efb8e8e4c201e2a935f110eaaf3ffecb8d',
  tokenId: 43381,
  token: AXIE_FIXTURE,
};

const wethTaker = {
  actor: FILL_ACTOR.TAKER,
  amount: 275000000000000000,
  price: {
    USD: 137.36999999999998,
  },
  tokenAddress: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  token: WETH_FIXTURE,
};

const brahmaTaker = {
  actor: FILL_ACTOR.TAKER,
  amount: 3e23,
  price: { USD: 0.0053392065167000005 },
  tokenAddress: '0xd7732e3783b0047aa251928960063f863ad022d8',
  token: BRAHMA_FIXTURE,
};

const wethMaker = {
  actor: FILL_ACTOR.MAKER,
  amount: 7137340500000000000,
  price: {
    USD: 224.42000000000002,
  },
  tokenAddress: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  token: WETH_FIXTURE,
};

const simpleFill = {
  assets: [axieMaker, wethTaker],
  attributions: [],
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

describe('transformFill', () => {
  it('should transform V1 fill', () => {
    const viewModel = transformFill(simpleV1Fill);

    expect(viewModel).toMatchSnapshot();
  });

  it('should transform fill without relayer', () => {
    const fill = { ...simpleFill, relayerId: undefined, relayer: null };
    const viewModel = transformFill(fill);

    expect(viewModel.relayer).toBeNull();
  });

  it('should transform V1 fill with unrecognised maker asset', () => {
    const fill = {
      ...simpleV1Fill,
      assets: [{ ...wethMaker, token: undefined }, brahmaTaker],
    };
    const viewModel = transformFill(fill);

    expect(
      viewModel.assets.find(asset => asset.traderType === 'maker'),
    ).toMatchSnapshot();
  });

  it('should transform V1 fill with unrecognised taker asset', () => {
    const fill = {
      ...simpleV1Fill,
      assets: [wethMaker, { ...brahmaTaker, token: undefined }],
    };
    const viewModel = transformFill(fill);

    expect(
      viewModel.assets.find(asset => asset.traderType === 'taker'),
    ).toMatchSnapshot();
  });

  it('should transform fill with unrecognised relayer', () => {
    const fill = { ...simpleFill, relayer: null };
    const viewModel = transformFill(fill);

    expect(viewModel.relayer).toBeNull();
  });

  it('should transform pending fill', () => {
    const fill = { ...simpleFill, status: 0 };
    const viewModel = transformFill(fill);

    expect(viewModel.status).toBe('pending');
  });

  it('should transform successful fill', () => {
    const viewModel = transformFill(simpleFill);

    expect(viewModel.status).toBe('successful');
  });

  it('should transform failed fill', () => {
    const fill = { ...simpleV1Fill, status: 2 };
    const viewModel = transformFill(fill);

    expect(viewModel.status).toBe('failed');
  });

  it('should transform V2 fill', () => {
    const viewModel = transformFill(simpleFill);

    expect(viewModel).toMatchSnapshot();
  });

  it('should transform ERC721 asset', () => {
    const viewModel = transformFill(simpleFill);
    const asset = _.find(viewModel.assets, { traderType: 'maker' });

    expect(asset).toMatchSnapshot();
  });

  it('should transform ERC20 asset', () => {
    const viewModel = transformFill(simpleFill);
    const asset = _.find(viewModel.assets, { traderType: 'taker' });

    expect(asset).toMatchSnapshot();
  });

  it('should transform V3 fill', () => {
    const fill = {
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
          token: WETH_FIXTURE,
          traderType: 0,
        },
        {
          amount: { token: 1 },
          tokenAddress: '0xf5b0a3efb8e8e4c201e2a935f110eaaf3ffecb8d',
          token: AXIE_FIXTURE,
          tokenId: 58,
          traderType: 1,
        },
      ],
      protocolFee: 7000000000000000,
      protocolVersion: 3,
      makerFee: undefined,
      takerFee: undefined,
    };
    const viewModel = transformFill(fill);

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
          id: null,
          name: 'Wrapped Ether',
          symbol: 'WETH',
          type: 'erc-20',
        },
        traderType: 'maker',
      },
      {
        amount: { token: new BigNumber('1'), USD: null },
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

  it('should transform fill with unknown affiliate', () => {
    const fill = {
      ...simpleFill,
      affiliateAddress: '0xa258b39954cef5cb142fd567a46cddb31a670124',
    };

    const viewModel = transformFill(fill);

    expect(viewModel.affiliate).toEqual({
      address: '0xa258b39954cef5cb142fd567a46cddb31a670124',
      imageUrl: null,
      isContract: null,
      name: null,
    });
  });

  it('should transform fill with known affiliate', () => {
    const fill = {
      ...simpleFill,
      affiliateAddress: '0xa258b39954cef5cb142fd567a46cddb31a670124',
      affiliate: {
        address: '0xa258b39954cef5cb142fd567a46cddb31a670124',
        imageUrl: 'https://resources.0xtracker.com/logos/swarm.png',
        name: 'Swarm',
      },
    };

    const viewModel = transformFill(fill);

    expect(viewModel.affiliate).toEqual({
      address: '0xa258b39954cef5cb142fd567a46cddb31a670124',
      imageUrl: 'https://resources.0xtracker.com/logos/swarm.png',
      isContract: null,
      name: 'Swarm',
    });
  });
});
