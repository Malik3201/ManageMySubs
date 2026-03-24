const mongoose = require('mongoose');
const Vendor = require('../models/Vendor');
const ClientSubscription = require('../models/ClientSubscription');

const normalizeName = (value = '') => value.trim().replace(/\s+/g, ' ');

const ensureVendorByName = async (userId, name) => {
  const clean = normalizeName(String(name || ''));
  if (!clean) return null;
  const exact = await Vendor.findOne({
    userId,
    name: new RegExp(`^${clean.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i'),
  });
  if (exact) return exact;
  return Vendor.create({ userId, name: clean });
};

const resolveVendor = async (userId, { vendorId, vendorName }) => {
  if (vendorId && mongoose.Types.ObjectId.isValid(vendorId)) {
    const byId = await Vendor.findOne({ _id: vendorId, userId });
    if (byId) return byId;
  }
  if (vendorName) {
    return ensureVendorByName(userId, vendorName);
  }
  return null;
};

const recalcVendorTotals = async (userId, vendorId) => {
  if (!vendorId || !mongoose.Types.ObjectId.isValid(vendorId)) return null;
  const vendor = await Vendor.findOne({ _id: vendorId, userId });
  if (!vendor) return null;

  const [agg] = await ClientSubscription.aggregate([
    { $match: { userId: vendor.userId, vendorId: vendor._id } },
    { $group: { _id: '$vendorId', totalPayable: { $sum: '$purchasePrice' } } },
  ]);

  vendor.totalPayable = agg?.totalPayable || 0;
  vendor.balance = Math.max(0, vendor.totalPayable - (vendor.totalPaid || 0));
  await vendor.save();
  return vendor;
};

const applyVendorPayment = async (userId, vendorId, amount) => {
  const vendor = await Vendor.findOne({ _id: vendorId, userId });
  if (!vendor) return null;
  vendor.totalPaid = (vendor.totalPaid || 0) + amount;
  vendor.balance = Math.max(0, (vendor.totalPayable || 0) - vendor.totalPaid);
  await vendor.save();
  return vendor;
};

module.exports = {
  resolveVendor,
  ensureVendorByName,
  recalcVendorTotals,
  applyVendorPayment,
};
