const _ = require('lodash');

const { FILL_STATUS, ZRX_TOKEN_ADDRESS } = require('../../../../constants');
const formatTokenAmount = require('../../../../tokens/format-token-amount');
const getAssetsForFill = require('../../../../fills/get-assets-for-fill');

const formatRelayer = relayer =>
  relayer === undefined ? null : _.pick(relayer, 'slug', 'name', 'imageUrl');

const formatFillStatus = status =>
  _.findKey(FILL_STATUS, value => status === value).toLowerCase();

const transformFill = (tokens, relayers, fill) => {
  const assets = getAssetsForFill(tokens, fill);
  const conversions = _.get(fill, `conversions.USD`);
  const fillRelayer = _.find(relayers, { lookupId: fill.relayerId });
  const zrxToken = tokens[ZRX_TOKEN_ADDRESS];

  const makerFee = {
    USD: _.get(conversions, 'makerFee'),
    ZRX: formatTokenAmount(fill.makerFee, zrxToken),
  };

  const takerFee = {
    USD: _.get(conversions, 'takerFee'),
    ZRX: formatTokenAmount(fill.takerFee, zrxToken),
  };

  const totalFees = {
    USD: makerFee.USD + takerFee.USD,
    ZRX: makerFee.ZRX === null ? null : makerFee.ZRX.plus(takerFee.ZRX),
  };

  return {
    assets,
    date: fill.date,
    feeRecipient: fill.feeRecipient,
    id: fill.id,
    makerAddress: fill.maker,
    makerFee,
    orderHash: fill.orderHash,
    protocolVersion: fill.protocolVersion,
    relayer: formatRelayer(fillRelayer),
    senderAddress: fill.senderAddress,
    status: formatFillStatus(fill.status),
    takerAddress: fill.taker,
    takerFee,
    totalFees,
    transactionHash: fill.transactionHash,
    value: _.has(conversions, 'amount')
      ? {
          USD: _.get(conversions, 'amount'),
        }
      : undefined,
  };
};

module.exports = transformFill;
