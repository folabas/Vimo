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
    
    // Validate file type and size
    const validTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
    const maxSize = 100 * 1024 * 1024; // 100MB
    
    if (!validTypes.includes(file.type)) {
      alert('Please upload a valid video file (MP4, WebM, or QuickTime)');
      return;
    }
    
    if (file.size > maxSize) {
      alert('Video file is too large. Maximum size is 100MB');
      return;
    }
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      console.log('Starting video upload...');
      const uploadedVideo = await uploadVideo(
        file,
        file.name.split('.')[0], // Use filename as title
        '', // No description for now
        (progress) => {
          console.log(`Upload progress: ${progress}%`);
          setUploadProgress(progress);
        }
      );
      
      console.log('Video upload completed, processing response:', uploadedVideo);
      
      if (!uploadedVideo || !uploadedVideo.videoUrl) {
        throw new Error('Invalid video data received from server');
      }
      
      const movieFromVideo = videoToMovie(uploadedVideo);
      console.log('Converted to movie object:', movieFromVideo);
      
      // Update state with the new video
      setUserVideos(prev => [...prev, movieFromVideo]);
      setSelectedMovie(movieFromVideo as typeof sampleMovies[0]);
      
      // Show success message
      alert('Video uploaded successfully!');
      
    } catch (error: any) {
      console.error('Video upload failed:', error);
      alert(error.message || 'Failed to upload video. Please try again.');
    } finally {
      // Reset states
      setIsUploading(false);
      setUploadProgress(0);
      // Clear the file input
      if (fileInputRef.current) fileInputRef.current.value = '';
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
