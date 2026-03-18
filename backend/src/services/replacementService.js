const Replacement = require('../models/Replacement');
const ClientSubscription = require('../models/ClientSubscription');
const ActivityLog = require('../models/ActivityLog');
const ApiError = require('../utils/apiError');
const { calculateEndDate } = require('../utils/dateHelpers');

const create = async (userId, subscriptionId, data) => {
  const sub = await ClientSubscription.findOne({ _id: subscriptionId, userId });
  if (!sub) throw ApiError.notFound('Subscription not found');

  if (sub.isArchived) {
    throw ApiError.badRequest('Archived subscriptions cannot be replaced');
  }

  if (!['active', 'expiring_soon'].includes(sub.status)) {
    throw ApiError.badRequest('Only active or expiring soon subscriptions can be replaced');
  }

  if (data.usedDaysBeforeDeactivation >= sub.totalDays) {
    throw ApiError.badRequest('Used days must be less than the total subscription days');
  }

  const replacementDaysGranted = sub.totalDays - data.usedDaysBeforeDeactivation;
  const paidExtraDays =
    data.replacementType === 'partial_paid' ? Number(data.paidExtraDays || 0) : 0;
  const totalNewCoverage = replacementDaysGranted + paidExtraDays;
  if (totalNewCoverage <= 0) {
    throw ApiError.badRequest('Replacement must provide at least one day of new coverage');
  }

  const replacementStartDate = new Date();
  const replacementEndDate = calculateEndDate(replacementStartDate, totalNewCoverage);

  const replacement = await Replacement.create({
    userId,
    clientSubscriptionId: sub._id,
    reason: data.reason,
    issueDate: new Date(),
    usedDaysBeforeDeactivation: data.usedDaysBeforeDeactivation,
    replacementDaysGranted,
    replacementType: data.replacementType,
    paidExtraDays,
    replacementStartDate,
    replacementEndDate,
    notes: data.notes,
  });

  sub.status = 'in_replacement';
  sub.currentEndDate = replacementEndDate;
  await sub.save();

  await ActivityLog.create({
    userId,
    clientSubscriptionId: sub._id,
    actionType: 'replacement_issued',
    meta: {
      replacementId: replacement._id,
      replacementType: data.replacementType,
      replacementDaysGranted,
      paidExtraDays,
    },
  });

  return replacement;
};

const listBySubscription = async (userId, subscriptionId) => {
  const sub = await ClientSubscription.findOne({ _id: subscriptionId, userId });
  if (!sub) throw ApiError.notFound('Subscription not found');
  return Replacement.find({ clientSubscriptionId: subscriptionId, userId }).sort({ createdAt: -1 });
};

module.exports = { create, listBySubscription };
