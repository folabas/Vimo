import { useState, useEffect, useCallback } from 'react';
import { 
  Movie, 
  MovieDetails, 
  MovieVideo, 
  MovieCredits,
  ApiResponse 
} from '@/services/tmdb';

const useMovies = () => {
  // State for movies list
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [query, setQuery] = useState<string>('');
  
  // State for movie details
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [videos, setVideos] = useState<MovieVideo[]>([]);
  const [credits, setCredits] = useState<MovieCredits | null>(null);
  const [recommendations, setRecommendations] = useState<Movie[]>([]);
  const [similar, setSimilar] = useState<Movie[]>([]);
  const [detailsLoading, setDetailsLoading] = useState<boolean>(false);

  // Format movie to ensure all required fields are present
  const formatMovie = (movie: Movie): Movie => {
    // Create a new object with only the properties defined in the Movie interface
    const formattedMovie: Movie = {
      id: movie.id,
      title: movie.title,
      overview: movie.overview || '',
      poster_path: movie.poster_path,
      backdrop_path: movie.backdrop_path,
      release_date: movie.release_date || new Date().toISOString().split('T')[0],
      vote_average: movie.vote_average || 0,
      vote_count: movie.vote_count || 0,
      genre_ids: movie.genre_ids || [],
      original_language: movie.original_language || 'en',
      original_title: movie.original_title || movie.title,
      popularity: movie.popularity || 0,
      video: movie.video || false,
      adult: movie.adult || false,
    };
    return formattedMovie;
  };

  // Fetch movies (popular or search)
  const fetchMovies = useCallback(async (searchQuery: string = '', pageNum: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(
        `/api/movies${searchQuery ? '/search' : '/popular'}?` + new URLSearchParams({
          query: searchQuery,
          page: pageNum.toString(),
        })
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch movies');
      }
      
      const data: ApiResponse<Movie> = await response.json();
      const formattedMovies = data.results.map(formatMovie);
      
      setMovies(prev => pageNum === 1 ? formattedMovies : [...prev, ...formattedMovies]);
      setHasMore(pageNum < data.total_pages);
      setPage(pageNum);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch movies');
      console.error('Error fetching movies:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch movie details
  const fetchMovieDetails = useCallback(async (id: number) => {
    try {
      setDetailsLoading(true);
      setError(null);
      
      const [detailsRes, videosRes, creditsRes, recommendationsRes, similarRes] = await Promise.all([
        fetch(`/api/movies/${id}`),
        fetch(`/api/movies/${id}/videos`),
        fetch(`/api/movies/${id}/credits`),
        fetch(`/api/movies/${id}/recommendations`),
        fetch(`/api/movies/${id}/similar`),
      ]);

      if (!detailsRes.ok) throw new Error('Failed to fetch movie details');
      
      const details: MovieDetails = await detailsRes.json();
      const videosData = await videosRes.json();
      const creditsData = await creditsRes.json();
      const recommendationsData = await recommendationsRes.json();
      const similarData = await similarRes.json();
      
      // Format the movie details to match the Movie type
      const formattedMovie: Movie = {
        id: details.id,
        title: details.title,
        overview: details.overview || '',
        poster_path: details.poster_path,
        backdrop_path: details.backdrop_path,
        release_date: details.release_date || new Date().toISOString().split('T')[0],
        vote_average: details.vote_average || 0,
        vote_count: details.vote_count || 0,
        genre_ids: details.genre_ids || details.genres?.map(g => g.id) || [],
        original_language: details.original_language || 'en',
        original_title: details.original_title || details.title,
        popularity: details.popularity || 0,
        video: details.video || false,
        adult: details.adult || false,
      };
      
      setSelectedMovie(formattedMovie);
      setVideos(videosData.results || []);
      setCredits(creditsData);
      setRecommendations((recommendationsData.results || []).map(formatMovie));
      setSimilar((similarData.results || []).map(formatMovie));
      
      return details;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch movie details');
      console.error('Error fetching movie details:', err);
      throw err;
    } finally {
      setDetailsLoading(false);
    }
  }, []);

  // Search movies
  const searchMovies = useCallback((searchQuery: string) => {
    setQuery(searchQuery);
    fetchMovies(searchQuery, 1);
  }, [fetchMovies]);

  // Load more movies (pagination)
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchMovies(query, page + 1);
    }
  }, [fetchMovies, hasMore, loading, page, query]);

  // Clear selected movie
  const clearSelectedMovie = useCallback(() => {
    setSelectedMovie(null);
    setVideos([]);
    setCredits(null);
    setRecommendations([]);
    setSimilar([]);
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  return {
    // Movies list state
    movies,
    loading,
    error,
    hasMore,
    page,
    query,
    
    // Movie details state
    selectedMovie,
    videos,
    credits,
    recommendations,
    similar,
    detailsLoading,
    
    // Actions
    search: searchMovies,
    loadMore,
    getMovieDetails: fetchMovieDetails,
    clearSelectedMovie,
  };
};

export default useMovies;
