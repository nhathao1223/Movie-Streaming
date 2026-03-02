const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { sendSuccess, sendError } = require('../utils/response');

exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });

    if (existingUser) {
      return sendError(res, 'User already exists', 400);
    }

    const user = new User({ username, email, password });
    await user.save();

    const token = generateToken(user._id);

    sendSuccess(res, {
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    }, 'User registered successfully', 201);
  } catch (error) {
    sendError(res, 'Server error', 500);
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return sendError(res, 'Invalid credentials', 400);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return sendError(res, 'Invalid credentials', 400);
    }

    const token = generateToken(user._id);

    sendSuccess(res, {
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    }, 'Login successful');
  } catch (error) {
    sendError(res, 'Server error', 500);
  }
};

exports.getMe = async (req, res) => {
  try {
    sendSuccess(res, {
      id: req.user._id,
      username: req.user.username,
      email: req.user.email
    }, 'User info retrieved');
  } catch (error) {
    sendError(res, 'Server error', 500);
  }
};
