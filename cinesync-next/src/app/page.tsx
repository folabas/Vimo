'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  TextField, 
  InputAdornment,
  Tabs,
  Tab,
  Skeleton,
  useMediaQuery,
  useTheme,
  Button,
  CircularProgress
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import Image from 'next/image';
import Link from 'next/link';
import tmdb, { Movie } from '@/services/tmdb';

type MovieCategory = 'popular' | 'top_rated' | 'upcoming';

export default function Home() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [allMovies, setAllMovies] = useState<Movie[]>([]);
  const [visibleMovies, setVisibleMovies] = useState<Movie[]>([]);
  const [visibleCount, setVisibleCount] = useState<number>(12);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<MovieCategory>('popular');
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Fetch movies based on category or search query
  const fetchMovies = useCallback(async (category: MovieCategory = 'popular', pageNum: number = 1) => {
    if (isLoading) return;
    
    try {
      setIsLoading(true);
      setLoading(true);
      let response;
      
      if (searchQuery) {
        response = await tmdb.searchMovies(searchQuery, pageNum);
      } else {
        switch (category) {
          case 'top_rated':
            response = await tmdb.getTopRatedMovies(pageNum);
            break;
          case 'upcoming':
            response = await tmdb.getUpcomingMovies(pageNum);
            break;
          case 'popular':
          default:
            response = await tmdb.getPopularMovies(pageNum);
        }
      }

      if (pageNum === 1) {
        setAllMovies(response.results);
        setVisibleMovies(response.results.slice(0, 12));
      } else {
        const newMovies = [...allMovies, ...response.results];
        setAllMovies(newMovies);
        setVisibleMovies(newMovies.slice(0, visibleCount));
      }
      setHasMore(pageNum < response.total_pages);
      setPage(pageNum);
    } catch (error) {
      console.error('Error fetching movies:', error);
    } finally {
      setLoading(false);
      setIsLoading(false);
    }
  }, [searchQuery, isLoading]);

  // Handle search input change with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMovies(activeCategory, 1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, activeCategory]);

  // Update visible movies when visibleCount changes
  useEffect(() => {
    setVisibleMovies(allMovies.slice(0, visibleCount));
  }, [visibleCount, allMovies]);

  // Reset movies when search query or category changes
  useEffect(() => {
    setAllMovies([]);
    setVisibleMovies([]);
    setVisibleCount(12);
    setPage(1);
    setHasMore(true);
  }, [searchQuery, activeCategory]);

  // Initial fetch and handle tab changes
  useEffect(() => {
    fetchMovies(activeCategory, 1);
  }, [activeCategory]);

  // Handle tab change
  const handleCategoryChange = (event: React.SyntheticEvent, newValue: MovieCategory) => {
    setActiveCategory(newValue);
    setSearchQuery('');
  };

  // Load more movies function
  const loadMoreMovies = () => {
    const newCount = visibleCount + 20;
    setVisibleCount(newCount);
    
    // If we're close to the end of loaded movies, fetch more
    if (newCount >= allMovies.length - 5 && hasMore && !isLoading) {
      setPage(prevPage => prevPage + 1);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Hero Section */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography 
          variant="h2" 
          component="h1" 
          gutterBottom 
          sx={{
            fontWeight: 700,
            background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 2
          }}
        >
          Welcome to CineSync
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          Watch videos in sync with your friends
        </Typography>
      </Box>

      {/* Search Bar */}
      <Box sx={{ maxWidth: 600, mx: 'auto', mb: 4 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search for movies..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
            sx: { 
              borderRadius: 8,
              bgcolor: 'background.paper',
              boxShadow: 1
            }
          }}
        />
      </Box>

      {/* Category Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
        <Tabs 
          value={searchQuery ? false : activeCategory} 
          onChange={handleCategoryChange}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="movie categories"
        >
          <Tab label="Popular" value="popular" disabled={!!searchQuery} />
          <Tab label="Top Rated" value="top_rated" disabled={!!searchQuery} />
          <Tab label="Upcoming" value="upcoming" disabled={!!searchQuery} />
        </Tabs>
      </Box>

      {/* Movies Grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)', lg: 'repeat(6, 1fr)' }, gap: 3, mb: 4 }}>
        {loading && page === 1 ? (
          // Loading skeletons
          Array.from({ length: 12 }).map((_, index) => (
            <Box key={`skeleton-${index}`}>
              <Skeleton variant="rectangular" sx={{ 
                width: '100%',
                height: 0,
                paddingBottom: '150%',
                borderRadius: 2
              }} />
              <Skeleton width="80%" height={24} sx={{ mt: 1 }} />
              <Skeleton width="60%" height={20} />
            </Box>
          ))
        ) : (
          // Movie cards
          visibleMovies.map((movie, index) => (
            <Box key={`${movie.id}-${index}`}>
              <Link href={`/movie/${movie.id}`} style={{ textDecoration: 'none' }}>
                <Box 
                  sx={{
                    position: 'relative',
                    borderRadius: 2,
                    overflow: 'hidden',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: 3,
                      '& .movie-overlay': {
                        opacity: 1,
                      },
                    },
                  }}
                >
                  <Box
                    sx={{
                      position: 'relative',
                      width: '100%',
                      paddingBottom: '150%',
                      bgcolor: 'background.paper',
                    }}
                  >
                    {movie.poster_path ? (
                      <Image
                        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                        alt={movie.title}
                        fill
                        sizes="(max-width: 600px) 50vw, (max-width: 900px) 33.33vw, 20vw"
                        style={{
                          objectFit: 'cover',
                        }}
                        priority={false}
                      />
                    ) : (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: 'background.default',
                          color: 'text.secondary',
                        }}
                      >
                        No Image
                      </Box>
                    )}
                    <Box
                      className="movie-overlay"
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        p: 2,
                        background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0) 100%)',
                        color: 'white',
                        opacity: 0,
                        transition: 'opacity 0.3s ease',
                      }}
                    >
                      <Typography variant="subtitle2" noWrap>
                        {movie.title}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                        <Box
                          sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            bgcolor: 'rgba(0, 0, 0, 0.5)',
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            mr: 1,
                          }}
                        >
                          <Box
                            component="span"
                            sx={{
                              color: 'secondary.main',
                              fontWeight: 'bold',
                              mr: 0.5,
                            }}
                          >
                            {movie.vote_average.toFixed(1)}
                          </Box>
                          <Box component="span" sx={{ fontSize: '0.75rem' }}>/10</Box>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(movie.release_date).getFullYear()}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Link>
              <Typography
                variant="subtitle2"
                noWrap
                sx={{
                  mt: 1,
                  fontWeight: 500,
                  '&:hover': {
                    color: 'primary.main',
                  },
                }}
              >
                {movie.title}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {new Date(movie.release_date).getFullYear()}
              </Typography>
            </Box>
          ))
        )}
      </Box>

      {/* Show More Button */}
      {!loading && allMovies.length > 0 && visibleCount < allMovies.length && (
        <Box display="flex" justifyContent="center" my={4}>
          <Button 
            variant="outlined" 
            onClick={loadMoreMovies}
            disabled={isLoading}
            endIcon={isLoading ? <CircularProgress size={20} /> : null}
          >
            Show More
          </Button>
        </Box>
      )}

      {/* Loading indicator for initial load */}
      {isLoading && visibleCount <= 12 && (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      )}

      {/* Empty State */}
      {!loading && allMovies.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            {searchQuery
              ? 'No movies found. Try a different search term.'
              : 'No movies available at the moment.'}
          </Typography>
        </Box>
      )}
    </Container>
  );
}
