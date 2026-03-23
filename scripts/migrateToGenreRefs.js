const mongoose = require('mongoose');
const Movie = require('../models/Movie');
const Genre = require('../models/Genre');
require('dotenv').config();

const migrateToGenreRefs = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Step 1: Create default genres from existing movie data
    console.log('Step 1: Creating genres from existing movie data...');
    
    const movies = await Movie.find({});
    const genreNames = new Set();
    
    // Collect all unique genre names
    movies.forEach(movie => {
      if (movie.genre && Array.isArray(movie.genre)) {
        movie.genre.forEach(g => {
          if (typeof g === 'string') {
            genreNames.add(g.trim());
          }
        });
      }
    });
    
    console.log(`Found ${genreNames.size} unique genres:`, Array.from(genreNames));
    
    // Create genre documents
    const genreMap = new Map();
    
    for (const genreName of genreNames) {
      try {
        let genre = await Genre.findOne({ name: { $regex: new RegExp(`^${genreName}$`, 'i') } });
        
        if (!genre) {
          genre = new Genre({
            name: genreName,
            description: `${genreName} movies and shows`
          });
          await genre.save();
          console.log(`Created genre: ${genreName}`);
        } else {
          console.log(`Genre already exists: ${genreName}`);
        }
        
        genreMap.set(genreName.toLowerCase(), genre._id);
      } catch (error) {
        console.error(`Error creating genre ${genreName}:`, error.message);
      }
    }
    
    // Step 2: Update movies to use genre ObjectIds
    console.log('\nStep 2: Updating movies to use genre references...');
    
    let updatedCount = 0;
    let errorCount = 0;
    
    for (const movie of movies) {
      try {
        if (movie.genre && Array.isArray(movie.genre)) {
          const genreIds = [];
          
          for (const genreName of movie.genre) {
            if (typeof genreName === 'string') {
              const genreId = genreMap.get(genreName.toLowerCase());
              if (genreId) {
                genreIds.push(genreId);
              } else {
                console.warn(`Genre not found for movie ${movie.title}: ${genreName}`);
              }
            } else if (mongoose.Types.ObjectId.isValid(genreName)) {
              // Already an ObjectId, keep it
              genreIds.push(genreName);
            }
          }
          
          if (genreIds.length > 0) {
            await Movie.findByIdAndUpdate(movie._id, { genre: genreIds });
            updatedCount++;
            console.log(`Updated movie: ${movie.title} (${genreIds.length} genres)`);
          } else {
            console.warn(`No valid genres found for movie: ${movie.title}`);
          }
        }
      } catch (error) {
        console.error(`Error updating movie ${movie.title}:`, error.message);
        errorCount++;
      }
    }
    
    console.log(`\nMigration completed:`);
    console.log(`- Created ${genreMap.size} genres`);
    console.log(`- Updated ${updatedCount} movies`);
    console.log(`- Errors: ${errorCount}`);
    
    // Step 3: Verify migration
    console.log('\nStep 3: Verifying migration...');
    
    const updatedMovies = await Movie.find({}).populate('genre', 'name');
    const moviesWithGenres = updatedMovies.filter(movie => 
      movie.genre && movie.genre.length > 0
    );
    
    console.log(`Verification: ${moviesWithGenres.length}/${updatedMovies.length} movies have genre references`);
    
    // Show sample
    if (moviesWithGenres.length > 0) {
      const sample = moviesWithGenres[0];
      console.log(`Sample movie: ${sample.title}`);
      console.log(`Genres: ${sample.genre.map(g => g.name).join(', ')}`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrateToGenreRefs();