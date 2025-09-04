import axios from 'axios';

const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

const tmdb = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json;charset=utf-8',
  },
  params: {
    language: 'en-US',
  },
});

export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  original_language: string;
  original_title: string;
  popularity: number;
  video: boolean;
  adult: boolean;
}

export interface MovieDetails extends Movie {
  budget: number;
  genres: { id: number; name: string }[];
  homepage: string;
  imdb_id: string | null;
  production_companies: {
    id: number;
    name: string;
    logo_path: string | null;
    origin_country: string;
  }[];
  production_countries: {
    iso_3166_1: string;
    name: string;
  }[];
  revenue: number;
  runtime: number | null;
  spoken_languages: {
    english_name: string;
    iso_639_1: string;
    name: string;
  }[];
  status: string;
  tagline: string | null;
}

export interface MovieVideo {
  id: string;
  iso_639_1: string;
  iso_3166_1: string;
  key: string;
  name: string;
  official: boolean;
  published_at: string;
  site: string;
  size: number;
  type: 'Trailer' | 'Teaser' | 'Clip' | 'Featurette' | 'Behind the Scenes' | 'Bloopers';
}

export interface MovieCredits {
  id: number;
  cast: {
    adult: boolean;
    gender: number | null;
    id: number;
    known_for_department: string;
    name: string;
    original_name: string;
    popularity: number;
    profile_path: string | null;
    cast_id: number;
    character: string;
    credit_id: string;
    order: number;
  }[];
  crew: {
    adult: boolean;
    gender: number | null;
    id: number;
    known_for_department: string;
    name: string;
    original_name: string;
    popularity: number;
    profile_path: string | null;
    credit_id: string;
    department: string;
    job: string;
  }[];
}

export interface ApiResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

// Get popular movies
export const getPopularMovies = async (page = 1): Promise<ApiResponse<Movie>> => {
  const response = await tmdb.get<ApiResponse<Movie>>('/movie/popular', {
    params: { page },
  });
  return response.data;
};

// Get top rated movies
export const getTopRatedMovies = async (page = 1): Promise<ApiResponse<Movie>> => {
  const response = await tmdb.get<ApiResponse<Movie>>('/movie/top_rated', {
    params: { page },
  });
  return response.data;
};

// Get upcoming movies
export const getUpcomingMovies = async (page = 1): Promise<ApiResponse<Movie>> => {
  const response = await tmdb.get<ApiResponse<Movie>>('/movie/upcoming', {
    params: { page },
  });
  return response.data;
};

// Search movies
export const searchMovies = async (query: string, page = 1): Promise<ApiResponse<Movie>> => {
  const response = await tmdb.get<ApiResponse<Movie>>('/search/movie', {
    params: { query, page },
  });
  return response.data;
};

// Get movie details
export const getMovieDetails = async (id: number): Promise<MovieDetails> => {
  const { data } = await tmdb.get<MovieDetails>(`/movie/${id}`, {
    params: {
      append_to_response: 'videos,credits,recommendations,similar',
    },
  });
  return data;
};

// Get movie videos (trailers, teasers, etc.)
export const getMovieVideos = async (id: number): Promise<MovieVideo[]> => {
  const { data } = await tmdb.get<{ id: number; results: MovieVideo[] }>(`/movie/${id}/videos`);
  return data.results;
};

// Get movie credits (cast and crew)
export const getMovieCredits = async (id: number): Promise<MovieCredits> => {
  const { data } = await tmdb.get<MovieCredits>(`/movie/${id}/credits`);
  return data;
};

// Get similar movies
export const getSimilarMovies = async (id: number, page = 1): Promise<ApiResponse<Movie>> => {
  const { data } = await tmdb.get<ApiResponse<Movie>>(`/movie/${id}/similar`, {
    params: { page },
  });
  return data;
};

// Get movie recommendations
export const getMovieRecommendations = async (id: number, page = 1): Promise<ApiResponse<Movie>> => {
  const { data } = await tmdb.get<ApiResponse<Movie>>(`/movie/${id}/recommendations`, {
    params: { page },
  });
  return data;
};

// Get movie images
export const getMovieImages = async (id: number) => {
  const { data } = await tmdb.get(`/movie/${id}/images`);
  return data;
};

export interface MovieReview {
  author: string;
  author_details: {
    name: string;
    username: string;
    avatar_path: string | null;
    rating: number | null;
  };
  content: string;
  created_at: string;
  id: string;
  updated_at: string;
  url: string;
}

export interface MovieReviewsResponse {
  id: number;
  page: number;
  results: MovieReview[];
  total_pages: number;
  total_results: number;
}

// Get movie reviews
export const getMovieReviews = async (id: number, page = 1): Promise<MovieReviewsResponse> => {
  const { data } = await tmdb.get<MovieReviewsResponse>(`/movie/${id}/reviews`, {
    params: { page },
  });
  return data;
};

export default {
  getPopularMovies,
  getTopRatedMovies,
  getUpcomingMovies,
  searchMovies,
  getMovieDetails,
  getMovieVideos,
  getMovieCredits,
  getSimilarMovies,
  getMovieRecommendations,
  getMovieImages,
  getMovieReviews,
};
