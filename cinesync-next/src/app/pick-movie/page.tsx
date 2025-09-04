'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button, TextField, CircularProgress, Box } from '@mui/material';
import { usePickMovie } from '@/hooks/usePickMovie';
import useMovies from '@/hooks/useMovies';
import styles from './PickMovie.module.css';

export default function PickMovie() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  
  const { 
    movies, 
    loading, 
    error: moviesError, 
    search: searchMovies,
    loadMore,
    hasMore 
  } = useMovies();
  
  const {
    selectedMovie,
    isPrivate,
    setIsPrivate,
    subtitlesEnabled,
    setSubtitlesEnabled,
    isUploading,
    uploadProgress,
    fileInputRef,
    handleFileChange,
    handleMovieSelect,
    handleCreateRoom,
    error: pickMovieError,
  } = usePickMovie();

  // Handle search input change with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      searchMovies(searchQuery);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchQuery, searchMovies]);

  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <Button 
            variant="outlined" 
            onClick={() => router.push('/dashboard')}
            className={styles.backButton}
          >
            ← Back
          </Button>
        </div>
        <h1 className={styles.pageTitle}>Pick a Movie</h1>
        <div className={styles.headerRight}>
          {/* User profile or login state */}
        </div>
      </header>

      <main className={styles.mainContent}>
        <section className={styles.searchSection}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search for movies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
            InputProps={{
              startAdornment: (
                <Box sx={{ color: 'text.secondary', mr: 1 }}>🔍</Box>
              ),
            }}
          />
        </section>

        <section className={styles.movieSection}>
          <h2 className={styles.sectionTitle}>
            {searchQuery ? 'Search Results' : 'Popular Movies'}
          </h2>
          
          {loading && movies.length === 0 ? (
            <Box display="flex" justifyContent="center" my={4}>
              <CircularProgress />
            </Box>
          ) : moviesError ? (
            <div className={styles.errorMessage}>
              Error loading movies: {moviesError}
            </div>
          ) : movies.length === 0 ? (
            <div className={styles.noResults}>
              No movies found. Try a different search term.
            </div>
          ) : (
            <>
              <div className={styles.movieGrid}>
                {movies.map((movie) => (
                  <div 
                    key={movie.id} 
                    className={`${styles.movieCard} ${selectedMovie?.id === movie.id ? styles.selected : ''}`}
                    onClick={() => handleMovieSelect(movie)}
                  >
                    <div className={styles.movieThumbnail}>
                      {movie.poster_path ? (
                        <img 
                          src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} 
                          alt={movie.title} 
                          className={styles.thumbnailImage}
                          loading="lazy"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.onerror = null;
                            target.src = '/placeholder-movie.png'; // Add a fallback image
                          }}
                        />
                      ) : (
                        <div className={styles.thumbnailPlaceholder}>
                          {movie.title.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className={styles.ratingBadge}>
                        ★ {movie.vote_average.toFixed(1)}
                      </span>
                    </div>
                    <div className={styles.movieInfo}>
                      <h3 className={styles.movieTitle}>{movie.title}</h3>
                      <p className={styles.movieYear}>
                        {movie.release_date?.split('-')[0] || 'N/A'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              {hasMore && (
                <Box display="flex" justifyContent="center" mt={4}>
                  <Button 
                    variant="outlined" 
                    onClick={loadMore}
                    disabled={loading}
                  >
                    {loading ? 'Loading...' : 'Load More'}
                  </Button>
                </Box>
              )}
            </>
          )}
        </section>

        <section className={styles.optionsSection}>
          <h2 className={styles.sectionTitle}>Room Options</h2>
          
          <div className={styles.optionRow}>
            <div className={styles.optionText}>
              <h3 className={styles.optionLabel}>Private Room</h3>
              <p className={styles.optionDescription}>
                Only people with the room link can join
              </p>
            </div>
            <label className={styles.toggleSwitch}>
              <input 
                type="checkbox" 
                checked={isPrivate}
                onChange={() => setIsPrivate(!isPrivate)}
                className={styles.toggleInput}
              />
              <span className={styles.toggleSlider}></span>
            </label>
          </div>

          <div className={styles.optionRow}>
            <div className={styles.optionText}>
              <h3 className={styles.optionLabel}>Enable Subtitles</h3>
              <p className={styles.optionDescription}>
                Turn on subtitles for the video
              </p>
            </div>
            <label className={styles.toggleSwitch}>
              <input 
                type="checkbox" 
                checked={subtitlesEnabled}
                onChange={() => setSubtitlesEnabled(!subtitlesEnabled)}
                className={styles.toggleInput}
              />
              <span className={styles.toggleSlider}></span>
            </label>
          </div>
        </section>

        <div className={styles.actionButtons}>
          <Button 
            variant="contained" 
            color="primary"
            onClick={handleCreateRoom}
            disabled={!selectedMovie || isUploading}
            className={styles.createButton}
            size="large"
            fullWidth
          >
            {isUploading ? (
              <>
                <CircularProgress size={24} sx={{ mr: 1 }} />
                {uploadProgress > 0 ? `Uploading... ${uploadProgress}%` : 'Creating Room...'}
              </>
            ) : (
              `Create Room with ${selectedMovie ? selectedMovie.title : 'Selected Movie'}`
            )}
          </Button>
          
          <div className={styles.orDivider}>or</div>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="video/*"
            className={styles.fileInput}
            id="video-upload"
            disabled={isUploading}
          />
          <label htmlFor="video-upload" className={styles.uploadButton}>
            <Button 
              variant="outlined" 
              component="span"
              className={styles.uploadButtonInner}
              disabled={isUploading}
              fullWidth
            >
              Upload Your Own Video
            </Button>
          </label>
          
          {(pickMovieError || moviesError) && (
            <div className={styles.errorMessage}>
              {pickMovieError || moviesError}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
