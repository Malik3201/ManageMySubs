const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('../models/User');
const ApiError = require('../utils/apiError');

const generateToken = (userId) =>
  jwt.sign({ userId }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });

const register = async ({ name, email, password }) => {
  const existing = await User.findOne({ email });
  if (existing) throw ApiError.conflict('Email already registered');

  const user = await User.create({ name, email, password });
  const token = generateToken(user._id);
  return { user, token };
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) throw ApiError.unauthorized('Invalid email or password');

  const valid = await user.comparePassword(password);
  if (!valid) throw ApiError.unauthorized('Invalid email or password');

  const token = generateToken(user._id);
  return { user, token };
};

const getProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound('User not found');
  return user;
};

module.exports = { register, login, getProfile };
