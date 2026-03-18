const authService = require('../services/authService');
const ApiResponse = require('../utils/apiResponse');

const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.validatedBody);
    ApiResponse.created(res, result, 'Registration successful');
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.validatedBody);
    ApiResponse.success(res, result, 'Login successful');
  } catch (err) {
    next(err);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await authService.getProfile(req.userId);
    ApiResponse.success(res, { user });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getMe };
