'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  Box, 
  Container, 
  Grid, 
  Typography, 
  IconButton,
  Tooltip,
  useTheme,
  CircularProgress,
  Paper,
  Divider,
  Button
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon, 
  ExitToApp as LeaveIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Fullscreen as FullscreenIcon,
  VolumeUp as VolumeUpIcon,
  VolumeOff as VolumeOffIcon,
  Share as ShareIcon,
  Chat as ChatIcon,
  People as PeopleIcon
} from '@mui/icons-material';
import { useRoom } from '../../context/RoomContext';
import { useAuth } from '../../context/AuthContext';
import { updateRoomVideo } from '../../../lib/services/roomService';
import VideoPlayer from '../../../components/VideoPlayer';
import ParticipantsList from '../../../components/ParticipantsList';
import VideoLibrary from '../../../components/VideoLibrary';

const RoomPage = () => {
  const router = useRouter();
  const params = useParams();
  const roomId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const { currentRoom, isHost, joinRoom, leaveRoom, playVideo, pauseVideo } = useRoom();
  const { user } = useAuth();
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showParticipants, setShowParticipants] = useState(true);
  const [showVideoLibrary, setShowVideoLibrary] = useState(false);
  const [currentVideoId, setCurrentVideoId] = useState<string>('');
  const theme = useTheme();

  // Join room on component mount
  useEffect(() => {
    if (roomId && user) {
      joinRoom(roomId);
    }
    
    return () => {
      if (roomId) {
        leaveRoom();
      }
    };
  }, [roomId, user, joinRoom, leaveRoom]);

  // Update current video when room data changes
  useEffect(() => {
    if (currentRoom?.currentVideo) {
      setCurrentVideoId(currentRoom.currentVideo);
    }
  }, [currentRoom?.currentVideo]);

  const handleLeaveRoom = () => {
    leaveRoom();
    router.push('/dashboard');
  };

  const handlePlayPause = () => {
    if (!currentRoom) return;
    
    if (currentRoom.isPlaying) {
      pauseVideo();
    } else {
      playVideo();
    }
  };

  const handleVideoSelect = async (videoId: string) => {
    if (!isHost || !roomId) return;
    try {
      await updateRoomVideo(roomId, videoId);
      setCurrentVideoId(videoId);
    } catch (error) {
      console.error('Failed to update room video:', error);
      // Show error to user
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(console.log);
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(console.log);
        setIsFullscreen(false);
      }
    }
  };

  const copyRoomLink = () => {
    const roomUrl = `${window.location.origin}/room/${roomId}`;
    navigator.clipboard.writeText(roomUrl).then(() => {
      // Show a toast or notification
      alert('Room link copied to clipboard!');
    });
  };

  if (!currentRoom) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
        bgcolor={theme.palette.background.default}
      >
        <Box textAlign="center">
          <CircularProgress size={60} thickness={4} />
          <Typography variant="h6" mt={2}>
            Joining room...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        bgcolor: theme.palette.background.default,
        pb: 4
      }}
    >
      {/* Header */}
      <Paper 
        elevation={2} 
        sx={{ 
          p: 2, 
          mb: 2,
          borderRadius: 0,
          bgcolor: theme.palette.background.paper,
          position: 'sticky',
          top: 0,
          zIndex: 10,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Box display="flex" alignItems="center">
          <IconButton onClick={() => router.push('/dashboard')} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" noWrap>
            {currentRoom.name || 'Watch Room'}
          </Typography>
          {isHost && (
            <Typography 
              variant="caption" 
              sx={{ 
                ml: 1, 
                bgcolor: theme.palette.primary.main, 
                color: 'white',
                px: 1,
                py: 0.5,
                borderRadius: 1,
                fontSize: '0.7rem',
                fontWeight: 'bold'
              }}
            >
              HOST
            </Typography>
          )}
        </Box>
        
        <Box>
          <Tooltip title="Copy room link">
            <IconButton onClick={copyRoomLink}>
              <ShareIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Toggle participants">
            <IconButton 
              onClick={() => setShowParticipants(!showParticipants)}
              color={showParticipants ? 'primary' : 'default'}
            >
              <PeopleIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Toggle video library">
            <IconButton 
              onClick={() => setShowVideoLibrary(!showVideoLibrary)}
              color={showVideoLibrary ? 'primary' : 'default'}
            >
              <PlayIcon />
            </IconButton>
          </Tooltip>
          
          <Button
            variant="outlined"
            color="error"
            size="small"
            startIcon={<LeaveIcon />}
            onClick={handleLeaveRoom}
            sx={{ ml: 1 }}
          >
            Leave Room
          </Button>
        </Box>
      </Paper>

      <Container maxWidth="xl">
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md: showParticipants || showVideoLibrary ? '2fr 1fr' : '1fr'
          },
          gap: 2,
          width: '100%'
        }}>
          {/* Main Video Area */}
          <Box>
            <Box 
              sx={{ 
                borderRadius: 2,
                overflow: 'hidden',
                boxShadow: 3,
                position: 'relative',
                bgcolor: theme.palette.background.paper,
                aspectRatio: '16/9'
              }}
            >
              <VideoPlayer 
                videoId={currentVideoId}
                isPlaying={currentRoom?.isPlaying || false}
                initialTime={currentRoom?.currentTime || 0}
                className="video-player"
              />
              
              {/* Video Controls Overlay */}
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  p: 2,
                  background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: 2
                }}
              >
                <Tooltip title={currentRoom?.isPlaying ? 'Pause' : 'Play'}>
                  <IconButton 
                    onClick={handlePlayPause}
                    sx={{
                      bgcolor: 'rgba(0,0,0,0.7)',
                      color: 'white',
                      '&:hover': {
                        bgcolor: 'rgba(0,0,0,0.9)',
                      },
                      width: 48,
                      height: 48
                    }}
                    disabled={!isHost}
                  >
                    {currentRoom?.isPlaying ? <PauseIcon /> : <PlayIcon />}
                  </IconButton>
                </Tooltip>
                
                <Tooltip title={isMuted ? 'Unmute' : 'Mute'}>
                  <IconButton 
                    onClick={toggleMute}
                    sx={{
                      color: 'white',
                      '&:hover': {
                        bgcolor: 'rgba(255,255,255,0.1)',
                      },
                    }}
                  >
                    {isMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
                  </IconButton>
                </Tooltip>
                
                <Tooltip title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}>
                  <IconButton 
                    onClick={toggleFullscreen}
                    sx={{
                      color: 'white',
                      '&:hover': {
                        bgcolor: 'rgba(255,255,255,0.1)',
                      },
                    }}
                  >
                    <FullscreenIcon />
                  </IconButton>
                </Tooltip>
                
                {isHost && (
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: 'white',
                      ml: 'auto',
                      bgcolor: 'rgba(0,0,0,0.5)',
                      px: 1,
                      py: 0.5,
                      borderRadius: 1
                    }}
                  >
                    Only you can control playback
                  </Typography>
                )}
              </Box>
            </Box>
            
            {/* Room Info */}
            <Box mt={2} p={2} bgcolor={theme.palette.background.paper} borderRadius={2} boxShadow={1}>
              <Typography variant="h6" gutterBottom>
                {currentRoom.name || 'Watch Party'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Hosted by {currentRoom.hostId === user?.id ? 'You' : 'User'}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle2" gutterBottom>
                Now Playing:
              </Typography>
              {currentVideoId ? (
                <Box display="flex" alignItems="center" mt={1}>
                  <Box 
                    component="img" 
                    src={`https://img.youtube.com/vi/${currentVideoId}/mqdefault.jpg`} 
                    alt="Video thumbnail"
                    sx={{ 
                      width: 120, 
                      height: 68, 
                      borderRadius: 1,
                      mr: 2
                    }}
                  />
                  <Box>
                    <Typography variant="subtitle1">
                      {currentVideoId === 'dQw4w9WgXcQ' ? 'Never Gonna Give You Up' : 'Video Title'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {currentRoom.isPlaying ? 'Playing' : 'Paused'}
                    </Typography>
                  </Box>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No video selected
                </Typography>
              )}
            </Box>
          </Box>
          
          {/* Sidebar */}
          {(showParticipants || showVideoLibrary) && (
            <Box>
              {showParticipants && (
                <Box mb={2}>
                  <ParticipantsList />
                </Box>
              )}
              
              {showVideoLibrary && (
                <VideoLibrary 
                  onVideoSelect={handleVideoSelect}
                  currentVideoId={currentVideoId}
                />
              )}
            </Box>
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default RoomPage;
