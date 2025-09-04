'use client';

import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Suspense, useState, useEffect } from 'react';
import React from 'react';
import { getMovieDetails, getMovieVideos, getMovieCredits, getSimilarMovies, getMovieRecommendations, getMovieReviews } from '@/services/tmdb';
import { formatDate, formatDuration, getTrailer, formatMovieDetails, getYearFromDate } from '@/utils/movieUtils';
import MovieCard from '@/components/MovieCard';
import MovieReviews from '@/components/MovieReviews';
import SocialShare from '@/components/SocialShare';
import MovieDetailsSkeleton from '@/components/MovieDetailsSkeleton';

interface MoviePageProps {
  params: { id: string };
}

export default async function MoviePage({ params }: { params: { id: string } }) {
  const resolvedParams = await params;
  const movieId = parseInt(resolvedParams.id, 10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [movieData, setMovieData] = useState<{
    movie: any;
    videos: any[];
    credits: any;
    similar: any[];
    recommendations: any[];
    reviews: any[];
  } | null>(null);
  
  if (isNaN(movieId)) {
    notFound();
    return null;
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [movie, videos, credits, similar, recommendations, reviews] = await Promise.all([
          getMovieDetails(movieId),
          getMovieVideos(movieId),
          getMovieCredits(movieId),
          getSimilarMovies(movieId, 1).then(res => res.results.slice(0, 6)),
          getMovieRecommendations(movieId, 1).then(res => res.results.slice(0, 6)),
          getMovieReviews(movieId, 1).then(res => res.results),
        ]);
        
        setMovieData({
          movie,
          videos,
          credits,
          similar,
          recommendations,
          reviews,
        });
      } catch (err) {
        console.error('Error fetching movie details:', err);
        setError(err instanceof Error ? err : new Error('An error occurred'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [movieId]);

  if (loading) {
    return <MovieDetailsSkeleton />;
  }

  if (error || !movieData) {
    notFound();
    return null;
  }

  const { movie, videos, credits, similar, recommendations, reviews } = movieData;
  const trailerUrl = getTrailer(videos);
  const formattedMovie = formatMovieDetails(movie);
  interface CrewMember {
    job: string;
    name: string;
    id: number;
  }

  interface CastMember {
    id: number;
    name: string;
    character: string;
    profile_path: string | null;
  }

  const director = credits.crew.find((person: CrewMember) => person.job === 'Director');
  const topCast = credits.cast.slice(0, 5) as CastMember[];

  return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Backdrop */}
        <div className="relative h-full w-full pt-12">
          <Image
            src={formattedMovie.backdrop_path}
            alt={formattedMovie.title}
            fill
            className="object-cover object-top"
            priority
            sizes="100vw"
            quality={75}
            unoptimized={formattedMovie.backdrop_path?.includes('http')}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent" />
          
          <div className="container relative mx-auto flex h-full items-end pb-8">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="relative h-96 w-64 flex-shrink-0 rounded-lg shadow-2xl overflow-hidden">
                <div className="relative w-full h-0 pb-[150%]">
                  <Image
                    src={formattedMovie.poster_path}
                    alt={formattedMovie.title}
                    fill
                    className="rounded-lg shadow-lg object-cover"
                    sizes="(max-width: 768px) 50vw, 300px"
                    priority
                    unoptimized={formattedMovie.poster_path?.includes('http')}
                  />
                </div>
              </div>
              
              <div className="text-white">
                <h1 className="text-4xl font-bold mb-2">{formattedMovie.title}</h1>
                <div className="flex items-center space-x-4 mb-4">
                  <span className="text-yellow-400 font-semibold">
                    {formattedMovie.vote_average.toFixed(1)}/10
                  </span>
                  <span>{formattedMovie.release_date && getYearFromDate(formattedMovie.release_date)}</span>
                  {formattedMovie.runtime && (
                    <span>{formatDuration(formattedMovie.runtime)}</span>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {formattedMovie.genres.map((genre) => (
                    <span 
                      key={genre.id}
                      className="px-2 py-1 bg-white/20 rounded-full text-sm"
                    >
                      {genre.name}
                    </span>
                  ))}
                </div>
                
                <p className="text-lg mb-4">{formattedMovie.tagline}</p>
                
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-2 text-white">Overview</h2>
                  <p className="text-gray-300">{formattedMovie.overview}</p>
                </div>
                
                {director && (
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-2 text-white">Director</h2>
                    <p>{director.name}</p>
                  </div>
                )}
                
                <div className="flex flex-col space-y-4">
                  <div className="flex space-x-4">
                    {trailerUrl && (
                      <a
                        href={trailerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-full flex items-center space-x-2 transition-colors"
                      >
                        <span>▶</span>
                        <span>Watch Trailer</span>
                      </a>
                    )}
                    
                    <button className="bg-white/20 hover:bg-white/30 text-white px-6 py-2 rounded-full flex items-center space-x-2 transition-colors">
                      <span>+</span>
                      <span>Add to Watchlist</span>
                    </button>
                  </div>
                  
                  <SocialShare 
                    title={formattedMovie.title}
                    url={`${process.env.NEXT_PUBLIC_SITE_URL || 'https://cinesync.com'}/movie/${movieId}`}
                    description={formattedMovie.overview}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="container mx-auto px-4 py-12">
          {/* Cast Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-white">Top Cast</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {topCast.map((person: { id: number; name: string; character: string; profile_path: string | null }) => (
                <div key={person.id} className="flex flex-col items-center text-center">
                  <div className="relative w-24 h-24 rounded-full overflow-hidden mb-2 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    {person.profile_path ? (
                      <Image
                        src={`https://image.tmdb.org/t/p/w200${person.profile_path}`}
                        alt={person.name}
                        width={96}
                        height={96}
                        className="w-full h-full object-cover"
                        sizes="(max-width: 768px) 50px, 96px"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI5NiIgaGVpZ2h0PSI5NiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiA2NDY0NmMiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0ibHVjaWRlIGx1Y2lkZS11c2VyIj48cGF0aCBkPSJNMTkgMjF2LTJhNCA0IDAgMCAwLTQtNEg5YTQgNCAwIDAgMC00IDR2MiIvPjxjaXJjbGUgY3g9IjEyIiBjeT0iNyIgcjQiLz48L3N2Zz4=';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                          <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                      </div>
                    )}
                  </div>
                  <h3 className="font-semibold">{person.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{person.character}</p>
                </div>
              ))}
            </div>
          </section>
          
          {/* Reviews Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-white">User Reviews</h2>
            <MovieReviews reviews={reviews} />
          </section>
          
          {/* More Like This Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">More Like This</h2>
            
            {/* Similar Movies */}
            {similar.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4 text-white">Similar to {formattedMovie.title}</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {similar.map((movie) => (
                    <MovieCard key={movie.id} movie={movie} />
                  ))}
                </div>
              </div>
            )}
            
            {/* Recommended Movies */}
            {recommendations.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold mb-4 text-white">Recommended for You</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {recommendations.map((movie) => (
                    <MovieCard key={movie.id} movie={movie} />
                  ))}
                </div>
              </div>
            )}
            
            {/* Fallback if no recommendations or similar movies */}
            {similar.length === 0 && recommendations.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">No recommendations available at the moment.</p>
              </div>
            )}
          </section>
        </div>
      </div>
    );
  }
