import { NextResponse } from 'next/server';
import { getMovieRecommendations, Movie } from '@/services/tmdb';

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

    const { results } = await getMovieRecommendations(id);
    return NextResponse.json({ results });
  } catch (error) {
    console.error('Error in movie recommendations API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch movie recommendations' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
