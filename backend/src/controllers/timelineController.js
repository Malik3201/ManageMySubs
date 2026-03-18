const timelineService = require('../services/timelineService');
const ApiResponse = require('../utils/apiResponse');

const getBySubscription = async (req, res, next) => {
  try {
    const logs = await timelineService.getBySubscription(req.userId, req.params.id);
    ApiResponse.success(res, logs);
  } catch (err) {
    next(err);
  }
};

module.exports = { getBySubscription };
