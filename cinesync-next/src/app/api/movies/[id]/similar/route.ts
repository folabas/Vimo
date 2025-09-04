import { NextResponse } from 'next/server';
import { getSimilarMovies, Movie } from '@/services/tmdb';

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

    const { results } = await getSimilarMovies(id);
    return NextResponse.json({ results });
  } catch (error) {
    console.error('Error in similar movies API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch similar movies' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
