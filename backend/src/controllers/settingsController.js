const ApiResponse = require('../utils/apiResponse');
const settingsService = require('../services/settingsService');

const get = async (req, res, next) => {
  try {
    const row = await settingsService.getOrCreate(req.userId);
    ApiResponse.success(res, row);
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const row = await settingsService.update(req.userId, req.validatedBody);
    ApiResponse.success(res, row, 'Settings saved');
  } catch (err) {
    next(err);
  }
};

module.exports = { get, update };

