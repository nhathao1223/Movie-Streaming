const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const createSimpleUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Delete existing user if exists
    await User.deleteOne({ email: 'simpleuser@example.com' });

    const simpleUser = new User({
      username: 'simpleuser',
      email: 'simpleuser@example.com',
      password: 'password123',
      role: 'user'
    });

    await simpleUser.save();
    console.log('Simple user created successfully');
    console.log('Username: simpleuser');
    console.log('Email: simpleuser@example.com');
    console.log('Password: password123');

    process.exit(0);
  } catch (error) {
    console.error('Error creating simple user:', error.message);
    process.exit(1);
  }
};

createSimpleUser();