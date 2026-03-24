const vendorService = require('../services/vendorService');
const ApiResponse = require('../utils/apiResponse');

const list = async (req, res, next) => {
  try {
    const vendors = await vendorService.list(req.userId);
    ApiResponse.success(res, vendors);
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const vendor = await vendorService.getById(req.userId, req.params.id);
    ApiResponse.success(res, vendor);
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const vendor = await vendorService.create(req.userId, req.validatedBody);
    ApiResponse.created(res, vendor, 'Vendor created');
  } catch (err) {
    next(err);
  }
};

const addPayment = async (req, res, next) => {
  try {
    const result = await vendorService.addPayment(req.userId, req.params.id, req.validatedBody);
    ApiResponse.success(res, result, 'Vendor payment recorded');
  } catch (err) {
    next(err);
  }
};

const transactions = async (req, res, next) => {
  try {
    const rows = await vendorService.getTransactions(req.userId, req.params.id);
    ApiResponse.success(res, rows);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  list,
  getById,
  create,
  addPayment,
  transactions,
};
