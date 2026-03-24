const Vendor = require('../models/Vendor');
const VendorTransaction = require('../models/VendorTransaction');
const ApiError = require('../utils/apiError');
const { ensureVendorByName, recalcVendorTotals, applyVendorPayment } = require('./vendorAccountingService');

const list = async (userId) => {
  const vendors = await Vendor.find({ userId }).sort({ createdAt: -1 }).lean();
  return vendors;
};

const getById = async (userId, id) => {
  const vendor = await Vendor.findOne({ _id: id, userId }).lean();
  if (!vendor) throw ApiError.notFound('Vendor not found');
  return vendor;
};

const create = async (userId, data) => {
  const vendor = await ensureVendorByName(userId, data.name);
  await recalcVendorTotals(userId, vendor._id);
  return Vendor.findById(vendor._id).lean();
};

const addPayment = async (userId, vendorId, { amount, note }) => {
  const vendor = await Vendor.findOne({ _id: vendorId, userId });
  if (!vendor) throw ApiError.notFound('Vendor not found');

  const tx = await VendorTransaction.create({
    userId,
    vendorId: vendor._id,
    amount,
    type: 'payment',
    note: note || '',
  });

  const updated = await applyVendorPayment(userId, vendor._id, amount);
  return { vendor: updated, transaction: tx };
};

const getTransactions = async (userId, vendorId) => {
  const vendor = await Vendor.findOne({ _id: vendorId, userId });
  if (!vendor) throw ApiError.notFound('Vendor not found');
  const transactions = await VendorTransaction.find({ userId, vendorId })
    .sort({ createdAt: -1 })
    .lean();
  return transactions;
};

module.exports = {
  list,
  getById,
  create,
  addPayment,
  getTransactions,
};
