import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useRoom } from './useRoom';
import { Movie } from '@/types/tmdb';
import tmdb from '@/lib/api/tmdb';

interface UsePickMovieProps {
  initialMovie?: Movie | null;
}

export function usePickMovie({ initialMovie }: UsePickMovieProps = {}) {
  const router = useRouter();
  const { createRoom } = useRoom();
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(
    initialMovie || null
  );
  const [isPrivate, setIsPrivate] = useState(false);
  const [subtitlesEnabled, setSubtitlesEnabled] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle movie selection
  const handleMovieSelect = useCallback((movie: Movie) => {
    // Create a new movie object with all required fields
    const movieWithDefaults: Movie = {
      id: movie.id,
      title: movie.title,
      overview: movie.overview || '',
      poster_path: movie.poster_path,
      backdrop_path: movie.backdrop_path,
      release_date: movie.release_date || new Date().toISOString().split('T')[0],
      vote_average: movie.vote_average || 0,
      vote_count: movie.vote_count || 0,
      genre_ids: movie.genre_ids || [],
      original_language: movie.original_language || 'en',
      original_title: movie.original_title || movie.title,
      popularity: movie.popularity || 0,
      video: movie.video || false,
      adult: movie.adult || false,
    };
    
    setSelectedMovie(movieWithDefaults);
    setError(null);
  }, []);

  // Handle file upload
  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Validate file type and size
    const validTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
    const maxSize = 100 * 1024 * 1024; // 100MB
    
    if (!validTypes.includes(file.type)) {
      setError('Please upload a valid video file (MP4, WebM, or QuickTime)');
      return;
    }
    
    if (file.size > maxSize) {
      setError('Video file is too large. Maximum size is 100MB');
      return;
    }
    
    setIsUploading(true);
    setUploadProgress(0);
    setError(null);
    
    try {
      // In a real app, you would upload the file to your server here
      // const formData = new FormData();
      // formData.append('video', file);
      // const response = await uploadVideo(formData, (progressEvent) => {
      //   const progress = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
      //   setUploadProgress(progress);
      // });
      
      // For now, we'll just create a mock video object
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockVideo: Movie = {
        id: `upload-${Date.now()}`,
        title: file.name.replace(/\.[^/.]+$/, ''), // Remove file extension
        poster_path: '',
        backdrop_path: '',
        overview: 'Uploaded video',
        release_date: new Date().toISOString().split('T')[0],
        vote_average: 0,
        vote_count: 0,
        video: true,
        source: 'upload' as const,
        duration: '0:00',
        thumbnail: URL.createObjectURL(file),
      };
      
      setSelectedMovie(mockVideo);
      
    } catch (err) {
      setError('Failed to upload video. Please try again.');
      console.error('Error uploading video:', err);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, []);

  // Handle room creation
  const handleCreateRoom = useCallback(async () => {
    if (!selectedMovie) {
      setError('Please select a movie first');
      return;
    }
    
    try {
      // Create a video object that matches the expected type
      const videoData: Movie & { source: string; thumbnail: string; duration: string } = {
        // Start with all properties from selectedMovie
        ...selectedMovie,
        // Ensure required fields have defaults
        overview: selectedMovie.overview || '',
        poster_path: selectedMovie.poster_path || '',
        backdrop_path: selectedMovie.backdrop_path || '',
        release_date: selectedMovie.release_date || new Date().toISOString().split('T')[0],
        vote_average: selectedMovie.vote_average || 0,
        vote_count: selectedMovie.vote_count || 0,
        source: selectedMovie.source || 'tmdb',
        // Set thumbnail with fallback
        thumbnail: selectedMovie.poster_path 
          ? `https://image.tmdb.org/t/p/w500${selectedMovie.poster_path}`
          : '',
        // Default duration
        duration: '0:00'
      };
      
      // If it's a TMDb movie, fetch additional details
      if (typeof selectedMovie.id === 'number') {
        try {
          const details = await tmdb.getMovieDetails(selectedMovie.id);
          const trailer = await tmdb.getMovieTrailer(selectedMovie.id);
          
          // Update video data with additional details
          Object.assign(videoData, {
            ...details,
            trailer: trailer || null,
            tmdb_id: selectedMovie.id,
            // Ensure we have a thumbnail
            thumbnail: details.poster_path 
              ? `https://image.tmdb.org/t/p/w500${details.poster_path}`
              : videoData.thumbnail,
            // Ensure we have a backdrop
            backdrop_path: details.backdrop_path || videoData.backdrop_path,
            // Ensure we have a release date
            release_date: details.release_date || videoData.release_date,
            // Ensure we have an overview
            overview: details.overview || videoData.overview,
          });
        } catch (err) {
          console.error('Error fetching movie details:', err);
          // Continue with basic details if we can't fetch more
        }
      }
      
      // Create a room with the video data
      const room = await createRoom({
        title: videoData.title,
        isPrivate,
        video: {
          ...videoData,
          // Ensure we have all required fields
          id: String(videoData.id),
          source: videoData.source || 'tmdb',
          thumbnail: videoData.thumbnail || `https://image.tmdb.org/t/p/w500${videoData.poster_path}`,
          duration: videoData.duration || '0:00',
        },
        subtitlesEnabled
      });
      
      if (room?.id) {
        router.push(`/room/${room.id}`);
      } else {
        throw new Error('Failed to create room: No room ID returned');
      }
    } catch (err) {
      setError('Failed to create room. Please try again.');
      console.error('Error creating room:', err);
    }
  }, [selectedMovie, isPrivate, subtitlesEnabled, createRoom, router]);

  return {
    selectedMovie,
    isPrivate,
    setIsPrivate,
    subtitlesEnabled,
    setSubtitlesEnabled,
    isUploading,
    uploadProgress,
    error,
    fileInputRef,
    handleFileChange,
    handleMovieSelect,
    handleCreateRoom,
  };
}
