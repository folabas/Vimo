import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import Logo from '../components/Logo';
import Button from '../components/Button';
import VideoPlayer from '../components/VideoPlayer';
import VideoLibrary from '../components/VideoLibrary';
import { theme } from '../styles/theme';
import { useRoom } from '../context/RoomContext';
import { useWatchRoomSocket } from '../hooks/useWatchRoomSocket';
import { RoomState, Message } from '../types/room';
import { socketService } from '../services/api/socketService';

interface Props {}

const PageContainer = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const Header = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  background-color: rgba(0, 0, 0, 0.3);
`;

const RoomInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
`;

const RoomCode = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  background-color: ${theme.colors.backgroundLight};
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.sizes.sm};
`;

const CopyButton = styled.button`
  background: none;
  border: none;
  color: ${theme.colors.primary};
  cursor: pointer;
  font-size: ${theme.typography.sizes.sm};
  display: flex;
  align-items: center;
  padding: ${theme.spacing.xs};
  border-radius: ${theme.borderRadius.sm};
  transition: background-color ${theme.transitions.fast};
  
  &:hover {
    background-color: rgba(231, 76, 60, 0.1);
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const LeaveButton = styled(Button)`
  margin-left: ${theme.spacing.md};
`;

const MainContent = styled.div<{ isChatOpen: boolean }>`
  flex: 1;
  display: flex;
  margin-top: ${theme.spacing['3xl']}; /* Adjust for fixed header height */

  ${({ isChatOpen }) =>
    isChatOpen
      ? `
      flex-direction: row;
      overflow: hidden;
    `
      : `
      flex-direction: column;
      overflow-y: auto;
    `}
`;

const VideoSection = styled.div<{ isChatOpen: boolean }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: ${theme.spacing['2xl']} ${theme.spacing.xl} ${theme.spacing.xl}; /* Increased top padding */
  overflow-y: ${({ isChatOpen }) => (isChatOpen ? 'auto' : 'hidden')};
  ${({ isChatOpen }) =>
    !isChatOpen &&
    `
    align-items: center;
    justify-content: center;
  `}
  &::-webkit-scrollbar {
    display: none; /* Hide vertical scroll indicator */
  }
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
`;

const VideoContainer = styled.div<{ isChatOpen: boolean }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  ${({ isChatOpen }) =>
    !isChatOpen &&
    `
    width: 100%;
    height: 100%;
    max-width: none;
    max-height: none;
  `}
  &::-webkit-scrollbar {
    display: none; /* Hide vertical scroll indicator */
  }
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
`;

const MovieTitle = styled.h1`
  font-size: ${theme.typography.sizes['2xl']};
  margin-bottom: ${theme.spacing.md};
`;

const ChatSection = styled.div<{ isOpen: boolean }>`
  width: ${props => props.isOpen ? '320px' : '0'};
  background-color: ${theme.colors.backgroundLight};
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  overflow: hidden;
  
  @media (max-width: 1024px) {
    width: 100%;
    height: ${props => props.isOpen ? '300px' : '0'};
    transition: height 0.3s ease;
  }
`;

const ChatHeader = styled.div`
  padding: ${theme.spacing.md};
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  font-weight: 600;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ChatMessages = styled.div`
  flex: 1;
  padding: ${theme.spacing.md};
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
`;

const ChatMessage = styled.div`
  display: flex;
  flex-direction: column;
`;

const MessageSender = styled.span`
  font-weight: 600;
  font-size: ${theme.typography.sizes.sm};
  color: ${theme.colors.primary};
`;

const MessageContent = styled.span`
  font-size: ${theme.typography.sizes.sm};
  word-break: break-word;
`;

const ChatInputContainer = styled.form`
  display: flex;
  padding: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.md};
  gap: ${theme.spacing.sm};
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const ChatInput = styled.input`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.2);
  border: none;
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  color: ${theme.colors.text};
  font-size: ${theme.typography.sizes.sm};
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(231, 76, 60, 0.3);
  }
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
`;

const SendButton = styled.button`
  background-color: ${theme.colors.primary};
  color: ${theme.colors.text};
  border: none;
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.sm};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color ${theme.transitions.fast};
  
  &:hover {
    background-color: #c0392b;
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const ChatToggleButton = styled.button<{ isOpen: boolean }>`
  position: fixed;
  bottom: 20px;
  right: ${props => props.isOpen ? '340px' : '20px'};
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: ${theme.colors.primary};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  transition: right 0.3s ease;
  z-index: 100;
  
  @media (max-width: 1024px) {
    right: 20px;
    bottom: ${props => props.isOpen ? '320px' : '20px'};
    transition: bottom 0.3s ease;
  }
  
  &:hover {
    background-color: ${theme.colors.secondary};
  }
  
  svg {
    width: 24px;
    height: 24px;
  }
`;

const WaitingOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const CloseButton = styled.button`
  position: absolute;
  top: ${theme.spacing.xl};
  right: ${theme.spacing.xl};
  background: none;
  border: none;
  color: ${theme.colors.textSecondary};
  font-size: ${theme.typography.sizes['2xl']};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  transition: all 0.2s ease;
  
  &:hover {
    color: ${theme.colors.text};
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const LoadingSpinner = styled.div`
  width: 50px;
  height: 50px;
  border: 3px solid rgba(231, 76, 60, 0.3);
  border-radius: 50%;
  border-top-color: ${theme.colors.primary};
  animation: spin 1s linear infinite;
  margin-bottom: ${theme.spacing.xl};
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const WaitingTitle = styled.h2`
  font-size: ${theme.typography.sizes['3xl']};
  margin-bottom: ${theme.spacing.lg};
`;

const WaitingText = styled.p`
  font-size: ${theme.typography.sizes.lg};
  color: ${theme.colors.textSecondary};
  margin-bottom: ${theme.spacing.xl};
`;

const ShareSection = styled.div`
  margin-top: ${theme.spacing.xl};
`;

const ShareTitle = styled.h3`
  font-size: ${theme.typography.sizes.lg};
  margin-bottom: ${theme.spacing.md};
`;

const RoomCodeDisplay = styled.div`
  font-size: ${theme.typography.sizes['2xl']};
  font-weight: 700;
  letter-spacing: 2px;
  margin-bottom: ${theme.spacing.md};
`;

const TimerContainer = styled.div`
  margin-top: ${theme.spacing.md};
  font-size: ${theme.typography.sizes.md};
  color: ${theme.colors.textSecondary};
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing.xl};
`;

const ErrorMessage = styled.div`
  text-align: center;
`;

const EmptyStateContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing.xl};
`;

const EmptyStateMessage = styled.div`
  text-align: center;
`;

const WatchRoom: React.FC<Props> = () => {
  const { roomCode } = useParams<{ roomCode: string }>();
  const navigate = useNavigate();
  
  // UI state
  const [isChatOpen, setIsChatOpen] = useState(true); // Chat is always open
  const [showVideoLibrary, setShowVideoLibrary] = useState(false);
  const [localCurrentTime, setLocalCurrentTime] = useState(0);
  const [waitingTimeLeft, setWaitingTimeLeft] = useState(3600); // Default 1 hour in seconds
  const [chatInput, setChatInput] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  
  // Refs
  const lastSeekRef = useRef<number | null>(null);
  const prevSourceKeyRef = useRef('');
  const localVideoSourceRef = useRef('');

  // Initialize the watch room socket with the initial room state
  const {
    roomState,
    messages,
    isWaitingForParticipants,
    showWaitingOverlay,
    isHost,
    isPlaying,
    currentTime,
    emitPlay,
    emitPause,
    emitTimeUpdate,
    emitSeek,
    emitToggleSubtitles,
    emitChatMessage,
    leaveRoom,
    setShowWaitingOverlay,
    setCurrentTime,
    setIsPlaying,
    setRoomState,
  } = useWatchRoomSocket({
    roomCode: roomCode || '',
    initialRoomState: {
      roomCode: roomCode || '',
      isHost: false,
      participants: [],
      selectedMovie: null,
      isPlaying: false,
      currentTime: 0,
      subtitlesEnabled: false,
    }
  });

  // Debug logging for room state and video source
  useEffect(() => {
    console.log('Room state updated:', {
      hasMovie: !!roomState.selectedMovie,
      source: roomState.selectedMovie?.source,
      sourceValid: roomState.selectedMovie?.source?.trim() !== '',
      title: roomState.selectedMovie?.title
    });
    
    // Check if the video source is a valid URL
    if (roomState.selectedMovie?.source) {
      try {
        const url = new URL(roomState.selectedMovie.source);
        console.log('Video source is a valid URL:', url.href);
        
        // Make a HEAD request to check if the video is accessible
        fetch(url.href, { method: 'HEAD' })
          .then(response => {
            console.log('Video source response:', {
              status: response.status,
              ok: response.ok,
              contentType: response.headers.get('content-type')
            });
          })
          .catch(error => {
            console.error('Error checking video source:', error);
          });
      } catch (error) {
        console.error('Invalid video source URL:', roomState.selectedMovie.source);
      }
    }
  }, [roomState.selectedMovie]);

  // Helper function to format time in MM:SS format
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Handle toggling subtitles
  const handleToggleSubtitles = () => {
    console.log('Toggling subtitles');
    emitToggleSubtitles();
  };

  // UI handlers
  const handlePlay = useCallback(() => {
    console.log('Video played');
    emitPlay(roomState.currentTime);
    setIsPlaying(true);
  }, [emitPlay, roomState.currentTime, setIsPlaying]);

  const handlePause = useCallback(() => {
    console.log('Video paused');
    emitPause(roomState.currentTime);
    setIsPlaying(false);
  }, [emitPause, roomState.currentTime, setIsPlaying]);

  const handleTimeUpdate = useCallback((time: number) => {
    setLocalCurrentTime(time);

    // Only emit time updates if the difference is significant
    // This reduces unnecessary socket events
    if (Math.abs(time - roomState.currentTime) > 2) {
      console.log(`Emitting time update: ${time}`);
      setCurrentTime(time);
      emitTimeUpdate(time);
    }
  }, [emitTimeUpdate, roomState.currentTime, setCurrentTime]);

  const handleSeek = (time: number) => {
    console.log(`Seek to ${time}`);

    // Prevent duplicate seek events
    if (lastSeekRef.current !== null && Math.abs(lastSeekRef.current - time) < 0.5) {
      return;
    }

    lastSeekRef.current = time;
    setLocalCurrentTime(time);
    setCurrentTime(time);
    emitSeek(time);

    // Reset the seek ref after a short delay
    setTimeout(() => {
      lastSeekRef.current = null;
    }, 500);
  };

  const handleSendMessage = (content: string) => {
    if (!content.trim()) return;

    console.log('Sending message:', content); // Debug log

    // Send the message to the server
    emitChatMessage(content);

    // Clear the input field
    setChatInput('');
  };

  // Debug log to check if messages are being updated
  useEffect(() => {
    console.log('Messages updated:', messages);
  }, [messages]);

  const handleCopyRoomCode = () => {
    if (roomCode) {
      navigator.clipboard.writeText(roomCode);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  // Handle room reload
  const handleReloadRoom = useCallback(() => {
    console.log('Reloading room...');
    // Re-join the room to refresh the state
    if (roomCode) {
      leaveRoom();
      setTimeout(() => {
        // We'll use the hook's functionality to rejoin
        window.location.reload();
      }, 500);
    }
  }, [roomCode, leaveRoom]);

  // Initialize the waiting time from the room state if available
  useEffect(() => {
    if (roomState.expiresAt) {
      const now = new Date().getTime();
      const expiresAt = new Date(roomState.expiresAt).getTime();
      const timeLeftInSeconds = Math.max(0, Math.floor((expiresAt - now) / 1000));
      setWaitingTimeLeft(timeLeftInSeconds);
    } else {
      // Default to 1 hour if no expiration time is set
      setWaitingTimeLeft(3600);
    }
  }, [roomState.expiresAt]);

  // Timer for room expiration countdown
  useEffect(() => {
    if (!showWaitingOverlay) return;
    
    const timer = setInterval(() => {
      setWaitingTimeLeft(prev => {
        if (prev <= 0) return 0;
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [showWaitingOverlay]);

  // Memoize the video player to avoid unnecessary re-renders
  const memoizedVideoPlayer = useMemo(() => {
    let sourceToUse = '';
    
    if (roomState.selectedMovie && roomState.selectedMovie.source && roomState.selectedMovie.source.trim() !== '') {
      sourceToUse = roomState.selectedMovie.source;
      
      if (localVideoSourceRef.current !== sourceToUse) {
        localVideoSourceRef.current = sourceToUse;
      }
    } 
    else if (localVideoSourceRef.current && localVideoSourceRef.current.trim() !== '') {
      sourceToUse = localVideoSourceRef.current;
      
      if (roomState.selectedMovie) {
        setRoomState(prev => ({
          ...prev,
          selectedMovie: prev.selectedMovie ? {
            ...prev.selectedMovie,
            source: localVideoSourceRef.current
          } : null
        }));
      }
    }
    
    const hasValidMovie = sourceToUse !== '';
    
    if (!hasValidMovie) {
      if (roomState.selectedMovie) {
        return (
          <ErrorContainer>
            <ErrorMessage>
              <h3>Video Source Error</h3>
              <p>The selected video doesn't have a valid source URL.</p>
              <p>Debug info: Movie ID: {roomState.selectedMovie.id}, Title: {roomState.selectedMovie.title}</p>
              <p>Try selecting a different video or check if the video file still exists on the server.</p>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
                <Button onClick={handleReloadRoom}>Reload Room</Button>
                <Button onClick={() => setShowVideoLibrary(true)}>Select Another Video</Button>
              </div>
            </ErrorMessage>
          </ErrorContainer>
        );
      } else {
        return (
          <EmptyStateContainer>
            <EmptyStateMessage>
              <h3>No Video Selected</h3>
              <p>The host hasn't selected a video to watch yet.</p>
              {roomState.isHost && (
                <Button onClick={() => setShowVideoLibrary(true)}>
                  Select a Video
                </Button>
              )}
            </EmptyStateMessage>
          </EmptyStateContainer>
        );
      }
    }
    
    return (
      <VideoPlayer
        src={sourceToUse}
        isPlaying={roomState.isPlaying}
        initialTime={roomState.currentTime}
        onPlay={handlePlay}
        onPause={handlePause}
        onTimeUpdate={handleTimeUpdate}
        subtitlesEnabled={roomState.subtitlesEnabled}
      />
    );
  }, [
    roomState.selectedMovie,
    roomState.isPlaying,
    roomState.currentTime,
    roomState.subtitlesEnabled,
    roomState.isHost,
    handlePlay,
    handlePause,
    handleTimeUpdate,
    handleReloadRoom,
    setRoomState
  ]);

  return (
    <PageContainer>
      <Header>
        <Logo size="small" />
        <RoomInfo>
          <RoomCode>
            Room: {roomCode}
            <CopyButton onClick={handleCopyRoomCode}>
              {isCopied ? 'Copied!' : (
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 4V16C8 16.5304 8.21071 17.0391 8.58579 17.4142C8.96086 17.7893 9.46957 18 10 18H18C18.5304 18 19.0391 17.7893 19.4142 17.4142C19.7893 17.0391 20 16.5304 20 16V7.242C20 6.97556 19.9467 6.71181 19.8433 6.46624C19.7399 6.22068 19.5885 5.99824 19.398 5.812L16.188 2.602C16.0018 2.41148 15.7793 2.26012 15.5338 2.15673C15.2882 2.05334 15.0244 2.00001 14.758 2H10C9.46957 2 8.96086 2.21071 8.58579 2.58579C8.21071 2.96086 8 3.46957 8 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16 18V20C16 20.5304 15.7893 21.0391 15.4142 21.4142C15.0391 21.7893 14.5304 22 14 22H6C5.46957 22 4.96086 21.7893 4.58579 21.4142C4.21071 21.0391 4 20.5304 4 20V8C4 7.46957 4.21071 6.96086 4.58579 6.58579C4.96086 6.21071 5.46957 6 6 6H10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </CopyButton>
          </RoomCode>
          <LeaveButton 
            variant="outline" 
            size="small"
            onClick={() => {
              leaveRoom();
              navigate('/');
            }}
          >
            Leave Room
          </LeaveButton>
        </RoomInfo>
      </Header>
      
      <MainContent isChatOpen={true}> {/* Force chat to always be open */}
        <VideoSection isChatOpen={true}>
          <VideoContainer isChatOpen={true}>
            {memoizedVideoPlayer}
            {roomState.selectedMovie && (
              <MovieTitle>{roomState.selectedMovie.title}</MovieTitle>
            )}
            <div className="flex items-center justify-center gap-2">
              <button
                className="flex items-center justify-center gap-1 rounded-md bg-primary px-3 py-1 text-sm text-white"
                onClick={handleToggleSubtitles}
              >
                <span className="h-4 w-4">CC</span>
                {roomState.subtitlesEnabled ? 'Disable' : 'Enable'} Subtitles
              </button>
            </div>
          </VideoContainer>
        </VideoSection>
        
        <ChatSection isOpen={true}> {/* Chat is always open */}
          <ChatHeader>
            Chat
            {/* Commenting out the toggle button */}
            {/* <button onClick={() => setIsChatOpen(prev => !prev)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button> */}
          </ChatHeader>
          <ChatMessages>
            {messages.map((message) => (
              <ChatMessage key={message.id}>
                <MessageSender>{message.sender}</MessageSender>
                <MessageContent>{message.content}</MessageContent>
              </ChatMessage>
            ))}
          </ChatMessages>
          <ChatInputContainer
            onSubmit={(e) => {
              e.preventDefault(); // Prevent the page from reloading
              handleSendMessage(chatInput);
            }}
          >
            <ChatInput 
              placeholder="Type a message..." 
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
            />
            <SendButton type="submit">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </SendButton>
          </ChatInputContainer>
        </ChatSection>
      </MainContent>
      
      {isWaitingForParticipants && roomState.isHost && showWaitingOverlay && (
        <WaitingOverlay>
          <CloseButton onClick={() => setShowWaitingOverlay(false)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </CloseButton>
          <LoadingSpinner />
          <WaitingTitle>Waiting for others to join...</WaitingTitle>
          <WaitingText>Share this room code with your friends</WaitingText>
          
          <TimerContainer>
            Room expires in: {formatTime(waitingTimeLeft)}
          </TimerContainer>
          
          <ShareSection>
            <ShareTitle>Room Code</ShareTitle>
            <RoomCodeDisplay>{roomCode}</RoomCodeDisplay>
            <Button onClick={handleCopyRoomCode}>
              {isCopied ? 'Copied!' : 'Copy Room Code'}
            </Button>
          </ShareSection>
        </WaitingOverlay>
      )}
      
      {showVideoLibrary && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: theme.spacing.lg
        }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '1000px' }}>
            <button 
              onClick={() => setShowVideoLibrary(false)}
              style={{
                position: 'absolute',
                top: '-40px',
                right: '0',
                background: 'none',
                border: 'none',
                color: 'white',
                fontSize: '24px',
                cursor: 'pointer',
                zIndex: 1001
              }}
            >
              ✕
            </button>
            <VideoLibrary 
              roomCode={roomCode}
              onSelectVideo={(movie) => {
                console.log('Selected video:', movie);
                // Store the source locally as a fallback
                if (movie && movie.source) {
                  console.log('Storing local video source:', movie.source);
                  localVideoSourceRef.current = movie.source;
                  
                  // Update the local room state immediately for a more responsive experience
                  // This sets an initial value that will be overridden when the server responds
                  // with the updated room state
                  setRoomState({
                    ...roomState,
                    selectedMovie: {
                      id: movie.id,
                      title: movie.title,
                      source: movie.source,
                      thumbnail: movie.thumbnail || '',
                      duration: typeof movie.duration === 'number' ? String(movie.duration) : (movie.duration || '00:00')
                    }
                  });
                }
                
                // Call the socket service to select the video
                socketService.selectVideo(movie);
                setShowVideoLibrary(false);
              }} 
            />
          </div>
        </div>
      )}
    </PageContainer>
  );
};

export default WatchRoom;
