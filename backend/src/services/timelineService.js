const ActivityLog = require('../models/ActivityLog');
const ClientSubscription = require('../models/ClientSubscription');
const ApiError = require('../utils/apiError');

const getBySubscription = async (userId, subscriptionId) => {
  const sub = await ClientSubscription.findOne({ _id: subscriptionId, userId });
  if (!sub) throw ApiError.notFound('Subscription not found');

  return ActivityLog.find({ clientSubscriptionId: subscriptionId, userId })
    .sort({ createdAt: -1 })
    .lean();
};

module.exports = { getBySubscription };
