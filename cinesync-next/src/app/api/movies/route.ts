import { NextResponse } from 'next/server';
import { 
  getPopularMovies, 
  searchMovies, 
  getMovieDetails,
  getMovieVideos,
  getMovieCredits,
  getSimilarMovies,
  getMovieRecommendations,
  Movie,
  MovieDetails,
  MovieVideo,
  MovieCredits
} from '@/services/tmdb';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const query = searchParams.get('query');
  const page = parseInt(searchParams.get('page') || '1', 10);

  try {
    // Handle movie details request
    if (id) {
      const details = await getMovieDetails(Number(id));
      return NextResponse.json(details);
    }
    
    // Handle search request
    if (query) {
      const results = await searchMovies(query, page);
      return NextResponse.json(results);
    }
    
    // Default to popular movies
    const popular = await getPopularMovies(page);
    return NextResponse.json(popular);
  } catch (error) {
    console.error('Error in movies API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch movies' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
