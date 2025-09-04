'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  CircularProgress,
  useTheme,
  Paper
} from '@mui/material';
import { Search as SearchIcon, PlayArrow as PlayIcon } from '@mui/icons-material';
import { useRoom } from '../app/context/RoomContext';

interface Video {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  channel: string;
  views: string;
}

// Mock data - in a real app, this would come from an API
const MOCK_VIDEOS: Video[] = [
  {
    id: 'dQw4w9WgXcQ',
    title: 'Never Gonna Give You Up',
    thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
    duration: '3:33',
    channel: 'Rick Astley',
    views: '1.2B views'
  },
  {
    id: 'JGwWNGJdvx8',
    title: 'Shape of You',
    thumbnail: 'https://img.youtube.com/vi/JGwWNGJdvx8/mqdefault.jpg',
    duration: '3:53',
    channel: 'Ed Sheeran',
    views: '5.7B views'
  },
  {
    id: 'kJQP7kiw5Fk',
    title: 'Despacito',
    thumbnail: 'https://img.youtube.com/vi/kJQP7kiw5Fk/mqdefault.jpg',
    duration: '4:41',
    channel: 'Luis Fonsi',
    views: '7.8B views'
  },
  {
    id: 'RgKAFK5djSk',
    title: 'See You Again',
    thumbnail: 'https://img.youtube.com/vi/RgKAFK5djSk/mqdefault.jpg',
    duration: '3:49',
    channel: 'Wiz Khalifa',
    views: '5.9B views'
  },
  {
    id: '9bZkp7q19f0',
    title: 'Gangnam Style',
    thumbnail: 'https://img.youtube.com/vi/9bZkp7q19f0/mqdefault.jpg',
    duration: '4:13',
    channel: 'PSY',
    views: '4.5B views'
  },
  {
    id: 'JGwWNGJdvx8',
    title: 'Perfect',
    thumbnail: 'https://img.youtube.com/vi/2Vv-BfVoq4g/mqdefault.jpg',
    duration: '4:23',
    channel: 'Ed Sheeran',
    views: '3.5B views'
  }
];

interface VideoLibraryProps {
  onVideoSelect?: (videoId: string) => void;
  currentVideoId?: string;
}

export const VideoLibrary: React.FC<VideoLibraryProps> = ({
  onVideoSelect,
  currentVideoId,
}) => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { isHost } = useRoom();
  const theme = useTheme();

  useEffect(() => {
    // Simulate API call
    const fetchVideos = async () => {
      setIsLoading(true);
      try {
        // In a real app, you would fetch videos from your API
        // const response = await fetch(`/api/videos?q=${searchQuery}`);
        // const data = await response.json();
        // setVideos(data);
        
        // For now, filter the mock data
        const filtered = MOCK_VIDEOS.filter(video =>
          video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          video.channel.toLowerCase().includes(searchQuery.toLowerCase())
        );
        
        setVideos(filtered);
      } catch (error) {
        console.error('Error fetching videos:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchVideos();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleVideoSelect = (videoId: string) => {
    if (onVideoSelect) {
      onVideoSelect(videoId);
    }
  };

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 2, 
        height: '100%',
        bgcolor: theme.palette.background.paper,
        borderRadius: 2
      }}
    >
      <Box mb={3}>
        <Typography variant="h6" gutterBottom>
          Video Library
        </Typography>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search videos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            sx: {
              bgcolor: theme.palette.background.default,
              borderRadius: 2,
              '& .MuiOutlinedInput-notchedOutline': {
                border: 'none',
              },
            },
          }}
        />
      </Box>

      {isLoading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ overflowY: 'auto', maxHeight: 'calc(100vh - 250px)' }}>
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(1, 1fr)',
            gap: 2,
            p: 2
          }}>
            {videos.map((video) => (
              <Box key={video.id}>
                <Card 
                  onClick={() => handleVideoSelect(video.id)}
                  sx={{
                    display: 'flex',
                    cursor: isHost ? 'pointer' : 'default',
                    opacity: currentVideoId === video.id ? 0.7 : 1,
                    border: currentVideoId === video.id 
                      ? `2px solid ${theme.palette.primary.main}` 
                      : 'none',
                    transition: 'all 0.2s',
                    '&:hover': {
                      transform: isHost ? 'translateY(-4px)' : 'none',
                      boxShadow: isHost ? theme.shadows[4] : 'none',
                    },
                  }}
                >
                  <Box position="relative" width={160} flexShrink={0}>
                    <CardMedia
                      component="img"
                      height="90"
                      image={video.thumbnail}
                      alt={video.title}
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                    <Box
                      position="absolute"
                      bottom={4}
                      right={4}
                      bgcolor="rgba(0,0,0,0.8)"
                      color="white"
                      px={0.5}
                      borderRadius={1}
                      fontSize="0.7rem"
                    >
                      {video.duration}
                    </Box>
                    {currentVideoId === video.id && (
                      <Box
                        position="absolute"
                        top={0}
                        left={0}
                        right={0}
                        bottom={0}
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        bgcolor="rgba(0,0,0,0.5)"
                      >
                        <PlayIcon sx={{ color: 'white', fontSize: 40 }} />
                      </Box>
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', p: 1.5 }}>
                    <Typography 
                      variant="subtitle2" 
                      component="div"
                      sx={{
                        fontWeight: 500,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {video.title}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      color="text.secondary"
                      sx={{
                        mt: 0.5,
                        display: '-webkit-box',
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {video.channel}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {video.views}
                    </Typography>
                  </Box>
                </Card>
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Paper>
  );
};

export default VideoLibrary;
