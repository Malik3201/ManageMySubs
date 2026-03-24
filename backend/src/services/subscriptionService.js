const ClientSubscription = require('../models/ClientSubscription');
const SubscriptionCategory = require('../models/SubscriptionCategory');
const ActivityLog = require('../models/ActivityLog');
const ApiError = require('../utils/apiError');
const { resolvePaymentFields } = require('../utils/paymentHelpers');
const { resolveVendor, recalcVendorTotals } = require('./vendorAccountingService');
const {
  getTotalDays,
  calculateEndDate,
  computeStatus,
  getElapsedDays,
  getRemainingDays,
  addDays,
  startOfDay,
  endOfDay,
} = require('../utils/dateHelpers');

const escapeRegex = (value = '') => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const SORT_MAP = {
  latest: '-createdAt',
  oldest: 'createdAt',
  endingSoon: 'currentEndDate',
  endingLate: '-currentEndDate',
  clientName: 'clientName',
  highestPrice: '-sellingPrice',
  lowestPrice: 'sellingPrice',
};

const applyLifecycleFilter = (filter, status) => {
  const now = new Date();
  const soonThreshold = addDays(now, 3);

  if (status === 'cancelled' || status === 'in_replacement' || status === 'replacement_completed') {
    filter.status = status;
    return;
  }

  filter.status = { $nin: ['cancelled', 'in_replacement', 'replacement_completed'] };

  if (status === 'active') {
    filter.currentEndDate = { $gt: soonThreshold };
  }

  if (status === 'expiring_soon') {
    filter.currentEndDate = { $gt: now, $lte: soonThreshold };
  }

  if (status === 'expired') {
    filter.currentEndDate = { $lte: now };
  }
};

const buildFilter = (userId, query) => {
  const filter = {
    userId,
    isArchived: query.archived === 'true',
  };

  if (query.paymentStatus) filter.paymentStatus = query.paymentStatus;
  if (query.categoryId) filter.categoryId = query.categoryId;

  if (query.search?.trim()) {
    const regex = new RegExp(escapeRegex(query.search.trim()), 'i');
    filter.$or = [
      { clientName: regex },
      { clientEmail: regex },
      { clientPhone: regex },
    ];
  }

  if (query.status) {
    applyLifecycleFilter(filter, query.status);
  }

  if (query.expiringIn) {
    const days = Number(query.expiringIn);
    if (Number.isFinite(days) && days > 0) {
      const now = new Date();
      filter.currentEndDate = { $gte: now, $lte: addDays(now, days) };
      if (!query.status) {
        filter.status = { $nin: ['cancelled', 'in_replacement', 'replacement_completed'] };
      }
    }
  }

  if (query.dateFrom || query.dateTo) {
    filter.purchaseDate = {};

    if (query.dateFrom) {
      const from = new Date(query.dateFrom);
      if (!Number.isNaN(from.getTime())) {
        filter.purchaseDate.$gte = startOfDay(from);
      }
    }

    if (query.dateTo) {
      const to = new Date(query.dateTo);
      if (!Number.isNaN(to.getTime())) {
        filter.purchaseDate.$lte = endOfDay(to);
      }
    }

    if (!Object.keys(filter.purchaseDate).length) {
      delete filter.purchaseDate;
    }
  }

  return filter;
};

const enrichSubscription = (sub) => {
  const obj = sub.toObject ? sub.toObject() : { ...sub };
  obj.elapsedDays = getElapsedDays(obj.startDate);
  obj.remainingDays = getRemainingDays(obj.currentEndDate);
  obj.computedStatus = computeStatus(obj);
  obj.profit = (obj.sellingPrice || 0) - (obj.purchasePrice || 0);
  return obj;
};

const list = async (userId, query = {}) => {
  const filter = buildFilter(userId, query);
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
  const skip = (page - 1) * limit;
  const sort = SORT_MAP[query.sort] || '-createdAt';

  const [docs, total] = await Promise.all([
    ClientSubscription.find(filter)
      .populate('categoryId', 'name')
      .populate('vendorId', 'name totalPayable totalPaid balance')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    ClientSubscription.countDocuments(filter),
  ]);

  const data = docs.map(enrichSubscription);
  return { data, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
};

const getById = async (userId, id) => {
  const sub = await ClientSubscription.findOne({ _id: id, userId })
    .populate('categoryId', 'name defaultPurchasePrice')
    .populate('vendorId', 'name totalPayable totalPaid balance')
    .populate('parentSubscriptionId', 'clientName purchaseDate');
  if (!sub) throw ApiError.notFound('Subscription not found');
  return enrichSubscription(sub);
};

const create = async (userId, data) => {
  const category = await SubscriptionCategory.findOne({ _id: data.categoryId, userId });
  if (!category) throw ApiError.notFound('Category not found');

  const totalDays = getTotalDays(data.durationType, data.customDays);
  const purchaseDate = data.purchaseDate ? new Date(data.purchaseDate) : new Date();
  const startDate = purchaseDate;
  const endDate = calculateEndDate(startDate, totalDays);

  const purchasePrice =
    data.purchasePrice !== undefined ? data.purchasePrice : category.defaultPurchasePrice;
  const payment = resolvePaymentFields({
    sellingPrice: data.sellingPrice ?? 0,
    paymentStatus: data.paymentStatus || 'pending',
    amountReceived: data.amountReceived,
  });
  const vendor = await resolveVendor(userId, {
    vendorId: data.vendorId,
    vendorName: data.vendorName,
  });

  const sub = await ClientSubscription.create({
    userId,
    categoryId: data.categoryId,
    vendorId: vendor?._id || null,
    clientName: data.clientName,
    clientPhone: data.clientPhone,
    clientEmail: data.clientEmail,
    purchaseDate,
    startDate,
    originalEndDate: endDate,
    currentEndDate: endDate,
    sellingPrice: data.sellingPrice ?? 0,
    purchasePrice,
    durationType: data.durationType,
    customDays: data.customDays || 0,
    totalDays,
    paymentStatus: payment.paymentStatus,
    paymentMethod: data.paymentMethod,
    amountReceived: payment.amountReceived,
    amountRemaining: payment.amountRemaining,
    notes: data.notes,
    tags: data.tags || [],
  });

  await ActivityLog.create({
    userId,
    clientSubscriptionId: sub._id,
    actionType: 'created',
    meta: { durationType: data.durationType, totalDays, sellingPrice: sub.sellingPrice },
  });
  if (vendor?._id) {
    await recalcVendorTotals(userId, vendor._id);
  }

  return enrichSubscription(sub);
};

const update = async (userId, id, data) => {
  const sub = await ClientSubscription.findOne({ _id: id, userId });
  if (!sub) throw ApiError.notFound('Subscription not found');

  const allowed = [
    'clientName', 'clientPhone', 'clientEmail', 'sellingPrice', 'purchasePrice',
    'paymentStatus', 'paymentMethod', 'amountReceived', 'notes', 'tags',
  ];
  const prevVendorId = sub.vendorId ? String(sub.vendorId) : null;

  allowed.forEach((key) => {
    if (data[key] !== undefined) sub[key] = data[key];
  });
  if (data.vendorId !== undefined) {
    const byId = await resolveVendor(userId, { vendorId: data.vendorId });
    sub.vendorId = byId?._id || null;
  }
  if (data.vendorName !== undefined) {
    const byName = await resolveVendor(userId, { vendorName: data.vendorName });
    sub.vendorId = byName?._id || null;
  }

  if (data.lifecycleOverride && data.lifecycleOverride !== 'none') {
    const overrideMap = {
      active: 'active',
      expiring: 'expiring_soon',
      expired: 'expired',
      replacement: 'in_replacement',
    };
    const nextStatus = overrideMap[data.lifecycleOverride];
    if (nextStatus) {
      sub.status = nextStatus;
    }
  }

  if (
    data.amountReceived !== undefined ||
    data.sellingPrice !== undefined ||
    data.paymentStatus !== undefined
  ) {
    const payment = resolvePaymentFields({
      sellingPrice: sub.sellingPrice,
      paymentStatus: data.paymentStatus || sub.paymentStatus,
      amountReceived: data.amountReceived,
      existingAmountReceived: sub.amountReceived,
    });

    sub.paymentStatus = payment.paymentStatus;
    sub.amountReceived = payment.amountReceived;
    sub.amountRemaining = payment.amountRemaining;
  }

  await sub.save();

  await ActivityLog.create({
    userId,
    clientSubscriptionId: sub._id,
    actionType: 'updated',
    meta: { updatedFields: Object.keys(data) },
  });
  const nextVendorId = sub.vendorId ? String(sub.vendorId) : null;
  if (prevVendorId) {
    await recalcVendorTotals(userId, prevVendorId);
  }
  if (nextVendorId && nextVendorId !== prevVendorId) {
    await recalcVendorTotals(userId, nextVendorId);
  }

  return enrichSubscription(sub);
};

const toggleArchive = async (userId, id) => {
  const sub = await ClientSubscription.findOne({ _id: id, userId });
  if (!sub) throw ApiError.notFound('Subscription not found');
  sub.isArchived = !sub.isArchived;
  await sub.save();

  await ActivityLog.create({
    userId,
    clientSubscriptionId: sub._id,
    actionType: sub.isArchived ? 'archived' : 'restored',
  });

  return enrichSubscription(sub);
};

const renew = async (userId, id, data) => {
  const original = await ClientSubscription.findOne({ _id: id, userId }).populate('categoryId');
  if (!original) throw ApiError.notFound('Subscription not found');
  if (original.isArchived) throw ApiError.badRequest('Archived subscriptions cannot be renewed');
  if (original.status === 'in_replacement') {
    throw ApiError.badRequest('Finish the replacement flow before creating a renewal');
  }

  const totalDays = getTotalDays(data.durationType, data.customDays);
  const purchaseDate = data.purchaseDate ? new Date(data.purchaseDate) : new Date();
  const startDate =
    purchaseDate > original.currentEndDate ? purchaseDate : addDays(original.currentEndDate, 1);
  const endDate = calculateEndDate(startDate, totalDays);
  const payment = resolvePaymentFields({
    sellingPrice: data.sellingPrice ?? 0,
    paymentStatus: data.paymentStatus || 'pending',
    amountReceived: data.amountReceived,
  });
  const vendor = await resolveVendor(userId, {
    vendorId: data.vendorId || original.vendorId,
    vendorName: data.vendorName,
  });

  const renewed = await ClientSubscription.create({
    userId,
    categoryId: original.categoryId._id,
    vendorId: vendor?._id || original.vendorId || null,
    clientName: original.clientName,
    clientPhone: original.clientPhone,
    clientEmail: original.clientEmail,
    purchaseDate,
    startDate,
    originalEndDate: endDate,
    currentEndDate: endDate,
    sellingPrice: data.sellingPrice ?? 0,
    purchasePrice: data.purchasePrice ?? original.purchasePrice,
    durationType: data.durationType,
    customDays: data.customDays || 0,
    totalDays,
    paymentStatus: payment.paymentStatus,
    paymentMethod: data.paymentMethod,
    amountReceived: payment.amountReceived,
    amountRemaining: payment.amountRemaining,
    notes: data.notes || '',
    tags: original.tags,
    renewalCount: original.renewalCount + 1,
    parentSubscriptionId: original._id,
  });

  await ActivityLog.create({
    userId,
    clientSubscriptionId: original._id,
    actionType: 'renewed',
    meta: {
      newSubscriptionId: renewed._id,
      totalDays,
      renewalStartDate: startDate,
      renewalEndDate: endDate,
    },
  });

  await ActivityLog.create({
    userId,
    clientSubscriptionId: renewed._id,
    actionType: 'created',
    meta: { renewedFrom: original._id, renewalCount: renewed.renewalCount },
  });
  if (renewed.vendorId) {
    await recalcVendorTotals(userId, renewed.vendorId);
  }

  return enrichSubscription(renewed);
};

module.exports = { list, getById, create, update, toggleArchive, renew };
