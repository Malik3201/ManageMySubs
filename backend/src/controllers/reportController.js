const reportService = require('../services/reportService');
const ApiResponse = require('../utils/apiResponse');

const getSalesReport = async (req, res, next) => {
  try {
    const report = await reportService.getSalesReport(req.userId, req.query);
    ApiResponse.success(res, report);
  } catch (err) {
    next(err);
  }
};

const getProfitReport = async (req, res, next) => {
  try {
    const report = await reportService.getProfitReport(req.userId, req.query);
    ApiResponse.success(res, report);
  } catch (err) {
    next(err);
  }
};

module.exports = { getSalesReport, getProfitReport };
