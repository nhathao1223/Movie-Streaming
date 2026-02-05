const mongoose = require('mongoose');
const Movie = require('../models/Movie');
require('dotenv').config();

const sampleMovies = [
  {
    title: "The Shawshank Redemption",
    description: "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
    genre: ["Drama"],
    releaseYear: 1994,
    duration: 142,
    director: "Frank Darabont",
    cast: ["Tim Robbins", "Morgan Freeman"],
    rating: 9.3,
    poster: "https://example.com/shawshank.jpg"
  },
  {
    title: "The Godfather",
    description: "The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.",
    genre: ["Crime", "Drama"],
    releaseYear: 1972,
    duration: 175,
    director: "Francis Ford Coppola",
    cast: ["Marlon Brando", "Al Pacino"],
    rating: 9.2,
    poster: "https://example.com/godfather.jpg"
  },
  {
    title: "The Dark Knight",
    description: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests.",
    genre: ["Action", "Crime", "Drama"],
    releaseYear: 2008,
    duration: 152,
    director: "Christopher Nolan",
    cast: ["Christian Bale", "Heath Ledger"],
    rating: 9.0,
    poster: "https://example.com/darkknight.jpg"
  },
  {
    title: "Pulp Fiction",
    description: "The lives of two mob hitmen, a boxer, a gangster and his wife intertwine in four tales of violence and redemption.",
    genre: ["Crime", "Drama"],
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
    genre: ["Drama", "Romance"],
    releaseYear: 1994,
    duration: 142,
    director: "Robert Zemeckis",
    cast: ["Tom Hanks", "Robin Wright"],
    rating: 8.8,
    poster: "https://example.com/forrestgump.jpg"
  },
  {
    title: "Inception",
    description: "A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea.",
    genre: ["Action", "Sci-Fi", "Thriller"],
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
    genre: ["Action", "Sci-Fi"],
    releaseYear: 1999,
    duration: 136,
    director: "The Wachowskis",
    cast: ["Keanu Reeves", "Laurence Fishburne"],
    rating: 8.7,
    poster: "https://example.com/matrix.jpg"
  },
  {
    title: "Goodfellas",
    description: "The story of Henry Hill and his life in the mob, covering his relationship with his wife Karen Hill and his mob partners.",
    genre: ["Biography", "Crime", "Drama"],
    releaseYear: 1990,
    duration: 146,
    director: "Martin Scorsese",
    cast: ["Robert De Niro", "Ray Liotta"],
    rating: 8.7,
    poster: "https://example.com/goodfellas.jpg"
  }
];

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing movies
    await Movie.deleteMany({});
    console.log('Cleared existing movies');

    // Insert sample movies
    await Movie.insertMany(sampleMovies);
    console.log('Sample movies inserted successfully');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();