export interface Movie {
  id: number | string;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  video?: boolean;
  media_type?: string;
  popularity?: number;
  original_language?: string;
  original_title?: string;
  genre_ids?: number[];
  adult?: boolean;
  // Additional properties for our app
  source?: 'tmdb' | 'upload';
  duration?: string;
  thumbnail?: string;
  backdrop?: string;
  trailer?: string | null;
  tmdb_id?: number;
}

export interface MovieDetails extends Movie {
  runtime: number;
  genres: { id: number; name: string }[];
  videos: {
    results: {
      id: string;
      key: string;
      name: string;
      site: string;
      type: string;
    }[];
  };
  credits: {
    cast: {
      id: number;
      name: string;
      character: string;
      profile_path: string | null;
    }[];
    crew: {
      id: number;
      name: string;
      job: string;
      profile_path: string | null;
    }[];
  };
}

export interface ApiResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}
