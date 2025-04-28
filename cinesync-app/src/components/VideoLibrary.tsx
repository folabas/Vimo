import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import styled from '@emotion/styled';
import { Video, getUserVideos, videoToMovie, getRoomVideos } from '../services/videoService';
import { Movie } from '../services/api/roomService';
import { theme } from '../styles/theme';
import { useAuth } from '../hooks/useAuth';

// Declare global type for our cache
declare global {
  interface Window {
    __VIDEO_CACHE: Record<string, Video[]>;
  }
}

// Props interface
interface VideoLibraryProps {
  roomCode?: string;
  onSelectVideo: (video: Movie) => void;
  selectedVideoId?: string;
}

// Styled components
const LibraryContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
`;

const VideoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: ${theme.spacing.md};
  width: 100%;
`;

const VideoCard = styled.div<{ isSelected: boolean }>`
  display: flex;
  flex-direction: column;
  border-radius: ${theme.borderRadius.md};
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
  background: ${theme.colors.background};
  border: 2px solid ${props => props.isSelected ? theme.colors.primary : theme.colors.backgroundDark};
  position: relative; /* Ensure position is set for proper event handling */
  z-index: 1; /* Ensure proper stacking context */

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 6px 10px rgba(0, 0, 0, 0.15);
    border-color: ${props => props.isSelected ? theme.colors.primary : theme.colors.primary};
  }

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 2px rgba(231, 76, 60, 0.3); /* Using primary color with opacity */
  }
`;

const ThumbnailContainer = styled.div`
  position: relative;
  width: 100%;
  padding-top: 56.25%; /* 16:9 aspect ratio */
  background: ${theme.colors.backgroundDark};
`;

const Thumbnail = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const PlayIcon = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;

  ${VideoCard}:hover & {
    opacity: 1;
  }

  svg {
    width: 24px;
    height: 24px;
    fill: white;
  }
`;

const VideoInfo = styled.div`
  padding: ${theme.spacing.sm};
`;

const VideoTitle = styled.h3`
  margin: 0 0 ${theme.spacing.xs};
  font-size: ${theme.typography.sizes.sm};
  font-weight: 500;
  color: ${theme.colors.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const VideoDuration = styled.span`
  font-size: ${theme.typography.sizes.xs};
  color: ${theme.colors.textSecondary};
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing.xl};
  text-align: center;
`;

const Spinner = styled.div`
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-top: 3px solid ${theme.colors.primary};
  border-radius: 50%;
  width: 24px;
  height: 24px;
  animation: spin 1s linear infinite;
  margin-bottom: ${theme.spacing.md};

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.p`
  margin-top: ${theme.spacing.md};
  color: ${theme.colors.textSecondary};
  font-size: ${theme.typography.sizes.md};
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing.xl};
  text-align: center;
  background-color: ${theme.colors.errorLight};
  border-radius: ${theme.borderRadius.md};
  border: 1px solid ${theme.colors.error};
  color: ${theme.colors.error};
`;

const ErrorIcon = styled.div`
  font-size: 3rem;
  margin-bottom: ${theme.spacing.md};
`;

const ErrorText = styled.p`
  margin-bottom: ${theme.spacing.lg};
  color: ${theme.colors.textSecondary};
  font-size: ${theme.typography.sizes.md};
`;

const RetryButton = styled.button`
  background-color: ${theme.colors.primary};
  color: white;
  border: none;
  padding: ${theme.spacing.sm} ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.md};
  cursor: pointer;
  font-size: ${theme.typography.sizes.md};
  transition: background-color ${theme.transitions.fast};
  
  &:hover {
    background-color: ${theme.colors.primaryDark};
  }
`;

const EmptyStateContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing.xl};
  text-align: center;
  background-color: ${theme.colors.backgroundLight};
  border-radius: ${theme.borderRadius.md};
`;

const EmptyStateIcon = styled.div`
  font-size: 48px;
  margin-bottom: ${theme.spacing.md};
  color: ${theme.colors.textSecondary};
`;

const EmptyStateText = styled.p`
  font-size: ${theme.typography.sizes.sm};
  color: ${theme.colors.textSecondary};
  margin: 0;
`;

const TabContainer = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
  margin-bottom: ${theme.spacing.md};
`;

const Tab = styled.button<{ active: boolean }>`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  background-color: ${props => props.active ? theme.colors.primary : theme.colors.backgroundLight};
  color: ${props => props.active ? 'white' : theme.colors.text};
  border: none;
  border-radius: ${theme.borderRadius.sm};
  cursor: pointer;
  font-weight: ${props => props.active ? '500' : '400'};
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${props => props.active ? theme.colors.primaryDark : theme.colors.backgroundDark};
  }
`;

/**
 * VideoLibrary component displays a grid of user uploaded videos
 */
const VideoLibrary: React.FC<VideoLibraryProps> = ({ roomCode, onSelectVideo, selectedVideoId }) => {
  // Initialize window.__VIDEO_CACHE if it doesn't exist
  if (typeof window !== 'undefined' && !window.__VIDEO_CACHE) {
    window.__VIDEO_CACHE = {};
  }

  // State for videos and UI
  const [videos, setVideos] = useState<Video[]>([]);
  const [activeTab, setActiveTab] = useState<'my' | 'room'>(roomCode ? 'room' : 'my');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Refs to track request state
  const fetchingRef = useRef(false);
  const currentCacheKeyRef = useRef<string>('');
  const isMountedRef = useRef(false);
  
  // Create a cache key based on the tab and room code
  const cacheKey = useMemo(() => {
    return `${activeTab}_${roomCode || 'user'}`;
  }, [activeTab, roomCode]);
  
  // Set the current cache key ref when it changes
  useEffect(() => {
    currentCacheKeyRef.current = cacheKey;
    isMountedRef.current = true;
    
    return () => {
      isMountedRef.current = false;
    };
  }, [cacheKey]);
  
  // Function to fetch videos with caching
  const fetchVideos = useCallback(async (forceRefresh = false) => {
    setError(null);
    setIsLoading(true);
    
    try {
      // Check if we have cached data and aren't forcing a refresh
      const cachedData = (window as any).__VIDEO_CACHE?.[cacheKey];
      
      if (!forceRefresh && cachedData) {
        console.log(`Using cached videos for ${cacheKey}`);
        setVideos(cachedData);
        setIsLoading(false);
        return;
      }
      
      console.log(`Fetching ${activeTab} videos${roomCode ? ` for room ${roomCode}` : ''}`);
      
      // Fetch videos based on active tab
      let fetchedVideos: Video[];
      if (activeTab === 'room' && roomCode) {
        fetchedVideos = await getRoomVideos(roomCode);
      } else {
        fetchedVideos = await getUserVideos();
      }
      
      // Cache the results
      if (!window.__VIDEO_CACHE) {
        (window as any).__VIDEO_CACHE = {};
      }
      (window as any).__VIDEO_CACHE[cacheKey] = fetchedVideos;
      
      setVideos(fetchedVideos);
    } catch (err: any) {
      console.error('Error fetching videos:', err);
      setError(err.message || 'Failed to load videos. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, roomCode, cacheKey]);
  
  // Initial fetch
  useEffect(() => {
    // Only fetch if we have a valid cacheKey and we're not already fetching
    if (cacheKey && !fetchingRef.current) {
      fetchVideos();
    }
  }, [cacheKey, fetchVideos]);

  // Handle tab change
  const handleTabChange = (tab: 'my' | 'room') => {
    setActiveTab(tab);
  };
  
  // Handle video selection
  const handleSelectVideo = (video: Video, event: React.MouseEvent) => {
    // Convert video to movie format for the room
    const movie = videoToMovie(video);
    onSelectVideo(movie);
  };
  
  // Handle retry when error occurs
  const handleRetry = () => {
    fetchVideos(true); // Force refresh on retry
  };

  // Loading state
  if (isLoading) {
    return (
      <LibraryContainer>
        {roomCode && (
          <TabContainer>
            <Tab active={activeTab === 'my'} onClick={() => handleTabChange('my')}>
              My Videos
            </Tab>
            <Tab active={activeTab === 'room'} onClick={() => handleTabChange('room')}>
              Room Videos
            </Tab>
          </TabContainer>
        )}
        <LoadingContainer>
          <Spinner />
          <LoadingText>Loading videos...</LoadingText>
        </LoadingContainer>
      </LibraryContainer>
    );
  }
  
  // Error state
  if (error) {
    return (
      <LibraryContainer>
        {roomCode && (
          <TabContainer>
            <Tab active={activeTab === 'my'} onClick={() => handleTabChange('my')}>
              My Videos
            </Tab>
            <Tab active={activeTab === 'room'} onClick={() => handleTabChange('room')}>
              Room Videos
            </Tab>
          </TabContainer>
        )}
        <ErrorContainer>
          <ErrorIcon>🚨</ErrorIcon>
          <ErrorText>Error: {error}</ErrorText>
          <RetryButton onClick={handleRetry}>Retry</RetryButton>
        </ErrorContainer>
      </LibraryContainer>
    );
  }

  // Render empty state
  if (videos.length === 0) {
    return (
      <LibraryContainer>
        {roomCode && (
          <TabContainer>
            <Tab active={activeTab === 'my'} onClick={() => handleTabChange('my')}>
              My Videos
            </Tab>
            <Tab active={activeTab === 'room'} onClick={() => handleTabChange('room')}>
              Room Videos
            </Tab>
          </TabContainer>
        )}
        <EmptyStateContainer>
          <EmptyStateIcon>📹</EmptyStateIcon>
          <EmptyStateText>
            {activeTab === 'room' 
              ? 'No videos have been shared in this room yet.'
              : 'You haven\'t uploaded any videos yet.'}
          </EmptyStateText>
        </EmptyStateContainer>
      </LibraryContainer>
    );
  }

  // Render video grid
  return (
    <LibraryContainer>
      {roomCode && (
        <TabContainer>
          <Tab active={activeTab === 'my'} onClick={() => handleTabChange('my')}>
            My Videos
          </Tab>
          <Tab active={activeTab === 'room'} onClick={() => handleTabChange('room')}>
            Room Videos
          </Tab>
        </TabContainer>
      )}
      <VideoGrid>
        {videos.map((video) => (
          <VideoCard 
            key={video._id}
            isSelected={selectedVideoId === video._id}
            onClick={(e) => handleSelectVideo(video, e)}
            tabIndex={0} /* Make it focusable for keyboard navigation */
            role="button" /* Improve accessibility */
            aria-pressed={selectedVideoId === video._id}
          >
            <ThumbnailContainer>
              <Thumbnail 
                src={video.thumbnailUrl || `https://via.placeholder.com/320x180?text=${encodeURIComponent(video.title)}`}
                alt={video.title}
              />
              <PlayIcon>
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </PlayIcon>
            </ThumbnailContainer>
            <VideoInfo>
              <VideoTitle>{video.title}</VideoTitle>
              {video.duration && (
                <VideoDuration>
                  {typeof video.duration === 'number'
                    ? `${Math.floor(video.duration / 60)}:${(video.duration % 60).toString().padStart(2, '0')}`
                    : video.duration}
                </VideoDuration>
              )}
            </VideoInfo>
          </VideoCard>
        ))}
      </VideoGrid>
    </LibraryContainer>
  );
};

export default VideoLibrary;
