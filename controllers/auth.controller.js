const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { sendSuccess, sendError } = require('../utils/response');
const logger = require('../config/logger');

exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });

    if (existingUser) {
      logger.warn(`Registration failed: User already exists - ${email}`);
      return sendError(res, 'User already exists', 400);
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
    sendError(res, 'Server error', 500);
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      logger.warn(`Login failed: User not found - ${email}`);
      return sendError(res, 'Invalid credentials', 400);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      logger.warn(`Login failed: Invalid password - ${email}`);
      return sendError(res, 'Invalid credentials', 400);
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
    sendError(res, 'Server error', 500);
  }
};

exports.getMe = async (req, res) => {
  try {
    logger.debug(`Getting user info: ${req.user._id}`);
    sendSuccess(res, {
      id: req.user._id,
      username: req.user.username,
      email: req.user.email
    }, 'User info retrieved');
  } catch (error) {
    logger.error(`Get user info error: ${error.message}`);
    sendError(res, 'Server error', 500);
  }
};
