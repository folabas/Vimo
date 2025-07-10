import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { socketService, SocketEvents } from '../services/api/socketService';
import { RoomState, Message, Participant, Movie } from '../types/room';
import { getToken } from '../services/api/authService';

// Type for playback control events
interface PlaybackEvent {
  currentTime: number;
  roomCode?: string;
  isHost?: boolean;
}

// Static connection tracker to persist across component remounts
// This helps prevent the double-join issue in React's strict mode development
const connectionTracker = {
  currentRoom: null as string | null,
  isConnecting: false,
  hasJoined: false
};

interface UseWatchRoomSocketProps {
  roomCode: string;
  initialRoomState: RoomState;
}

interface UseWatchRoomSocketResult {
  roomState: RoomState;
  setRoomState: React.Dispatch<React.SetStateAction<RoomState>>;
  messages: Message[];
  isWaitingForParticipants: boolean;
  showWaitingOverlay: boolean;
  isHost: boolean;
  isPlaying: boolean;
  currentTime: number;
  emitPlay: (time: number) => void;
  emitPause: (time: number) => void;
  emitTimeUpdate: (time: number) => void;
  emitSeek: (time: number) => void;
  emitSelectVideo: (movie: Movie) => void;
  emitToggleSubtitles: () => void;
  emitChatMessage: (message: string) => void;
  leaveRoom: () => void;
  setShowWaitingOverlay: (show: boolean) => void;
  setCurrentTime: (time: number) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  updateMovieState: (movie: Movie) => void;
}

export const useWatchRoomSocket = ({
  roomCode,
  initialRoomState,
}: UseWatchRoomSocketProps): UseWatchRoomSocketResult => {
  
  // Initialize with a safe default for selectedMovie to prevent null references
  const safeInitialState = {
    ...initialRoomState,
    selectedMovie: initialRoomState.selectedMovie || {
      id: '',
      title: '',
      source: '',
      thumbnail: '',
      duration: '00:00'
    }
  };
  
  // State
  const [roomState, setRoomState] = useState<RoomState>(safeInitialState);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'system-welcome',
      sender: 'System',
      content: 'Welcome to the watch room!',
      timestamp: new Date(),
    },
  ]);
  const [isWaitingForParticipants, setIsWaitingForParticipants] = useState(false);
  const [showWaitingOverlay, setShowWaitingOverlay] = useState(true);
  const [isPlaying, setIsPlaying] = useState(initialRoomState.isPlaying);
  const [currentTime, setCurrentTime] = useState(initialRoomState.currentTime);
  
  // Refs for cleanup
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleRoomStateUpdate = useCallback((newState: RoomState) => {
    if (newState.selectedMovie) {
      // Ensure we have a valid source URL, falling back to videoUrl if needed
      const source = newState.selectedMovie.source || newState.selectedMovie.videoUrl || '';
      
      // Update both source and videoUrl to ensure consistency
      newState.selectedMovie = {
        ...newState.selectedMovie,
        source: source,
        videoUrl: source,
      };
      
      // Log a warning if we still don't have a valid source
      if (!source) {
        console.warn('Selected movie has no valid source:', newState.selectedMovie);
      } else {
        console.log('Updated selected movie with source:', {
          id: newState.selectedMovie.id,
          title: newState.selectedMovie.title,
          source: source,
          hasSource: !!source
        });
      }
    }

    setRoomState((prev) => ({
      ...prev,
      ...newState,
    }));
  }, [setRoomState]);

  const handleParticipantJoined = useCallback((participant: Participant) => {
    setRoomState((prev) => {
      const uniqueParticipants = new Map(
        [...prev.participants, participant].map((p) => [p.userId, p])
      );
      return {
        ...prev,
        participants: Array.from(uniqueParticipants.values()),
      };
    });
  }, []);

  const handleParticipantLeft = useCallback((data: { userId: string, username: string }) => {
    setRoomState((prev) => ({
      ...prev,
      participants: prev.participants.filter(p => p.userId !== data.userId),
    }));
    
    // Add a system message about the participant leaving
    setMessages((prev) => [
      ...prev,
      {
        id: `system-${Date.now()}`,
        sender: 'System',
        content: `${data.username} left the room`,
        timestamp: new Date(),
      },
    ]);
  }, []);

  // Handle room-joined event with reliable data handling
  const handleRoomJoined = useCallback((data: any) => {
    if (data.selectedMovie && !data.selectedMovie.source && data.selectedMovie.videoUrl) {
      data.selectedMovie.source = data.selectedMovie.videoUrl;
    }

    setRoomState((prev) => ({
      ...prev,
      ...data,
      selectedMovie: data.selectedMovie || null,
    }));
  }, [setRoomState]);

  // --- Only host emits playback events ---
  const emitPlay = useCallback((time: number) => {
    if (roomCode) {
      socketService.emitPlay({ roomCode, currentTime: time }, roomState.isHost);
    }
  }, [roomState.isHost, roomCode]);
  const emitPause = useCallback((time: number) => {
    if (roomCode) {
      socketService.emitPause({ roomCode, currentTime: time }, roomState.isHost);
    }
  }, [roomState.isHost, roomCode]);
  const emitSeek = useCallback((time: number) => {
    if (roomCode) {
      socketService.emitSeek({ roomCode, currentTime: time }, roomState.isHost);
    }
  }, [roomState.isHost, roomCode]);
  const emitTimeUpdate = useCallback((time: number) => socketService.emitTimeUpdate(time), []);
  const emitSelectVideo = useCallback((movie: Movie) => socketService.selectVideo(movie), []);
  const emitToggleSubtitles = useCallback(() => socketService.toggleSubtitles(roomState.subtitlesEnabled), [roomState.subtitlesEnabled]);
  const emitChatMessage = useCallback((message: string) => {
    socketService.emitChatMessage({ content: message });
  }, []);

  /**
   * Update the movie state directly (for immediate UI feedback)
   * @param movie - Movie object to update with
   */
  const updateMovieState = useCallback((movie: Movie) => {
    console.log('Directly updating movie state with:', movie);
    
    setRoomState(prev => ({
      ...prev,
      selectedMovie: {
        ...movie,
        // Keep any existing fields from the current selectedMovie if they exist
        ...(prev.selectedMovie || {})
      }
    }));
  }, [setRoomState]);

  // Start countdown for waiting overlay
  const startWaitingCountdown = useCallback(() => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
    
    countdownIntervalRef.current = setInterval(() => {
      // Removed countdown logic
    }, 1000);
  }, []);

  // Track connection state
  const [isConnected, setConnected] = useState(false);
  
  // Setup socket event handlers
  useEffect(() => {
    if (!isConnected) return;
    
    const handlePlayVideo = (data: PlaybackEvent) => {
      console.log('[Socket] Received play command, time:', data.currentTime);
      setIsPlaying(true);
      setCurrentTime(data.currentTime);
    };
    
    const handlePauseVideo = (data: PlaybackEvent) => {
      console.log('[Socket] Received pause command, time:', data.currentTime);
      setIsPlaying(false);
      setCurrentTime(data.currentTime);
    };
    
    const handleSeekVideo = (data: PlaybackEvent) => {
      console.log('[Socket] Received seek command, time:', data.currentTime);
      setCurrentTime(data.currentTime);
    };
    
    // Register event handlers
    socketService.on(SocketEvents.VIDEO_PLAYED, handlePlayVideo);
    socketService.on(SocketEvents.VIDEO_PAUSED, handlePauseVideo);
    socketService.on(SocketEvents.VIDEO_SEEKED, handleSeekVideo);
    
    // Cleanup function
    return () => {
      socketService.off(SocketEvents.VIDEO_PLAYED, handlePlayVideo);
      socketService.off(SocketEvents.VIDEO_PAUSED, handlePauseVideo);
      socketService.off(SocketEvents.VIDEO_SEEKED, handleSeekVideo);
    };
  }, [isConnected]);
  
  // Initialize socket connection
  useEffect(() => {
    if (!roomCode) return;
    
    let isMounted = true;
    console.log('[useWatchRoomSocket] Initializing socket for room:', roomCode);
    
    // Check authentication
    const token = getToken();
    if (!token) {
      console.error('[useWatchRoomSocket] No authentication token found');
      // You might want to redirect to login page here
      return;
    }
    
    const initializeSocket = async () => {
      try {
        console.log('[useWatchRoomSocket] Initializing socket with token');
        
        // Initialize socket connection
        await socketService.initialize();
        
        if (!isMounted) return;
        
        // Set up event handlers
        const handleRoomUpdate = (data: RoomState) => {
          console.log('[useWatchRoomSocket] Room state updated:', data);
          setRoomState(prev => ({
            ...prev,
            ...data,
            selectedMovie: data.selectedMovie || prev.selectedMovie
          }));
        };
        
        const handleParticipantJoined = (participant: Participant) => {
          console.log('[useWatchRoomSocket] Participant joined:', participant);
          setRoomState(prev => ({
            ...prev,
            participants: [...prev.participants, participant]
          }));
        };
        
        // Register event handlers
        socketService.on(SocketEvents.ROOM_STATE_UPDATE, handleRoomUpdate);
        socketService.on(SocketEvents.PARTICIPANT_JOINED, handleParticipantJoined);
        
        // Join the room
        console.log('[useWatchRoomSocket] Joining room:', roomCode);
        await socketService.joinRoom(roomCode);
        
        if (!isMounted) return;
        
        setConnected(true);
        console.log('[useWatchRoomSocket] Successfully joined room:', roomCode);
        
        // Cleanup function for event handlers
        return () => {
          socketService.off(SocketEvents.ROOM_STATE_UPDATE, handleRoomUpdate);
          socketService.off(SocketEvents.PARTICIPANT_JOINED, handleParticipantJoined);
        };
        
      } catch (error: unknown) {
        console.error('[useWatchRoomSocket] Error initializing socket:', error);
        if (isMounted) {
          setConnected(false);
          // Handle specific authentication errors
          const errorMessage = error instanceof Error ? error.message : String(error);
          if (errorMessage.includes('User not found') || errorMessage.includes('authentication')) {
            console.error('[useWatchRoomSocket] Authentication failed. Please log in again.');
            // You might want to redirect to login page here
          } else {
            console.error('[useWatchRoomSocket] Connection error:', errorMessage);
          }
        }
      }
    };
    
    initializeSocket();
    
    // Cleanup function
    return () => {
      isMounted = false;
      console.log('[useWatchRoomSocket] Cleaning up socket connection');
      
      try {
        // Leave the room if connected
        if (socketService.isConnected()) {
          try {
            socketService.leaveRoom(roomCode);
          } catch (error) {
            console.error('[useWatchRoomSocket] Error leaving room during cleanup:', error);
          }
        }
      } catch (error) {
        console.error('[useWatchRoomSocket] Error during cleanup:', error);
      }
    };
  }, [roomCode]);

  // Handle room joined event
  useEffect(() => {
    if (!isConnected) return;
    
    const handleRoomJoined = (data: RoomState) => {
      console.log('[useWatchRoomSocket] Room joined:', data);
      
      // Update room state with response data
      setRoomState(prev => ({
        ...prev,
        ...data,
        selectedMovie: data.selectedMovie || prev.selectedMovie,
      }));
      
      // Start the waiting countdown if needed
      if (data.isWaiting) {
        setIsWaitingForParticipants(true);
        startWaitingCountdown();
      } else {
        setShowWaitingOverlay(false);
      }
      
      // Set initial playback state
      setIsPlaying(data.isPlaying || false);
      if (typeof data.currentTime === 'number') {
        setCurrentTime(data.currentTime);
      }
    };
    
    socketService.on(SocketEvents.ROOM_JOINED, handleRoomJoined);
    
    return () => {
      socketService.off(SocketEvents.ROOM_JOINED, handleRoomJoined);
    };
  }, [isConnected, startWaitingCountdown]);
  
  // Handle participant left event
  useEffect(() => {
    if (!isConnected) return;
    
    const handleParticipantLeft = (data: { userId: string, username: string }) => {
      console.log('[useWatchRoomSocket] Participant left:', data);
      
      setRoomState(prev => ({
        ...prev,
        participants: prev.participants.filter(p => p.userId !== data.userId),
      }));
      
      // Add system message
      setMessages(prev => [
        ...prev,
        {
          id: `system-${Date.now()}`,
          sender: 'System',
          content: `${data.username} left the room`,
          timestamp: new Date(),
        },
      ]);
    };
    
    socketService.on(SocketEvents.PARTICIPANT_LEFT, handleParticipantLeft);
    
    return () => {
      socketService.off(SocketEvents.PARTICIPANT_LEFT, handleParticipantLeft);
    };
  }, [isConnected]);
  
  // Handle leaving the room
  const leaveRoom = useCallback(() => {
    if (!roomCode) return;
    
    try {
      socketService.leaveRoom(roomCode);
      setConnected(false);
    } catch (error) {
      console.error('[useWatchRoomSocket] Error leaving room:', error);
    }
  }, [roomCode]);
  
  // Debug effect to log state changes
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Room state in hook:', {
        roomState,
        isPlaying
      });
    }
  }, [roomState, isPlaying]); // Added isPlaying to dependencies

  return {
    roomState,
    setRoomState,
    messages,
    isWaitingForParticipants,
    showWaitingOverlay,
    isHost: roomState.isHost,
    isPlaying,
    currentTime,
    emitPlay,
    emitPause,
    emitTimeUpdate,
    emitSeek,
    emitSelectVideo,
    emitToggleSubtitles,
    emitChatMessage,
    leaveRoom,
    setShowWaitingOverlay,
    setCurrentTime,
    setIsPlaying,
    updateMovieState,
  };
};
