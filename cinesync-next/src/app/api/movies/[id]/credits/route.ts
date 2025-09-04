import { NextResponse } from 'next/server';
import { getMovieCredits, MovieCredits } from '@/services/tmdb';

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

    const credits = await getMovieCredits(id);
    return NextResponse.json(credits);
  } catch (error) {
    console.error('Error in movie credits API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch movie credits' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
