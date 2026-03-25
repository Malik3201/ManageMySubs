const resellerService = require('../services/resellerService');
const ApiResponse = require('../utils/apiResponse');

const list = async (req, res, next) => {
  try {
    const rows = await resellerService.list(req.userId);
    ApiResponse.success(res, rows);
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const row = await resellerService.create(req.userId, req.validatedBody);
    ApiResponse.created(res, row, 'Reseller created');
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const row = await resellerService.getById(req.userId, req.params.id);
    ApiResponse.success(res, row);
  } catch (err) {
    next(err);
  }
};

const upsertPricing = async (req, res, next) => {
  try {
    const row = await resellerService.upsertPricing(req.userId, req.params.id, req.validatedBody);
    ApiResponse.success(res, row, 'Pricing saved');
  } catch (err) {
    next(err);
  }
};

const listPricing = async (req, res, next) => {
  try {
    const rows = await resellerService.listPricing(req.userId, req.params.id);
    ApiResponse.success(res, rows);
  } catch (err) {
    next(err);
  }
};

const pricingForSubscription = async (req, res, next) => {
  try {
    const row = await resellerService.getPricingBySubscription(
      req.userId,
      req.params.id,
      req.params.subscriptionId
    );
    ApiResponse.success(res, row);
  } catch (err) {
    next(err);
  }
};

const createOrder = async (req, res, next) => {
  try {
    const row = await resellerService.createOrder(req.userId, req.validatedBody);
    ApiResponse.created(res, row, 'Reseller order created');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  list,
  create,
  getById,
  upsertPricing,
  listPricing,
  pricingForSubscription,
  createOrder,
};
