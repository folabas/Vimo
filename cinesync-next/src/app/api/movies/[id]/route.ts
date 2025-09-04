import { NextResponse } from 'next/server';
import { 
  getMovieDetails,
  getMovieVideos,
  getMovieCredits,
  getSimilarMovies,
  getMovieRecommendations,
  MovieDetails,
  MovieVideo,
  MovieCredits
} from '@/services/tmdb';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid movie ID' },
        { status: 400 }
      );
    }

    const details = await getMovieDetails(id);
    return NextResponse.json(details);
  } catch (error) {
    console.error('Error in movie details API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch movie details' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
