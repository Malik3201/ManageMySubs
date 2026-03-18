const ApiError = require('./apiError');

const resolvePaymentFields = ({
  sellingPrice,
  paymentStatus,
  amountReceived,
  existingAmountReceived = 0,
}) => {
  const total = Math.max(0, Number(sellingPrice) || 0);

  if (paymentStatus === 'paid') {
    return {
      paymentStatus,
      amountReceived: total,
      amountRemaining: 0,
    };
  }

  if (paymentStatus === 'pending') {
    return {
      paymentStatus,
      amountReceived: 0,
      amountRemaining: total,
    };
  }

  const received = Number(amountReceived ?? existingAmountReceived);
  if (!Number.isFinite(received) || received <= 0) {
    throw ApiError.badRequest('Amount received must be greater than 0 for partially paid subscriptions');
  }

  if (received >= total && total > 0) {
    throw ApiError.badRequest('Amount received must be less than the selling price for partially paid subscriptions');
  }

  return {
    paymentStatus,
    amountReceived: received,
    amountRemaining: Math.max(0, total - received),
  };
};

module.exports = { resolvePaymentFields };
