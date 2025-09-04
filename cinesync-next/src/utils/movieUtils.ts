import { Movie, MovieDetails, MovieVideo } from '@/services/tmdb';

export const formatMovie = (movie: Movie) => ({
  id: movie.id,
  title: movie.title,
  overview: movie.overview,
  poster_path: movie.poster_path 
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : '/images/no-poster.jpg',
  backdrop_path: movie.backdrop_path
    ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
    : '/images/no-backdrop.jpg',
  release_date: movie.release_date,
  vote_average: movie.vote_average,
  vote_count: movie.vote_count,
  genre_ids: movie.genre_ids || [],
  original_language: movie.original_language,
  original_title: movie.original_title,
  popularity: movie.popularity,
  video: movie.video,
  adult: movie.adult,
  source: 'tmdb' as const,
  thumbnail: movie.poster_path 
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : '/images/no-poster.jpg',
  duration: '0:00',
});

export const formatMovieDetails = (details: MovieDetails) => ({
  ...formatMovie(details),
  budget: details.budget,
  genres: details.genres,
  homepage: details.homepage,
  imdb_id: details.imdb_id,
  production_companies: details.production_companies,
  production_countries: details.production_countries,
  revenue: details.revenue,
  runtime: details.runtime,
  spoken_languages: details.spoken_languages,
  status: details.status,
  tagline: details.tagline,
});

export const getTrailer = (videos: MovieVideo[]): string | null => {
  const trailer = videos.find(
    (video) => video.type === 'Trailer' && video.site === 'YouTube'
  );
  
  return trailer ? `https://www.youtube.com/embed/${trailer.key}` : null;
};

export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins.toString().padStart(2, '0')}m`;
};

export const formatDate = (dateString: string): string => {
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  return new Date(dateString).toLocaleDateString('en-US', options);
};

export const getYearFromDate = (dateString: string): string => {
  return dateString ? dateString.split('-')[0] : '';
};
