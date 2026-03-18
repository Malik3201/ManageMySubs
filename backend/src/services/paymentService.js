const ClientSubscription = require('../models/ClientSubscription');
const ActivityLog = require('../models/ActivityLog');
const ApiError = require('../utils/apiError');
const { resolvePaymentFields } = require('../utils/paymentHelpers');

const updatePayment = async (userId, subscriptionId, data) => {
  const sub = await ClientSubscription.findOne({ _id: subscriptionId, userId });
  if (!sub) throw ApiError.notFound('Subscription not found');

  const payment = resolvePaymentFields({
    sellingPrice: sub.sellingPrice,
    paymentStatus: data.paymentStatus,
    amountReceived: data.amountReceived,
    existingAmountReceived: sub.amountReceived,
  });

  sub.paymentStatus = payment.paymentStatus;
  if (data.paymentMethod !== undefined) sub.paymentMethod = data.paymentMethod;
  sub.amountReceived = payment.amountReceived;
  sub.amountRemaining = payment.amountRemaining;

  await sub.save();

  await ActivityLog.create({
    userId,
    clientSubscriptionId: sub._id,
    actionType: 'payment_updated',
    meta: {
      paymentStatus: data.paymentStatus,
      amountReceived: sub.amountReceived,
      amountRemaining: sub.amountRemaining,
    },
  });

  return sub;
};

module.exports = { updatePayment };
