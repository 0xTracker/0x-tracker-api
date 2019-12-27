const _ = require('lodash');
const moment = require('moment');
const mongoose = require('mongoose');
const Router = require('koa-router');

const { getTokens } = require('../../../tokens/token-cache');
const Fill = require('../../../model/fill');
const getRelayerLookupId = require('../../../relayers/get-relayer-lookup-id');
const getRelayers = require('../../../relayers/get-relayers');
const InvalidParameterError = require('../../errors/invalid-parameter-error');
const pagination = require('../../middleware/pagination');
const reverseMapStatus = require('../../../fills/reverse-map-status');
const searchFills = require('../../../fills/search-fills');
const transformFill = require('./util/transform-fill');
const transformFills = require('./util/transform-fills');

const parseDate = dateString => {
  if (dateString === undefined) {
    return undefined;
  }

  return moment(dateString);
};

const parseNumber = numberString => {
  if (numberString === undefined) {
    return undefined;
  }

  return _.toNumber(numberString);
};

const createRouter = () => {
  const router = new Router({ prefix: '/fills' });

  router.get(
    '/',
    pagination({ defaultLimit: 20, maxLimit: 50, maxPage: Infinity }),
    async ({ pagination: { limit, page }, request, response }, next) => {
      const { address, status, token } = request.query;
      const relayerId = request.query.relayer;
      const query = request.query.q;
      const relayerLookupId = await getRelayerLookupId(relayerId);
      const dateFrom = parseDate(request.query.dateFrom);
      const dateTo = parseDate(request.query.dateTo);
      const valueFrom = parseNumber(request.query.valueFrom);
      const valueTo = parseNumber(request.query.valueTo);
      const protocolVersion =
        request.query.protocolVersion !== undefined
          ? _.toNumber(request.query.protocolVersion)
          : undefined;

      const minDate = moment().subtract(6, 'months');

      if (
        status !== undefined &&
        !['failed', 'pending', 'successful'].includes(status)
      ) {
        throw new InvalidParameterError(
          'Must be one of: failed, pending, successful',
          'Invalid query parameter: status',
        );
      }

      if (relayerId !== undefined && relayerLookupId === undefined) {
        throw new InvalidParameterError(
          `No relayer exists with an ID of "${relayerId}"`,
          `Invalid query parameter: relayer`,
        );
      }

      if (protocolVersion !== undefined && !_.isFinite(protocolVersion)) {
        throw new InvalidParameterError(
          'Must be a valid number',
          'Invalid query parameter: protocolVersion',
        );
      }

      if (protocolVersion !== undefined && protocolVersion < 1) {
        throw new InvalidParameterError(
          'Cannot be less than 1',
          'Invalid query parameter: protocolVersion',
        );
      }

      if (dateFrom !== undefined && !dateFrom.isValid()) {
        throw new InvalidParameterError(
          'Must be in ISO 8601 format',
          'Invalid query parameter: dateFrom',
        );
      } else if (dateFrom !== undefined && dateFrom < minDate) {
        throw new InvalidParameterError(
          'Cannot be more than six months ago',
          'Invalid query parameter: dateFrom',
        );
      } else if (
        dateFrom !== undefined &&
        dateTo !== undefined &&
        dateFrom > dateTo
      ) {
        throw new InvalidParameterError(
          'Cannot be greater than dateTo',
          'Invalid query parameter: dateTo',
        );
      }

      if (dateTo !== undefined && !dateTo.isValid()) {
        throw new InvalidParameterError(
          'Must be in ISO 8601 format',
          'Invalid query parameter: dateTo',
        );
      } else if (dateTo !== undefined && dateTo < minDate) {
        throw new InvalidParameterError(
          'Cannot be more than six months ago',
          'Invalid query parameter: dateTo',
        );
      }

      const { docs, pages, total } = await searchFills(
        {
          address,
          dateFrom: dateFrom !== undefined ? dateFrom : minDate,
          dateTo,
          protocolVersion,
          query,
          relayerId: relayerLookupId,
          status: reverseMapStatus(status),
          token,
          valueFrom,
          valueTo,
        },
        { limit, page },
      );

      const tokens = getTokens();
      const relayers = await getRelayers();

      response.body = {
        fills: transformFills(tokens, relayers, docs),
        limit,
        page,
        pageCount: pages,
        total,
      };

      await next();
    },
  );

  router.get('/:id', async ({ params, response }, next) => {
    const fillId = params.id;
    const fill = mongoose.Types.ObjectId.isValid(fillId)
      ? await Fill.findById(fillId)
      : null;

    if (fill === null) {
      response.status = 404;
      await next();
      return;
    }

    const tokens = getTokens();
    const relayers = await getRelayers();

    response.body = transformFill(tokens, relayers, fill);

    await next();
  });

  return router;
};

module.exports = createRouter;
