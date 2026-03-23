const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { sendSuccess, sendError } = require('../utils/response');
const AppError = require('../utils/AppError');
const logger = require('../config/logger');

exports.register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });

    if (existingUser) {
      logger.warn(`Registration failed: User already exists - ${email}`);
      return next(new AppError('User already exists', 400, 'USER_EXISTS'));
    }

    const user = new User({ username, email, password });
    await user.save();

    const token = generateToken(user._id);

    logger.info(`User registered successfully: ${email}`);
    sendSuccess(res, {
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    }, 'User registered successfully', 201);
  } catch (error) {
    logger.error(`Registration error: ${error.message}`);
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      logger.warn(`Login failed: User not found - ${email}`);
      return next(new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS'));
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      logger.warn(`Login failed: Invalid password - ${email}`);
      return next(new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS'));
    }

    const token = generateToken(user._id);

    logger.info(`User logged in successfully: ${email}`);
    sendSuccess(res, {
      token,

      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    }, 'Login successful');
  } catch (error) {
    logger.error(`Login error: ${error.message}`);
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    logger.debug(`Getting user info: ${req.user._id}`);
    sendSuccess(res, {
      id: req.user._id,
      username: req.user.username,
      email: req.user.email
    }, 'User info retrieved');
  } catch (error) {
    logger.error(`Get user info error: ${error.message}`);
    next(error);
  }
};
