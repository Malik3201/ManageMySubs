const SubscriptionCategory = require('../models/SubscriptionCategory');
const ApiError = require('../utils/apiError');

const list = async (userId, { archived } = {}) => {
  const filter = { userId };
  if (archived !== 'true') filter.isArchived = false;
  return SubscriptionCategory.find(filter).sort({ name: 1 });
};

const getById = async (userId, id) => {
  const cat = await SubscriptionCategory.findOne({ _id: id, userId });
  if (!cat) throw ApiError.notFound('Category not found');
  return cat;
};

const create = async (userId, data) => {
  return SubscriptionCategory.create({ ...data, userId });
};

const update = async (userId, id, data) => {
  const cat = await SubscriptionCategory.findOneAndUpdate(
    { _id: id, userId },
    data,
    { new: true, runValidators: true }
  );
  if (!cat) throw ApiError.notFound('Category not found');
  return cat;
};

const toggleArchive = async (userId, id) => {
  const cat = await SubscriptionCategory.findOne({ _id: id, userId });
  if (!cat) throw ApiError.notFound('Category not found');
  cat.isArchived = !cat.isArchived;
  await cat.save();
  return cat;
};

module.exports = { list, getById, create, update, toggleArchive };
