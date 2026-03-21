const safeTestPostFavorites = async () => {
  const baseURL = 'http://localhost:5000/api/v1';
  
  try {
    console.log('🛡️  Safe POST /api/v1/favorites test...\n');
    
    // 1. Login
    const loginResponse = await fetch(`${baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'simpleuser@example.com',
        password: 'password123'
      })
    });
    
    const loginData = await loginResponse.json();
    const token = loginData.data.token;
    console.log('✅ Logged in successfully\n');
    
    // 2. Get current favorites
    const favoritesResponse = await fetch(`${baseURL}/favorites`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const favoritesData = await favoritesResponse.json();
    const currentFavoriteIds = favoritesData.data.favorites.map(fav => fav.movie._id);
    
    console.log(`📋 Current favorites: ${currentFavoriteIds.length} movies`);
    
    // 3. Get available movies
    const moviesResponse = await fetch(`${baseURL}/movies`);
    const moviesData = await moviesResponse.json();
    
    // 4. Find a movie NOT in favorites
    const availableMovie = moviesData.data.movies.find(movie => 
      !currentFavoriteIds.includes(movie._id)
    );
    
    if (!availableMovie) {
      console.log('⚠️  All movies are in favorites. Removing one first...');
      const movieToRemove = currentFavoriteIds[0];
      
      await fetch(`${baseURL}/favorites/${movieToRemove}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log('✅ Removed one movie from favorites');
      // Use the removed movie for testing
      var testMovieId = movieToRemove;
      var testMovieTitle = 'Removed Movie';
    } else {
      var testMovieId = availableMovie._id;
      var testMovieTitle = availableMovie.title;
    }
    
    console.log(`🎬 Testing with: ${testMovieTitle} (${testMovieId})\n`);
    
    // 5. Test POST favorites
    console.log('🚀 Testing POST /api/v1/favorites...');
    const addResponse = await fetch(`${baseURL}/favorites`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ movieId: testMovieId })
    });
    
    const addData = await addResponse.json();
    
    console.log(`📊 Results:`);
    console.log(`   Status: ${addResponse.status}`);
    console.log(`   Success: ${addData.success}`);
    console.log(`   Message: ${addData.message}`);
    
    if (addResponse.ok) {
      console.log(`   Movie: ${addData.data.movie.title}`);
      console.log(`   Rating: ${addData.data.movie.rating}`);
      console.log(`   ✅ SUCCESS: Movie added to favorites!`);
    } else {
      console.log(`   ❌ FAILED: ${addData.message}`);
    }
    
    console.log('\n📝 Copy this working request:');
    console.log('─'.repeat(50));
    console.log('POST /api/v1/favorites');
    console.log('Authorization: Bearer YOUR_TOKEN');
    console.log('Content-Type: application/json');
    console.log('');
    console.log(`{`);
    console.log(`  "movieId": "${testMovieId}"`);
    console.log(`}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
};

safeTestPostFavorites();