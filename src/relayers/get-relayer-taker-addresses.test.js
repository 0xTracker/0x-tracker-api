const getRelayers = require('./get-relayers');
const getRelayerTakerAddresses = require('./get-relayer-taker-addresses');

jest.mock('./get-relayers');

describe('getRelayerTakerAddresses', () => {
  it('should return empty array when no relayers have taker addresses', async () => {
    getRelayers.mockResolvedValue([
      {
        _id: '5b489fc19af572783ace3a53',
        lookupId: 4,
        name: 'IDT Exchange',
        feeRecipients: ['0xeb71bad396acaa128aeadbc7dbd59ca32263de01'],
        id: 'idtExchange',
        slug: 'idt-exchange',
      },
      {
        _id: '5b48a01d9af572783ace3a56',
        lookupId: 7,
        name: 'Radar Relay',
        feeRecipients: ['0xa258b39954cef5cb142fd567a46cddb31a670124'],
        id: 'radarRelay',
        imageUrl: 'https://resources.0xtracker.com/logos/radar-relay.png',
        slug: 'radar-relay',
        url: 'https://radarrelay.com',
      },
    ]);
    const takerAddresses = await getRelayerTakerAddresses();

    expect(takerAddresses).toEqual([]);
  });

  it('should return relayer taker addresses', async () => {
    getRelayers.mockResolvedValue([
      {
        _id: '5b489fc19af572783ace3a53',
        lookupId: 4,
        name: 'IDT Exchange',
        takerAddresses: ['0xeb71bad396acaa128aeadbc7dbd59ca32263de01'],
        id: 'idtExchange',
        slug: 'idt-exchange',
      },
      {
        _id: '5b48a01d9af572783ace3a56',
        lookupId: 7,
        name: 'Radar Relay',
        feeRecipients: ['0xa258b39954cef5cb142fd567a46cddb31a670124'],
        id: 'radarRelay',
        imageUrl: 'https://resources.0xtracker.com/logos/radar-relay.png',
        slug: 'radar-relay',
        url: 'https://radarrelay.com',
      },
      {
        _id: '5c39746f49aa89922fa53bc0',
        lookupId: 15,
        id: 'tokenmom',
        imageUrl: 'https://resources.0xtracker.com/logos/tokenmom.png',
        name: 'Tokenmom',
        orderMatcher: true,
        slug: 'tokenmom',
        takerAddresses: ['0x4a821aa1affbf7ee89a245bf750d1d7374e77409'],
        url: 'https://tokenmom.com',
      },
    ]);
    const takerAddresses = await getRelayerTakerAddresses();

    expect(takerAddresses).toEqual([
      '0xeb71bad396acaa128aeadbc7dbd59ca32263de01',
      '0x4a821aa1affbf7ee89a245bf750d1d7374e77409',
    ]);
  });
});
