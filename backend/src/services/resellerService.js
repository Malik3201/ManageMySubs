const Reseller = require('../models/Reseller');
const ResellerPricing = require('../models/ResellerPricing');
const ClientSubscription = require('../models/ClientSubscription');
const SubscriptionCategory = require('../models/SubscriptionCategory');
const ActivityLog = require('../models/ActivityLog');
const ApiError = require('../utils/apiError');
const { resolvePaymentFields } = require('../utils/paymentHelpers');
const { calculateEndDate, getTotalDays } = require('../utils/dateHelpers');
const { attachReceiptIfEnabled } = require('./receiptService');

const list = async (userId) => {
  const [resellers, orders] = await Promise.all([
    Reseller.find({ userId }).sort({ createdAt: -1 }).lean(),
    ClientSubscription.find({ userId, isArchived: false, isResellerSale: true, resellerId: { $ne: null } })
      .select('resellerId sellingPrice purchasePrice')
      .lean(),
  ]);

  const statsMap = new Map();
  orders.forEach((o) => {
    const key = String(o.resellerId);
    const current = statsMap.get(key) || { totalSales: 0, totalProfit: 0, totalOrders: 0 };
    current.totalSales += o.sellingPrice || 0;
    current.totalProfit += (o.sellingPrice || 0) - (o.purchasePrice || 0);
    current.totalOrders += 1;
    statsMap.set(key, current);
  });
  return resellers.map((r) => {
    const row = statsMap.get(String(r._id));
    return {
      ...r,
      totalSales: row?.totalSales || 0,
      totalProfit: row?.totalProfit || 0,
      totalOrders: row?.totalOrders || 0,
    };
  });
};

const create = async (userId, data) => {
  const exists = await Reseller.findOne({ userId, name: data.name.trim() });
  if (exists) throw ApiError.conflict('Reseller with this name already exists');

  return Reseller.create({
    userId,
    name: data.name.trim(),
    phone: data.phone || '',
  });
};

const getById = async (userId, id) => {
  const reseller = await Reseller.findOne({ _id: id, userId }).lean();
  if (!reseller) throw ApiError.notFound('Reseller not found');

  const [orders, pricing] = await Promise.all([
    ClientSubscription.find({ userId, resellerId: id, isResellerSale: true, isArchived: false })
      .populate('categoryId', 'name')
      .sort({ purchaseDate: -1 })
      .lean(),
    ResellerPricing.find({ userId, resellerId: id })
      .populate('subscriptionId', 'name')
      .sort({ createdAt: -1 })
      .lean(),
  ]);

  const totals = orders.reduce(
    (acc, o) => {
      acc.totalSales += o.sellingPrice || 0;
      acc.totalProfit += (o.sellingPrice || 0) - (o.purchasePrice || 0);
      acc.totalOrders += 1;
      return acc;
    },
    { totalSales: 0, totalProfit: 0, totalOrders: 0 }
  );

  return { ...reseller, ...totals, orders, pricing };
};

const upsertPricing = async (userId, resellerId, data) => {
  const [reseller, category] = await Promise.all([
    Reseller.findOne({ _id: resellerId, userId }),
    SubscriptionCategory.findOne({ _id: data.subscriptionId, userId }),
  ]);

  if (!reseller) throw ApiError.notFound('Reseller not found');
  if (!category) throw ApiError.notFound('Subscription not found');

  const pricing = await ResellerPricing.findOneAndUpdate(
    { userId, resellerId, subscriptionId: data.subscriptionId },
    {
      $set: {
        sellingPrice: data.sellingPrice,
      },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  )
    .populate('subscriptionId', 'name')
    .lean();

  return pricing;
};

const listPricing = async (userId, resellerId) => {
  const reseller = await Reseller.findOne({ _id: resellerId, userId });
  if (!reseller) throw ApiError.notFound('Reseller not found');

  return ResellerPricing.find({ userId, resellerId })
    .populate('subscriptionId', 'name')
    .sort({ createdAt: -1 })
    .lean();
};

const getPricingBySubscription = async (userId, resellerId, subscriptionId) => {
  const pricing = await ResellerPricing.findOne({ userId, resellerId, subscriptionId }).lean();
  if (!pricing) throw ApiError.notFound('Pricing not found for this reseller and subscription');
  return pricing;
};

const createOrder = async (userId, data) => {
  const [reseller, category, pricing] = await Promise.all([
    Reseller.findOne({ _id: data.resellerId, userId }),
    SubscriptionCategory.findOne({ _id: data.subscriptionId, userId }),
    ResellerPricing.findOne({
      userId,
      resellerId: data.resellerId,
      subscriptionId: data.subscriptionId,
    }),
  ]);

  if (!reseller) throw ApiError.notFound('Reseller not found');
  if (!category) throw ApiError.notFound('Subscription not found');
  if (!pricing) {
    throw ApiError.badRequest('Pricing is not configured for this reseller and subscription');
  }

  const totalDays = getTotalDays('monthly');
  const purchaseDate = new Date();
  const startDate = purchaseDate;
  const endDate = calculateEndDate(startDate, totalDays);
  const payment = resolvePaymentFields({
    sellingPrice: pricing.sellingPrice,
    paymentStatus: data.paymentStatus || 'pending',
    amountReceived: data.amountReceived,
  });

  const order = await ClientSubscription.create({
    userId,
    categoryId: category._id,
    resellerId: reseller._id,
    isResellerSale: true,
    clientName: '',
    clientPhone: '',
    clientEmail: data.clientEmail,
    purchaseDate,
    startDate,
    originalEndDate: endDate,
    currentEndDate: endDate,
    sellingPrice: pricing.sellingPrice,
    purchasePrice: category.defaultPurchasePrice || 0,
    durationType: 'monthly',
    customDays: 0,
    totalDays,
    paymentStatus: payment.paymentStatus,
    paymentMethod: data.paymentMethod || '',
    amountReceived: payment.amountReceived,
    amountRemaining: payment.amountRemaining,
    notes: data.notes || '',
    tags: ['reseller'],
  });

  await ActivityLog.create({
    userId,
    clientSubscriptionId: order._id,
    actionType: 'created',
    meta: {
      source: 'reseller_order',
      resellerId: reseller._id,
      subscriptionId: category._id,
      sellingPrice: pricing.sellingPrice,
    },
  });

  // Generate/upload receipt in background (never block reseller order creation).
  void attachReceiptIfEnabled(userId, order._id);

  return ClientSubscription.findById(order._id)
    .populate('categoryId', 'name')
    .populate('resellerId', 'name phone')
    .lean();
};

module.exports = {
  list,
  create,
  getById,
  upsertPricing,
  listPricing,
  getPricingBySubscription,
  createOrder,
};
