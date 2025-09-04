import { NextResponse } from 'next/server';
import { getMovieVideos, MovieVideo } from '@/services/tmdb';

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

    const videos = await getMovieVideos(id);
    return NextResponse.json({ results: videos });
  } catch (error) {
    console.error('Error in movie videos API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch movie videos' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
