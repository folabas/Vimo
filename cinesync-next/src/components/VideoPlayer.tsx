'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useRoom } from '../app/context/RoomContext';

interface VideoPlayerProps {
  videoId: string;
  onTimeUpdate?: (time: number) => void;
  onPlay?: () => void;
  onPause?: () => void;
  onSeek?: (time: number) => void;
  initialTime?: number;
  isPlaying?: boolean;
  className?: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoId,
  onTimeUpdate,
  onPlay,
  onPause,
  onSeek,
  initialTime = 0,
  isPlaying = false,
  className = '',
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isHost } = useRoom();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      if (onTimeUpdate && video) {
        onTimeUpdate(video.currentTime);
      }
    };

    const handlePlay = () => {
      if (onPlay) onPlay();
    };

    const handlePause = () => {
      if (onPause) onPause();
    };

    const handleSeeked = () => {
      if (onSeek && video) {
        onSeek(video.currentTime);
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('seeked', handleSeeked);
    video.addEventListener('waiting', () => setIsLoading(true));
    video.addEventListener('playing', () => setIsLoading(false));
    video.addEventListener('error', () => {
      setError('Failed to load video');
      setIsLoading(false);
    });

    // Set initial time
    if (initialTime > 0) {
      video.currentTime = initialTime;
    }

    // Set initial play/pause state
    if (isPlaying) {
      video.play().catch(err => {
        console.error('Error playing video:', err);
        setError('Error playing video');
      });
    } else {
      video.pause();
    }

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('seeked', handleSeeked);
      video.removeEventListener('waiting', () => setIsLoading(true));
      video.removeEventListener('playing', () => setIsLoading(false));
      video.removeEventListener('error', () => setError('Failed to load video'));
    };
  }, [videoId, initialTime, isPlaying, onTimeUpdate, onPlay, onPause, onSeek]);

  if (!videoId) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
        bgcolor="background.paper"
        className={className}
      >
        <Typography variant="h6" color="textSecondary">
          Select a video to start watching
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
        bgcolor="background.paper"
        className={className}
      >
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  const videoUrl = `https://www.youtube.com/embed/${videoId}?enablejsapi=1&origin=${window.location.origin}`;

  return (
    <Box position="relative" className={className}>
      <Box
        component="iframe"
        ref={videoRef as any}
        src={videoUrl}
        width="100%"
        height="500"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        sx={{
          aspectRatio: '16/9',
          bgcolor: 'background.paper',
        }}
      />
      
      {isLoading && (
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          display="flex"
          justifyContent="center"
          alignItems="center"
          bgcolor="rgba(0, 0, 0, 0.5)"
        >
          <CircularProgress color="primary" />
        </Box>
      )}
      
      {!isHost && (
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bgcolor="rgba(0, 0, 0, 0.3)"
          display="flex"
          justifyContent="center"
          alignItems="center"
          sx={{ pointerEvents: 'none' }}
        >
          <Typography 
            variant="h6" 
            color="white" 
            bgcolor="rgba(0, 0, 0, 0.7)" 
            p={2} 
            borderRadius={1}
          >
            Only the host can control playback
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default VideoPlayer;
