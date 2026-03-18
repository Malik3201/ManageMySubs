const jwt = require('jsonwebtoken');
const config = require('../config');
const ApiError = require('../utils/apiError');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      throw ApiError.unauthorized('No token provided');
    }

    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, config.jwtSecret);
    const user = await User.findById(decoded.userId);

    if (!user) throw ApiError.unauthorized('User not found');

    req.user = user;
    req.userId = user._id;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return next(ApiError.unauthorized('Invalid or expired token'));
    }
    next(err);
  }
};

module.exports = auth;
