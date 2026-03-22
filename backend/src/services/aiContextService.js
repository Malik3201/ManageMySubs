const SubscriptionCategory = require('../models/SubscriptionCategory');
const ClientSubscription = require('../models/ClientSubscription');

const escapeRegex = (value = '') => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Compact context string for the LLM (size-bounded).
 */
async function buildSellerContext(userId) {
  const categories = await SubscriptionCategory.find({ userId, isArchived: false })
    .select('name defaultPurchasePrice')
    .sort({ name: 1 })
    .limit(40)
    .lean();

  const recentSubs = await ClientSubscription.find({ userId, isArchived: false })
    .select('clientName clientPhone clientEmail categoryId sellingPrice paymentStatus currentEndDate')
    .populate('categoryId', 'name')
    .sort({ createdAt: -1 })
    .limit(35)
    .lean();

  const customerKeys = new Map();
  for (const s of recentSubs) {
    const k = `${(s.clientName || '').trim()}|${(s.clientPhone || '').trim()}|${(s.clientEmail || '').trim()}`;
    if (!customerKeys.has(k) && (s.clientName || s.clientPhone || s.clientEmail)) {
      customerKeys.set(k, {
        name: s.clientName || '',
        phone: s.clientPhone || '',
        email: s.clientEmail || '',
      });
    }
    if (customerKeys.size >= 25) break;
  }

  return JSON.stringify(
    {
      categories: categories.map((c) => ({
        name: c.name,
        defaultPurchasePrice: c.defaultPurchasePrice ?? 0,
      })),
      recentCustomers: [...customerKeys.values()],
    },
    null,
    0
  );
}

/**
 * Find category by fuzzy name for current user.
 */
async function resolveCategory(userId, subscriptionName) {
  const name = String(subscriptionName || '').trim();
  if (!name) return null;
  const re = new RegExp(`^${escapeRegex(name)}$`, 'i');
  let cat = await SubscriptionCategory.findOne({ userId, name: re });
  if (!cat) {
    const partial = new RegExp(escapeRegex(name), 'i');
    cat = await SubscriptionCategory.findOne({ userId, name: partial });
  }
  if (cat?.isArchived) {
    cat.isArchived = false;
    await cat.save();
  }
  return cat || null;
}

module.exports = { buildSellerContext, resolveCategory };
