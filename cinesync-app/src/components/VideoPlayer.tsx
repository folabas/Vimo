import React, { useRef, useState } from 'react';
import styled from '@emotion/styled';
import { theme } from '../styles/theme';

interface VideoPlayerProps {
  src: string;
  onTimeUpdate?: (currentTime: number) => void;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  initialTime?: number;
  isPlaying?: boolean;
  subtitlesEnabled?: boolean;
  subtitlesUrl?: string;
}

const PlayerContainer = styled.div`
  position: relative;
  width: 100%;
  background-color: #000;
  border-radius: ${theme.borderRadius.md};
  overflow: hidden;
`;

const Video = styled.video`
  width: 100%;
  height: auto;
  display: block;
`;

const Controls = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
  padding: ${theme.spacing.md};
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
  opacity: 0;
  transition: opacity ${theme.transitions.fast};
  
  ${PlayerContainer}:hover & {
    opacity: 1;
  }
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 4px;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  cursor: pointer;
  position: relative;
`;

const Progress = styled.div<{ width: string }>`
  height: 100%;
  background-color: ${theme.colors.primary};
  border-radius: 2px;
  width: ${props => props.width};
`;

const ControlButtons = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: ${theme.spacing.xs};
`;

const LeftControls = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

const RightControls = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

const ControlButton = styled.button`
  background: none;
  border: none;
  color: ${theme.colors.text};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  transition: background-color ${theme.transitions.fast};
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

const TimeDisplay = styled.div`
  color: ${theme.colors.text};
  font-size: ${theme.typography.sizes.sm};
  margin-left: ${theme.spacing.sm};
`;

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  onTimeUpdate,
  onPlay,
  onPause,
  onEnded,
  initialTime = 0,
  isPlaying = false,
  subtitlesEnabled = false,
  subtitlesUrl,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Handle external play/pause control
  React.useEffect(() => {
    if (videoRef.current) {
      if (isPlaying && !isVideoPlaying) {
        videoRef.current.play().catch(err => console.error('Play error:', err));
      } else if (!isPlaying && isVideoPlaying) {
        videoRef.current.pause();
      }
    }
  }, [isPlaying, isVideoPlaying]);
  
  // Set initial time if provided
  React.useEffect(() => {
    if (videoRef.current && initialTime > 0) {
      videoRef.current.currentTime = initialTime;
    }
  }, [initialTime]);
  
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      if (initialTime > 0) {
        videoRef.current.currentTime = initialTime;
      }
    }
  };
  
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const time = videoRef.current.currentTime;
      setCurrentTime(time);
      if (onTimeUpdate) {
        onTimeUpdate(time);
      }
    }
  };
  
  const handlePlay = () => {
    setIsVideoPlaying(true);
    if (onPlay) {
      onPlay();
    }
  };
  
  const handlePause = () => {
    setIsVideoPlaying(false);
    if (onPause) {
      onPause();
    }
  };
  
  const handleEnded = () => {
    setIsVideoPlaying(false);
    if (onEnded) {
      onEnded();
    }
  };
  
  const togglePlay = () => {
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(err => console.error('Play error:', err));
      }
    }
  };
  
  const toggleMute = () => {
    if (videoRef.current) {
      const newMutedState = !isMuted;
      videoRef.current.muted = newMutedState;
      setIsMuted(newMutedState);
    }
  };
  
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };
  
  const toggleFullscreen = () => {
    const container = document.documentElement;
    
    if (!document.fullscreenElement) {
      container.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };
  
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (progressRef.current && videoRef.current) {
      const rect = progressRef.current.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      videoRef.current.currentTime = pos * duration;
    }
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  return (
    <PlayerContainer>
      <Video
        ref={videoRef}
        src={src}
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onPlay={handlePlay}
        onPause={handlePause}
        onEnded={handleEnded}
        onClick={togglePlay}
      >
        {subtitlesEnabled && subtitlesUrl && (
          <track 
            kind="subtitles" 
            src={subtitlesUrl} 
            label="English" 
            srcLang="en" 
            default 
          />
        )}
      </Video>
      
      <Controls>
        <ProgressBar 
          ref={progressRef}
          onClick={handleProgressClick}
        >
          <Progress width={`${(currentTime / duration) * 100}%`} />
        </ProgressBar>
        
        <ControlButtons>
          <LeftControls>
            <ControlButton onClick={togglePlay}>
              {isVideoPlaying ? (
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="6" y="4" width="4" height="16" rx="1" fill="currentColor" />
                  <rect x="14" y="4" width="4" height="16" rx="1" fill="currentColor" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 4L18 12L6 20V4Z" fill="currentColor" />
                </svg>
              )}
            </ControlButton>
            
            <ControlButton onClick={toggleMute}>
              {isMuted ? (
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11 5L6 9H2V15H6L11 19V5Z" fill="currentColor" />
                  <path d="M23 9L17 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M17 9L23 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11 5L6 9H2V15H6L11 19V5Z" fill="currentColor" />
                  <path d="M15.54 8.46C16.4774 9.39764 17.0039 10.6692 17.0039 11.995C17.0039 13.3208 16.4774 14.5924 15.54 15.53" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M19.07 5.93C20.9447 7.80528 21.9979 10.3447 21.9979 13C21.9979 15.6553 20.9447 18.1947 19.07 20.07" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </ControlButton>
            
            <TimeDisplay>
              {formatTime(currentTime)} / {formatTime(duration)}
            </TimeDisplay>
          </LeftControls>
          
          <RightControls>
            <ControlButton onClick={toggleFullscreen}>
              {isFullscreen ? (
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 3V5H4V9H2V3H8Z" fill="currentColor" />
                  <path d="M16 3H22V9H20V5H16V3Z" fill="currentColor" />
                  <path d="M22 15V21H16V19H20V15H22Z" fill="currentColor" />
                  <path d="M8 21H2V15H4V19H8V21Z" fill="currentColor" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 8V2H9V4H5V8H3Z" fill="currentColor" />
                  <path d="M15 2H21V8H19V4H15V2Z" fill="currentColor" />
                  <path d="M21 16V22H15V20H19V16H21Z" fill="currentColor" />
                  <path d="M9 22H3V16H5V20H9V22Z" fill="currentColor" />
                </svg>
              )}
            </ControlButton>
          </RightControls>
        </ControlButtons>
      </Controls>
    </PlayerContainer>
  );
};

export default VideoPlayer;
