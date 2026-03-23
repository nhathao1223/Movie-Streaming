const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const createTestUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if test user already exists
    const existingUser = await User.findOne({ email: 'testuser@example.com' });
    if (existingUser) {
      console.log('Test user already exists');
      console.log('Email: testuser@example.com');
      console.log('Password: testpass123');
      process.exit(0);
    }

    const testUser = new User({
      username: 'testuser',
      email: 'testuser@example.com',
      password: 'testpass123',
      role: 'user'
    });

    await testUser.save();
    console.log('Test user created successfully');
    console.log('Username: testuser');
    console.log('Email: testuser@example.com');
    console.log('Password: testpass123');

    process.exit(0);
  } catch (error) {
    console.error('Error creating test user:', error.message);
    process.exit(1);
  }
};

createTestUser();