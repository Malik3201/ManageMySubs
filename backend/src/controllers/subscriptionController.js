const subscriptionService = require('../services/subscriptionService');
const ApiResponse = require('../utils/apiResponse');

const list = async (req, res, next) => {
  try {
    const { data, pagination } = await subscriptionService.list(req.userId, req.query);
    ApiResponse.paginated(res, data, pagination);
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const sub = await subscriptionService.getById(req.userId, req.params.id);
    ApiResponse.success(res, sub);
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const sub = await subscriptionService.create(req.userId, req.validatedBody);
    ApiResponse.created(res, sub);
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const sub = await subscriptionService.update(req.userId, req.params.id, req.validatedBody);
    ApiResponse.success(res, sub, 'Subscription updated');
  } catch (err) {
    next(err);
  }
};

const toggleArchive = async (req, res, next) => {
  try {
    const sub = await subscriptionService.toggleArchive(req.userId, req.params.id);
    ApiResponse.success(res, sub, sub.isArchived ? 'Archived' : 'Restored');
  } catch (err) {
    next(err);
  }
};

const renew = async (req, res, next) => {
  try {
    const sub = await subscriptionService.renew(req.userId, req.params.id, req.validatedBody);
    ApiResponse.created(res, sub, 'Subscription renewed');
  } catch (err) {
    next(err);
  }
};

module.exports = { list, getById, create, update, toggleArchive, renew };
