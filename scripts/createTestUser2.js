const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const createTestUser2 = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if test user already exists
    const existingUser = await User.findOne({ email: 'testuser2@example.com' });
    if (existingUser) {
      console.log('Test user 2 already exists');
      console.log('Email: testuser2@example.com');
      console.log('Password: testpass123');
      process.exit(0);
    }

    const testUser2 = new User({
      username: 'testuser2',
      email: 'testuser2@example.com',
      password: 'testpass123',
      role: 'user'
    });

    await testUser2.save();
    console.log('Test user 2 created successfully');
    console.log('Username: testuser2');
    console.log('Email: testuser2@example.com');
    console.log('Password: testpass123');

    process.exit(0);
  } catch (error) {
    console.error('Error creating test user 2:', error.message);
    process.exit(1);
  }
};

createTestUser2();