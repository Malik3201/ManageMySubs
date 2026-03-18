const dashboardService = require('../services/dashboardService');
const ApiResponse = require('../utils/apiResponse');

const getSummary = async (req, res, next) => {
  try {
    const summary = await dashboardService.getSummary(req.userId);
    ApiResponse.success(res, summary);
  } catch (err) {
    next(err);
  }
};

module.exports = { getSummary };
