import Image from 'next/image';
import Link from 'next/link';
import { Movie } from '@/services/tmdb';
import { formatDate, getYearFromDate } from '@/utils/movieUtils';

interface MovieCardProps {
  movie: Movie;
  showReleaseDate?: boolean;
  showRating?: boolean;
  className?: string;
}

export default function MovieCard({ 
  movie, 
  showReleaseDate = true,
  showRating = true,
  className = ''
}: MovieCardProps) {
  const posterUrl = movie.poster_path 
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : '/images/no-poster.jpg';

  return (
    <div className={`group relative overflow-hidden rounded-lg shadow-lg transition-transform duration-300 hover:scale-105 ${className}`}>
      <Link href={`/movie/${movie.id}`} className="block">
        <div className="relative aspect-[2/3] w-full overflow-hidden">
          <Image
            src={posterUrl}
            alt={movie.title}
            fill
            className="object-cover transition-opacity duration-300 group-hover:opacity-75"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            priority={false}
          />
          
          {showRating && (
            <div className="absolute bottom-2 left-2 flex items-center justify-center rounded-full bg-yellow-400 px-2 py-1 text-xs font-bold text-gray-900">
              <span className="mr-1">★</span>
              <span>{movie.vote_average.toFixed(1)}</span>
            </div>
          )}
        </div>

        <div className="p-3">
          <h3 className="mb-1 text-sm font-semibold text-gray-900 dark:text-white line-clamp-2">
            {movie.title}
          </h3>
          
          {showReleaseDate && movie.release_date && (
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {getYearFromDate(movie.release_date)}
            </p>
          )}
        </div>
      </Link>
    </div>
  );
}
