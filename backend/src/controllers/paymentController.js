const paymentService = require('../services/paymentService');
const ApiResponse = require('../utils/apiResponse');

const updatePayment = async (req, res, next) => {
  try {
    const sub = await paymentService.updatePayment(req.userId, req.params.id, req.validatedBody);
    ApiResponse.success(res, sub, 'Payment updated');
  } catch (err) {
    next(err);
  }
};

module.exports = { updatePayment };
