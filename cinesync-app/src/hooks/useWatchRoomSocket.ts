import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

/**
 * Normalizes a movie object to ensure it has all required fields and HTTPS URLs
 */
const normalizeMovie = (movie?: Movie | null): Movie | null => {
  if (!movie) return null;
  
  // Ensure source is always set and uses HTTPS
  let source = movie.source || movie.videoUrl || '';
  if (source.startsWith('http://')) {
    source = source.replace('http://', 'https://');
  } else if (!source.startsWith('https://') && source.startsWith('//')) {
    source = 'https:' + source;
  }

  // Ensure thumbnail is always set and uses HTTPS
  // Use type assertion to access thumbnailUrl if it exists
  const movieWithThumbnail = movie as Movie & { thumbnailUrl?: string };
  let thumbnail = movie.thumbnail || movieWithThumbnail.thumbnailUrl || '';
  
  if (thumbnail.startsWith('http://')) {
    thumbnail = thumbnail.replace('http://', 'https://');
  } else if (!thumbnail.startsWith('https://') && thumbnail.startsWith('//')) {
    thumbnail = 'https:' + thumbnail;
  }

  return {
    ...movie,
    id: movie.id || `temp-${Date.now()}`,
    title: movie.title || 'Untitled Video',
    source,
    videoUrl: source, // Keep in sync with source
    thumbnail,
    duration: movie.duration || '00:00',
  };
};
import { Socket } from 'socket.io-client';
import { isAuthenticated } from '../services/api/authService';
import { socketService, SocketEvents } from '../services/api/socketService';
import { RoomState, Message, Participant, Movie } from '../types/room';

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

interface ErrorHandler {
  type: 'AUTH_ERROR' | 'CONNECTION_ERROR' | 'ROOM_ERROR';
  message: string;
  error?: any;
}

interface UseWatchRoomSocketProps {
  roomCode: string;
  onStateUpdate?: (state: RoomState) => void;
  onParticipantJoined?: (participant: Participant) => void;
  onError?: (error: ErrorHandler) => void;
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
  onError = () => {},
  onStateUpdate,
  onParticipantJoined
}: UseWatchRoomSocketProps): UseWatchRoomSocketResult => {
  
  // Initialize with default values for the result
  const defaultResult: UseWatchRoomSocketResult = {
    roomState: initialRoomState,
    setRoomState: () => {},
    messages: [],
    isWaitingForParticipants: false,
    showWaitingOverlay: true,
    isHost: false,
    isPlaying: false,
    currentTime: 0,
    emitPlay: () => {},
    emitPause: () => {},
    emitTimeUpdate: () => {},
    emitSeek: () => {},
    emitSelectVideo: () => {},
    emitToggleSubtitles: () => {},
    emitChatMessage: () => {},
    leaveRoom: () => {},
    setShowWaitingOverlay: () => {},
    setCurrentTime: () => {},
    setIsPlaying: () => {},
    updateMovieState: () => {}
  };

  // Initialize with normalized selectedMovie
  const safeInitialState = {
    ...initialRoomState,
    selectedMovie: normalizeMovie(initialRoomState.selectedMovie) || {
      id: `temp-${Date.now()}`,
      title: '',
      source: '',
      videoUrl: '',
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
  
  // Setup socket connection and event handlers
  useEffect(() => {
    if (!roomCode) return;

    console.log('[useWatchRoomSocket] Setting up socket connection for room:', roomCode);
    
    // Track if we're already connecting to avoid duplicate connections
    if (connectionTracker.isConnecting) {
      console.log('[useWatchRoomSocket] Already connecting to socket, skipping...');
      return;
    }

    // Track if we've already joined this room to prevent duplicate joins
    if (connectionTracker.currentRoom === roomCode && connectionTracker.hasJoined) {
      console.log('[useWatchRoomSocket] Already joined this room, skipping...');
      return;
    }

    // Set connecting state
    connectionTracker.isConnecting = true;
    connectionTracker.currentRoom = roomCode;
    connectionTracker.hasJoined = false;

    const connectToRoom = async () => {
      try {
        // Check if user is authenticated
        console.log('[useWatchRoomSocket] Checking authentication status...');
        const authenticated = await isAuthenticated();
        
        if (!authenticated) {
          console.error('[useWatchRoomSocket] User is not authenticated');
          onError?.({
            type: 'AUTH_ERROR',
            message: 'You must be logged in to join a room',
          });
          return;
        }

        // Initialize socket connection
        console.log('[useWatchRoomSocket] Initializing socket connection...');
        await socketService.initialize();

        // Set up event handlers
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

        // Join the room
        console.log('[useWatchRoomSocket] Joining room:', roomCode);
        await socketService.joinRoom(roomCode);
        
        // Mark as connected and joined
        setConnected(true);
        connectionTracker.hasJoined = true;
        console.log('[useWatchRoomSocket] Successfully joined room');

        // Start the waiting countdown if needed
        startWaitingCountdown();

        // Cleanup function for event handlers
        return () => {
          console.log('[useWatchRoomSocket] Cleaning up socket event handlers');
          socketService.off(SocketEvents.VIDEO_PLAYED, handlePlayVideo);
          socketService.off(SocketEvents.VIDEO_PAUSED, handlePauseVideo);
          socketService.off(SocketEvents.VIDEO_SEEKED, handleSeekVideo);
        };

      } catch (error) {
        console.error('[useWatchRoomSocket] Error connecting to room:', error);
        
        // Handle authentication errors specifically
        if (error instanceof Error && error.name === 'AuthError') {
          onError?.({
            type: 'AUTH_ERROR',
            message: 'Authentication failed. Please log in again.',
            error,
          });
        } else {
          onError?.({
            type: 'CONNECTION_ERROR',
            message: 'Failed to connect to the room',
            error,
          });
        }
      } finally {
        connectionTracker.isConnecting = false;
      }
    };

    const cleanup = connectToRoom();

    // Cleanup function for the effect
    return () => {
      console.log('[useWatchRoomSocket] Cleaning up socket connection');
      
      // Clear any pending timeouts/intervals
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
      
      // Only disconnect if we're not just reconnecting to a different room
      if (connectionTracker.currentRoom === roomCode) {
        connectionTracker.currentRoom = null;
        connectionTracker.hasJoined = false;
        
        if (isConnected) {
          console.log('[useWatchRoomSocket] Leaving room and disconnecting');
          socketService.leaveRoom(roomCode);
          setConnected(false);
        }
      }
      
      // Clean up event handlers
      cleanup?.then(cleanupFn => cleanupFn?.());
    };
  }, [roomCode, onError, isConnected, startWaitingCountdown]);

  // Handle room joined event
  useEffect(() => {
    if (!roomCode) return;

    const handleRoomJoined = (data: RoomState) => {
      console.log('[useWatchRoomSocket] Room joined data:', {
        ...data,
        selectedMovie: data.selectedMovie ? {
          id: data.selectedMovie.id,
          title: data.selectedMovie.title,
          source: data.selectedMovie.source ? 'source-exists' : 'no-source',
          thumbnail: data.selectedMovie.thumbnail ? 'thumbnail-exists' : 'no-thumbnail'
        } : 'no-movie'
      });
      
      // Ensure we have a valid movie object before proceeding
      if (!data.selectedMovie) {
        console.error('[useWatchRoomSocket] No selected movie in room join data');
        return;
      }
      
      // Create a deep copy of the movie to avoid mutation
      const movieCopy = { ...data.selectedMovie };
      
      // Normalize the movie object
      const normalizedMovie = normalizeMovie(movieCopy);
      
      if (!normalizedMovie?.source) {
        console.error('[useWatchRoomSocket] Could not determine video source for movie:', {
          id: data.selectedMovie.id,
          title: data.selectedMovie.title,
          source: data.selectedMovie.source,
          videoUrl: (data.selectedMovie as any).videoUrl,
          rawMovie: data.selectedMovie
        });
        return;
      }
      
      console.log('[useWatchRoomSocket] Normalized movie:', {
        id: normalizedMovie.id,
        title: normalizedMovie.title,
        source: normalizedMovie.source ? 'source-valid' : 'source-missing',
        thumbnail: normalizedMovie.thumbnail ? 'thumbnail-valid' : 'thumbnail-missing'
      });
      
      // Create updated room state with normalized movie
      const updatedRoomState: RoomState = {
        ...data,
        selectedMovie: normalizedMovie,
        isPlaying: data.isPlaying || false,
        currentTime: data.currentTime || 0
      };
      
      // Safe logging with null checks
      console.log('[useWatchRoomSocket] Updated room state with normalized movie:', {
        hasMovie: !!updatedRoomState.selectedMovie,
        source: updatedRoomState.selectedMovie?.source || 'no-source',
        sourceValid: !!updatedRoomState.selectedMovie?.source,
        title: updatedRoomState.selectedMovie?.title || 'no-title',
        id: updatedRoomState.selectedMovie?.id || 'no-id'
      });
      
      // Update room state with response data
      setRoomState(prev => {
        const newState = {
          ...prev,
          ...updatedRoomState,
          selectedMovie: updatedRoomState.selectedMovie || prev.selectedMovie,
        };
        
        // Log the final state for debugging
        console.log('Updated room state:', {
          hasMovie: !!newState.selectedMovie,
          source: newState.selectedMovie?.source,
          sourceValid: !!newState.selectedMovie?.source,
          title: newState.selectedMovie?.title
        });
        
        return newState;
      });
      
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
  }, [roomCode, setRoomState, setIsPlaying, setCurrentTime]);

  // Handle participant left event
  useEffect(() => {
    if (!roomCode) return;
    
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
  }, [roomState.roomCode]);

  // Handle cleanup when leaving room
  const leaveRoom = useCallback(() => {
    if (roomCode) {
      console.log('[useWatchRoomSocket] Leaving room:', roomCode, {
        hasSelectedMovie: !!roomState.selectedMovie,
        movieSource: roomState.selectedMovie?.source ? 'has-source' : 'no-source'
      });
      
      // Get current movie before resetting state
      const currentMovie = roomState.selectedMovie;
      
      // Reset connection first
      socketService.leaveRoom(roomCode);
      setConnected(false);
      
      // Reset connection tracker
      connectionTracker.currentRoom = null;
      connectionTracker.hasJoined = false;
      connectionTracker.isConnecting = false;
      
      // Only keep the movie if it has a valid source
      const movieToKeep = currentMovie?.source ? currentMovie : null;
      
      console.log('[useWatchRoomSocket] Resetting room state, keeping movie:', {
        id: movieToKeep?.id,
        hasSource: !!movieToKeep?.source,
        source: movieToKeep?.source ? 'source-valid' : 'no-valid-source'
      });
      
      // Reset room state, conditionally keeping the selected movie
      setRoomState({
        ...initialRoomState,
        selectedMovie: movieToKeep
      });
    }
  }, [roomCode, initialRoomState, roomState.selectedMovie]);

  // Debug effect to log state changes
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Room state in hook:', {
        roomState,
        isPlaying
      });
    }
  }, [roomState, isPlaying]);

  // Return the result object with all required properties
  const result: UseWatchRoomSocketResult = {
    ...defaultResult, // Use defaults as fallback
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

  return result;
};
