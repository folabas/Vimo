import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadVideo, getUserVideos, videoToMovie } from '../services/videoService';
import { useRoom } from './useRoom';

export function usePickMovie(sampleMovies: any[]) {
  const navigate = useNavigate();
  const { createRoom } = useRoom();
  const [selectedMovie, setSelectedMovie] = useState<typeof sampleMovies[0] | null>(null);
  const [isPrivate, setIsPrivate] = useState(false);
  const [subtitlesEnabled, setSubtitlesEnabled] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [userVideos, setUserVideos] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load user videos
  const loadUserVideos = useCallback(() => {
    getUserVideos()
      .then(videos => {
        const formattedVideos = videos.map(videoToMovie);
        setUserVideos(formattedVideos);
      })
      .catch(error => {
        console.error('Failed to load videos:', error);
      });
  }, []);

  // Handle file upload
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setUploadProgress(0);
    try {
      const uploadedVideo = await uploadVideo(
        file,
        file.name.split('.')[0], // Use filename as title
        '', // No description for now
        (progress) => setUploadProgress(progress)
      );
      const movieFromVideo = videoToMovie(uploadedVideo);
      setUserVideos(prev => [...prev, movieFromVideo]);
      setSelectedMovie(movieFromVideo as typeof sampleMovies[0]);
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      console.error('Failed to upload video:', error);
      setIsUploading(false);
      setUploadProgress(0);
      alert('Failed to upload video. Please try again.');
    }
  };

  // Handle movie select
  const handleMovieSelect = (movie: typeof sampleMovies[0]) => {
    setSelectedMovie(movie);
  };

  // Handle create room
  const handleCreateRoom = async () => {
    if (!selectedMovie) return;
    try {
      const roomCode = await createRoom(selectedMovie, isPrivate, subtitlesEnabled);
      navigate(`/watch-room/${roomCode}`);
    } catch (error) {
      console.error('Failed to create room:', error);
    }
  };

  return {
    selectedMovie,
    setSelectedMovie,
    isPrivate,
    setIsPrivate,
    subtitlesEnabled,
    setSubtitlesEnabled,
    isUploading,
    uploadProgress,
    userVideos,
    setUserVideos,
    fileInputRef,
    loadUserVideos,
    handleFileChange,
    handleMovieSelect,
    handleCreateRoom,
  };
}
