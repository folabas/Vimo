import { Movie, MovieDetails, ApiResponse } from '@/types/tmdb';

const API_URL = 'https://api.themoviedb.org/3';
const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;

if (!API_KEY) {
  throw new Error('NEXT_PUBLIC_TMDB_API_KEY is not defined in environment variables');
}

const tmdb = {
  /**
   * Search for movies by query
   */
  async searchMovies(query: string, page: number = 1): Promise<ApiResponse<Movie>> {
    const response = await fetch(
      `${API_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&page=${page}`
    );
    return response.json();
  },

  /**
   * Get popular movies
   */
  async getPopularMovies(page: number = 1): Promise<ApiResponse<Movie>> {
    const response = await fetch(
      `${API_URL}/movie/popular?api_key=${API_KEY}&page=${page}`
    );
    return response.json();
  },

  /**
   * Get movie details by ID
   */
  async getMovieDetails(movieId: number): Promise<MovieDetails> {
    const response = await fetch(
      `${API_URL}/movie/${movieId}?api_key=${API_KEY}&append_to_response=videos,credits`
    );
    return response.json();
  },

  /**
   * Get movie trailer
   */
  async getMovieTrailer(movieId: number): Promise<string | null> {
    const data = await this.getMovieDetails(movieId);
    const trailer = data.videos.results.find(
      (video) => video.type === 'Trailer' && video.site === 'YouTube'
    );
    return trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null;
  },
};

export default tmdb;
