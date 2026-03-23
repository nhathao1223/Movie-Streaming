const mongoose = require('mongoose');
const Genre = require('../models/Genre');
const Movie = require('../models/Movie');
const User = require('../models/User');
const Favorite = require('../models/Favorite');
const WatchHistory = require('../models/WatchHistory');
require('dotenv').config();

const seedNewData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Step 1: Create Genres
    console.log('Creating genres...');
    
    const genresData = [
      { name: 'Action', description: 'High-energy movies with exciting sequences' },
      { name: 'Adventure', description: 'Exciting journeys and quests' },
      { name: 'Comedy', description: 'Funny and entertaining movies' },
      { name: 'Drama', description: 'Serious and emotional storytelling' },
      { name: 'Horror', description: 'Scary and suspenseful movies' },
      { name: 'Romance', description: 'Love stories and romantic plots' },
      { name: 'Sci-Fi', description: 'Science fiction and futuristic themes' },
      { name: 'Thriller', description: 'Suspenseful and exciting movies' },
      { name: 'Crime', description: 'Criminal activities and investigations' },
      { name: 'Fantasy', description: 'Magical and supernatural elements' },
      { name: 'Animation', description: 'Animated movies and cartoons' },
      { name: 'Documentary', description: 'Non-fiction and educational content' }
    ];
    
    const genres = {};
    
    for (const genreData of genresData) {
      let genre = await Genre.findOne({ name: genreData.name });
      if (!genre) {
        genre = new Genre(genreData);
        await genre.save();
        console.log(`Created genre: ${genre.name}`);
      }
      genres[genre.name] = genre._id;
    }
    
    // Step 2: Create Movies with Genre References
    console.log('Creating movies with genre references...');
    
    // Clear existing movies
    await Movie.deleteMany({});
    
    const moviesData = [
      {
        title: "The Shawshank Redemption",
        description: "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
        genre: [genres['Drama']],
        releaseYear: 1994,
        duration: 142,
        director: "Frank Darabont",
        cast: ["Tim Robbins", "Morgan Freeman"],
        rating: 9.3,
        poster: "https://example.com/shawshank.jpg"
      },
      {
        title: "The Dark Knight",
        description: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests.",
        genre: [genres['Action'], genres['Crime'], genres['Drama']],
        releaseYear: 2008,
        duration: 152,
        director: "Christopher Nolan",
        cast: ["Christian Bale", "Heath Ledger"],
        rating: 9.0,
        poster: "https://example.com/darkknight.jpg"
      },
      {
        title: "Inception",
        description: "A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea.",
        genre: [genres['Action'], genres['Sci-Fi'], genres['Thriller']],
        releaseYear: 2010,
        duration: 148,
        director: "Christopher Nolan",
        cast: ["Leonardo DiCaprio", "Marion Cotillard"],
        rating: 8.7,
        poster: "https://example.com/inception.jpg"
      },
      {
        title: "The Matrix",
        description: "A computer programmer is led to fight an underground war against powerful computers who have constructed his entire reality.",
        genre: [genres['Action'], genres['Sci-Fi']],
        releaseYear: 1999,
        duration: 136,
        director: "The Wachowskis",
        cast: ["Keanu Reeves", "Laurence Fishburne"],
        rating: 8.7,
        poster: "https://example.com/matrix.jpg"
      },
      {
        title: "Pulp Fiction",
        description: "The lives of two mob hitmen, a boxer, a gangster and his wife intertwine in four tales of violence and redemption.",
        genre: [genres['Crime'], genres['Drama']],
        releaseYear: 1994,
        duration: 154,
        director: "Quentin Tarantino",
        cast: ["John Travolta", "Uma Thurman"],
        rating: 8.9,
        poster: "https://example.com/pulpfiction.jpg"
      },
      {
        title: "Forrest Gump",
        description: "The presidencies of Kennedy and Johnson, the Vietnam War, and other historical events unfold from the perspective of an Alabama man.",
        genre: [genres['Drama'], genres['Romance']],
        releaseYear: 1994,
        duration: 142,
        director: "Robert Zemeckis",
        cast: ["Tom Hanks", "Robin Wright"],
        rating: 8.8,
        poster: "https://example.com/forrestgump.jpg"
      },
      {
        title: "Goodfellas",
        description: "The story of Henry Hill and his life in the mob, covering his relationship with his wife Karen Hill and his mob partners.",
        genre: [genres['Crime'], genres['Drama']],
        releaseYear: 1990,
        duration: 146,
        director: "Martin Scorsese",
        cast: ["Robert De Niro", "Ray Liotta"],
        rating: 8.7,
        poster: "https://example.com/goodfellas.jpg"
      },
      {
        title: "Spirited Away",
        description: "During her family's move to the suburbs, a sullen 10-year-old girl wanders into a world ruled by gods, witches, and spirits.",
        genre: [genres['Animation'], genres['Adventure'], genres['Fantasy']],
        releaseYear: 2001,
        duration: 125,
        director: "Hayao Miyazaki",
        cast: ["Rumi Hiiragi", "Miyu Irino"],
        rating: 9.3,
        poster: "https://example.com/spirited-away.jpg"
      }
    ];
    
    const createdMovies = await Movie.insertMany(moviesData);
    console.log(`Created ${createdMovies.length} movies`);
    
    // Step 3: Create sample user data (favorites and watch history)
    console.log('Creating sample user data...');
    
    // Get existing users
    const users = await User.find({}).limit(3);
    
    if (users.length > 0) {
      const sampleUser = users[0];
      const movies = await Movie.find({}).limit(5);
      
      // Create some favorites
      for (let i = 0; i < 3 && i < movies.length; i++) {
        try {
          const favorite = new Favorite({
            user: sampleUser._id,
            movie: movies[i]._id
          });
          await favorite.save();
          console.log(`Added favorite: ${movies[i].title} for user ${sampleUser.username}`);
        } catch (error) {
          if (error.code !== 11000) { // Ignore duplicate key errors
            console.error(`Error creating favorite:`, error.message);
          }
        }
      }
      
      // Create some watch history
      for (let i = 0; i < movies.length; i++) {
        try {
          const progress = Math.floor(Math.random() * 100);
          const watchHistory = new WatchHistory({
            user: sampleUser._id,
            movie: movies[i]._id,
            progress: progress,
            duration: Math.floor((movies[i].duration * 60) * (progress / 100)), // Convert to seconds
            watchedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Random time in last 7 days
          });
          await watchHistory.save();
          console.log(`Added watch history: ${movies[i].title} (${progress}%) for user ${sampleUser.username}`);
        } catch (error) {
          console.error(`Error creating watch history:`, error.message);
        }
      }
    }
    
    console.log('\nSeed data creation completed successfully!');
    console.log(`- Created ${genresData.length} genres`);
    console.log(`- Created ${createdMovies.length} movies`);
    console.log(`- Created sample favorites and watch history`);
    
    process.exit(0);
  } catch (error) {
    console.error('Seed data creation failed:', error);
    process.exit(1);
  }
};

seedNewData();