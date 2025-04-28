import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWatchRoomSocket } from './useWatchRoomSocket';

interface UseWatchRoomProps {
  roomCode: string | undefined;
}

export const useWatchRoom = ({ roomCode }: UseWatchRoomProps) => {
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
  const handleToggleSubtitles = useCallback(() => {
    console.log('Toggling subtitles');
    emitToggleSubtitles();
  }, [emitToggleSubtitles]);

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

  const handleSeek = useCallback((time: number) => {
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
  }, [emitSeek, setCurrentTime]);

  const handleSendMessage = useCallback((content: string) => {
    if (!content.trim()) return;

    console.log('Sending message:', content); // Debug log

    // Send the message to the server
    emitChatMessage(content);

    // Clear the input field
    setChatInput('');
  }, [emitChatMessage]);

  // Debug log to check if messages are being updated
  useEffect(() => {
    console.log('Messages updated:', messages);
  }, [messages]);

  const handleCopyRoomCode = useCallback(() => {
    if (roomCode) {
      navigator.clipboard.writeText(roomCode);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  }, [roomCode]);

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

  // Memoize the video source logic
  const videoSourceLogic = useMemo(() => {
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
    
    return {
      sourceToUse,
      hasValidMovie
    };
  }, [roomState.selectedMovie, setRoomState]);

  const handleLeaveRoom = useCallback(() => {
    leaveRoom();
    navigate('/dashboard');
  }, [leaveRoom, navigate]);

  return {
    // State
    isChatOpen,
    showVideoLibrary,
    localCurrentTime,
    waitingTimeLeft,
    chatInput,
    isCopied,
    roomState,
    messages,
    isWaitingForParticipants,
    showWaitingOverlay,
    isHost,
    isPlaying,
    currentTime,
    
    // Setters
    setIsChatOpen,
    setShowVideoLibrary,
    setChatInput,
    setShowWaitingOverlay,
    
    // Handlers
    handleToggleSubtitles,
    handlePlay,
    handlePause,
    handleTimeUpdate,
    handleSeek,
    handleSendMessage,
    handleCopyRoomCode,
    handleReloadRoom,
    handleLeaveRoom,
    
    // Utils
    formatTime,
    videoSourceLogic,
    
    // Socket methods
    emitPlay,
    emitPause,
    emitTimeUpdate,
    emitSeek,
    emitToggleSubtitles,
    emitChatMessage,
    leaveRoom
  };
};
