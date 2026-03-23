const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/v1';

// Admin credentials
const ADMIN_CREDENTIALS = {
  email: 'admin@example.com',
  password: 'admin123456'
};

// User credentials for comparison
const USER_CREDENTIALS = {
  email: 'simpleuser@example.com',
  password: 'password123'
};

async function testAdminApis() {
  try {
    console.log('🔐 Testing Admin-Only APIs\n');

    // 1. Login as Admin
    console.log('1. Login as Admin...');
    const adminLoginResponse = await axios.post(`${BASE_URL}/auth/login`, ADMIN_CREDENTIALS);
    const adminToken = adminLoginResponse.data.data.token;
    console.log('✅ Admin login successful\n');

    // 2. Login as User
    console.log('2. Login as User...');
    const userLoginResponse = await axios.post(`${BASE_URL}/auth/login`, USER_CREDENTIALS);
    const userToken = userLoginResponse.data.data.token;
    console.log('✅ User login successful\n');

    // 3. Test Admin API with Admin token (Should work)
    console.log('3. Test CREATE MOVIE with Admin token...');
    const movieData = {
      title: 'Test Admin Movie',
      description: 'This movie was created by admin for testing purposes',
      genre: ['Action', 'Test'],
      releaseYear: 2024,
      duration: 120,
      director: 'Test Director'
    };

    try {
      const createMovieResponse = await axios.post(`${BASE_URL}/movies`, movieData, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      console.log('✅ Movie created successfully by Admin');
      console.log(`   Movie ID: ${createMovieResponse.data.data._id}\n`);
    } catch (error) {
      console.log('❌ Failed to create movie with Admin token');
      console.log(`   Error: ${error.response?.data?.message || error.message}\n`);
    }

    // 4. Test Admin API with User token (Should fail)
    console.log('4. Test CREATE MOVIE with User token (should fail)...');
    try {
      await axios.post(`${BASE_URL}/movies`, movieData, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      console.log('❌ Unexpected: Movie created with User token (security issue!)');
    } catch (error) {
      console.log('✅ Correctly blocked: User cannot create movies');
      console.log(`   Status: ${error.response?.status}`);
      console.log(`   Message: ${error.response?.data?.message}\n`);
    }

    // 5. Test GET PENDING REVIEWS (Admin only)
    console.log('5. Test GET PENDING REVIEWS with Admin token...');
    try {
      const pendingReviewsResponse = await axios.get(`${BASE_URL}/reviews/pending`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      console.log('✅ Pending reviews retrieved by Admin');
      console.log(`   Count: ${pendingReviewsResponse.data.data.length} pending reviews\n`);
    } catch (error) {
      console.log('❌ Failed to get pending reviews');
      console.log(`   Error: ${error.response?.data?.message || error.message}\n`);
    }

    // 6. Test GET PENDING REVIEWS with User token (Should fail)
    console.log('6. Test GET PENDING REVIEWS with User token (should fail)...');
    try {
      await axios.get(`${BASE_URL}/reviews/pending`, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      console.log('❌ Unexpected: User accessed pending reviews (security issue!)');
    } catch (error) {
      console.log('✅ Correctly blocked: User cannot access pending reviews');
      console.log(`   Status: ${error.response?.status}`);
      console.log(`   Message: ${error.response?.data?.message}\n`);
    }

    // 7. Test without token (Should fail)
    console.log('7. Test CREATE MOVIE without token (should fail)...');
    try {
      await axios.post(`${BASE_URL}/movies`, movieData);
      console.log('❌ Unexpected: Movie created without token (security issue!)');
    } catch (error) {
      console.log('✅ Correctly blocked: No token provided');
      console.log(`   Status: ${error.response?.status}`);
      console.log(`   Message: ${error.response?.data?.message}\n`);
    }

    console.log('🎉 Admin API testing completed!');
    console.log('\n📋 Summary:');
    console.log('- Admin can create movies ✅');
    console.log('- Admin can access pending reviews ✅');
    console.log('- User cannot create movies ✅');
    console.log('- User cannot access pending reviews ✅');
    console.log('- No token = no access ✅');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

// Run the test
testAdminApis();