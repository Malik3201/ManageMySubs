const categoryService = require('../services/categoryService');
const ApiResponse = require('../utils/apiResponse');

const list = async (req, res, next) => {
  try {
    const categories = await categoryService.list(req.userId, req.query);
    ApiResponse.success(res, categories);
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const category = await categoryService.getById(req.userId, req.params.id);
    ApiResponse.success(res, category);
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const category = await categoryService.create(req.userId, req.validatedBody);
    ApiResponse.created(res, category);
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const category = await categoryService.update(req.userId, req.params.id, req.validatedBody);
    ApiResponse.success(res, category, 'Category updated');
  } catch (err) {
    next(err);
  }
};

const toggleArchive = async (req, res, next) => {
  try {
    const category = await categoryService.toggleArchive(req.userId, req.params.id);
    ApiResponse.success(res, category, category.isArchived ? 'Category archived' : 'Category restored');
  } catch (err) {
    next(err);
  }
};

module.exports = { list, getById, create, update, toggleArchive };
