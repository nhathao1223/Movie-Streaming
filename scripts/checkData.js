const mongoose = require('mongoose');
const Genre = require('../models/Genre');
const Movie = require('../models/Movie');
require('dotenv').config();

const checkData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check genres
    const genres = await Genre.find({});
    console.log(`\nGenres in database: ${genres.length}`);
    genres.forEach(genre => {
      console.log(`- ${genre.name} (${genre.slug}) - Active: ${genre.isActive}`);
    });

    // Check movies
    const movies = await Movie.find({}).populate('genre', 'name');
    console.log(`\nMovies in database: ${movies.length}`);
    movies.forEach(movie => {
      console.log(`- ${movie.title} - Genres: ${movie.genre.map(g => g.name).join(', ')}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Check failed:', error);
    process.exit(1);
  }
};

checkData();