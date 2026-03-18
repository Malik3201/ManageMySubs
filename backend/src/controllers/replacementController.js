const replacementService = require('../services/replacementService');
const ApiResponse = require('../utils/apiResponse');

const create = async (req, res, next) => {
  try {
    const replacement = await replacementService.create(
      req.userId,
      req.params.id,
      req.validatedBody
    );
    ApiResponse.created(res, replacement, 'Replacement issued');
  } catch (err) {
    next(err);
  }
};

const listBySubscription = async (req, res, next) => {
  try {
    const replacements = await replacementService.listBySubscription(req.userId, req.params.id);
    ApiResponse.success(res, replacements);
  } catch (err) {
    next(err);
  }
};

module.exports = { create, listBySubscription };
