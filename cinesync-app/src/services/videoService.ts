import axios from 'axios';
import { isAuthenticated } from './api/authService';
import { Movie } from '../types/room';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export interface Video {
  _id: string;
  title: string;
  description?: string;
  videoUrl: string;
  thumbnailUrl?: string;
  publicId: string;
  duration?: number;
  owner: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Upload a video to the server
 * @param file Video file to upload
 * @param title Video title
 * @param description Video description
 * @param onProgress Progress callback
 * @returns Uploaded video data
 */
export const uploadVideo = async (
  file: File,
  title: string,
  description: string = '',
  onProgress?: (progress: number) => void
): Promise<Video> => {
  if (!isAuthenticated()) {
    throw new Error('Authentication required');
  }

  const formData = new FormData();
  formData.append('video', file);
  formData.append('title', title);
  formData.append('description', description);

  try {
    // Log the upload attempt
    console.log(`Uploading video: ${title} (${Math.round(file.size / 1024 / 1024 * 100) / 100} MB)`);

    // Create upload config with progress tracking
    const config = {
      withCredentials: true,
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent: any) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        console.log(`Upload progress: ${percentCompleted}%`);
        if (onProgress) {
          onProgress(percentCompleted);
        }
      }
    };

    // Make the upload request
    const response = await axios.post(`${API_URL}/videos/upload`, formData, config);

    // Log success
    console.log('Video uploaded successfully:', response.data);

    // Ensure we have a valid video URL in the response
    if (!response.data?.video?.videoUrl) {
      console.error('Invalid response format - missing video URL:', response.data);
      throw new Error('Server returned an invalid response - missing video URL');
    }

    return response.data.video;
  } catch (error: any) {
    // Log error details
    console.error('Video upload failed:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: error.config
    });

    // Create a more user-friendly error message
    let errorMessage = 'Failed to upload video';
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.code === 'ECONNABORTED') {
      errorMessage = 'Request timed out. Please check your connection and try again.';
    } else if (!navigator.onLine) {
      errorMessage = 'No internet connection. Please check your network and try again.';
    }

    throw new Error(errorMessage);
  }
};

/**
 * Get videos uploaded by the current user
 * @returns Array of user videos
 */
export const getUserVideos = async (): Promise<Video[]> => {
  if (!isAuthenticated()) {
    console.error('User not authenticated');
    // Redirect to login if not authenticated
    window.location.href = '/login';
    throw new Error('Authentication required. Please log in.');
  }

  try {
    console.log('Fetching user videos...');
    const response = await axios.get(`${API_URL}/videos/me`, {
      withCredentials: true,
      validateStatus: (status) => status < 500 // Don't throw for 401/403
    });

    if (response.status === 401 || response.status === 403) {
      // Token is invalid or expired
      console.error('Authentication failed:', response.data?.message || 'Invalid token');
      localStorage.removeItem('vimo_auth_token');
      window.location.href = '/login';
      throw new Error('Your session has expired. Please log in again.');
    }

    if (response.status !== 200) {
      throw new Error(response.data?.message || 'Failed to fetch videos');
    }

    console.log(`Found ${response.data?.length || 0} user videos`);
    return response.data || [];
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message;
    console.error('Failed to fetch user videos:', errorMessage);

    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('vimo_auth_token');
      window.location.href = '/login';
    }

    throw new Error(errorMessage || 'Failed to fetch videos. Please try again.');
  }
};

/**
 * Get a specific video by ID
 * @param videoId Video ID
 * @returns Video data
 */
export const getVideoById = async (videoId: string): Promise<Video> => {
  if (!isAuthenticated()) {
    throw new Error('Authentication required');
  }

  try {
    const response = await axios.get(`${API_URL}/api/videos/${videoId}`, {
      withCredentials: true
    });

    return response.data;
  } catch (error: any) {
    console.error('Failed to fetch video:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Delete a video
 * @param videoId Video ID to delete
 * @returns Success message
 */
export const deleteVideo = async (videoId: string): Promise<{ message: string }> => {
  if (!isAuthenticated()) {
    throw new Error('Authentication required');
  }

  try {
    const response = await axios.delete(`${API_URL}/api/videos/${videoId}`, {
      withCredentials: true
    });

    return response.data;
  } catch (error: any) {
    console.error('Failed to delete video:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Cache for video to movie conversions with expiration
 */
interface CacheEntry {
  movie: Movie;
  timestamp: number;
}

// Cache with 5 minute expiration
const CACHE_EXPIRATION_MS = 5 * 60 * 1000;
const conversionCache = new Map<string, CacheEntry>();

/**
 * Convert a Video object to a Movie object
 * @param video Video object
 * @returns Movie object
 */
export const videoToMovie = (video: Video): Movie => {
  const videoId = video._id;
  const now = Date.now();

  // Check if we have a valid cached conversion
  if (conversionCache.has(videoId)) {
    const cacheEntry = conversionCache.get(videoId)!;

    // Check if cache entry is still valid
    if (now - cacheEntry.timestamp < CACHE_EXPIRATION_MS) {
      console.log('Using cached movie conversion for:', videoId);
      return cacheEntry.movie;
    } else {
      console.log('Cache expired for:', videoId);
      conversionCache.delete(videoId);
    }
  }

  console.log('Converting video to movie:', JSON.stringify({
    _id: video._id,
    title: video.title,
    videoUrl: video.videoUrl,
    thumbnailUrl: video.thumbnailUrl
  }, null, 2));

  // Debug the source URL
  console.log('Video URL:', video.videoUrl);

  // Duration is stored as a number in the Movie type

  // Ensure we have a valid URL
  const videoUrl = video.videoUrl && video.videoUrl.trim() !== ''
    ? video.videoUrl
    : null;

  if (!videoUrl) {
    console.error('Missing video URL for video:', video._id);
  } else {
    try {
      // Validate URL format
      new URL(videoUrl);
    } catch (error) {
      console.error('Invalid video URL format:', videoUrl);
    }
  }

  // Helper function to get a default thumbnail URL
  const getDefaultThumbnail = () => {
    return 'https://via.placeholder.com/320x180?text=No+Thumbnail';
  };
  
  // Ensure thumbnail URL uses HTTPS
  const secureThumbnailUrl = video.thumbnailUrl 
    ? video.thumbnailUrl.replace('http://', 'https://')
    : getDefaultThumbnail();

  // Create movie object from video
  const movie: Movie = {
    id: video._id || `temp-${Date.now()}`,
    title: video.title || 'Untitled Video',
    source: video.videoUrl || '',
    videoUrl: video.videoUrl || '',
    thumbnail: secureThumbnailUrl,
    duration: video.duration || 0
  };

  console.log('Created movie object:', JSON.stringify(movie, null, 2));

  // Cache the result if we have a valid ID
  if (video._id) {
    conversionCache.set(video._id, {
      movie,
      timestamp: Date.now()
    });
  } else {
    console.warn('Video missing ID, skipping cache:', video);
  }

  return movie;
};

/**
 * Share a video with a room
 * @param videoId Video ID to share
 * @param roomCode Room code to share with
 * @returns Success message
 */
export const shareVideoWithRoom = async (videoId: string, roomCode: string): Promise<{ message: string }> => {
  if (!isAuthenticated()) {
    throw new Error('Authentication required');
  }

  try {
    const response = await axios.post(
      `${API_URL}/api/videos/share`,
      { videoId, roomCode },
      { withCredentials: true }
    );

    return response.data;
  } catch (error: any) {
    console.error('Failed to share video with room:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get videos shared in a room
 * @param roomCode Room code
 * @returns Array of videos shared in the room
 */
export const getRoomVideos = async (roomCode: string): Promise<Video[]> => {
  if (!isAuthenticated()) {
    throw new Error('Authentication required');
  }

  try {
    console.log(`Fetching videos for room: ${roomCode}`);
    const response = await axios.get(`${API_URL}/api/rooms/${roomCode}/videos`, {
      withCredentials: true
    });

    console.log(`Found ${response.data.length} videos in room ${roomCode}`);
    return response.data;
  } catch (error: any) {
    console.error('Failed to fetch room videos:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get all public videos available for sharing
 * @returns Array of public videos
 */
export const getPublicVideos = async (): Promise<Video[]> => {
  if (!isAuthenticated()) {
    throw new Error('Authentication required');
  }

  try {
    console.log('Fetching public videos...');
    const response = await axios.get(`${API_URL}/videos/me`, {
      withCredentials: true
    });

    console.log(`Found ${response.data.length} public videos`);
    return response.data;
  } catch (error: any) {
    console.error('Failed to fetch public videos:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Update video metadata
 * @param videoId Video ID to update
 * @param updates Object containing fields to update
 * @returns Updated video data
 */
export const updateVideo = async (
  videoId: string,
  updates: { title?: string; description?: string; isPublic?: boolean }
): Promise<Video> => {
  if (!isAuthenticated()) {
    throw new Error('Authentication required');
  }

  try {
    console.log(`Updating video ${videoId}:`, updates);
    const response = await axios.put(
      `${API_URL}/api/videos/${videoId}`,
      updates,
      {
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' }
      }
    );

    console.log('Video updated successfully:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Failed to update video:', error.response?.data || error.message);
    throw error;
  }
};
