import { useState, useEffect, useCallback, useRef } from 'react';
import { socketService, SocketEvents } from '../services/api/socketService';
import { RoomState, Message, Participant, Movie } from '../types/room';

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
      if (!newState.selectedMovie.source && newState.selectedMovie.videoUrl) {
        newState.selectedMovie.source = newState.selectedMovie.videoUrl;
      }
      if (!newState.selectedMovie.source) {
        console.warn('Selected movie has no valid source:', newState.selectedMovie);
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
  const leaveRoom = useCallback(() => {
    if (roomCode) {
      socketService.leaveRoom(roomCode);
    }
  }, [roomCode]);

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

  // Setup room function
  const setupRoom = useCallback(() => {
    console.log(`[useWatchRoomSocket] Setting up room ${roomCode}, socket connected:`, socketService.isConnected());
    
    // Register event handlers
    socketService.on(SocketEvents.ROOM_STATE_UPDATE, handleRoomStateUpdate);
    socketService.on(SocketEvents.ROOM_JOINED, handleRoomJoined);
    
    // Join the room
    socketService.joinRoom(roomCode).then((response: any) => {
      console.log(`[useWatchRoomSocket] Successfully joined room ${roomCode}:`, response);
      
      // Update room state with response data
      if (response) {
        setRoomState((prev) => ({
          ...prev,
          ...response,
          selectedMovie: (response && response.selectedMovie) || prev.selectedMovie,
        }));
        
        // Start the waiting countdown if needed
        if (response.isWaiting) {
          setIsWaitingForParticipants(true);
          startWaitingCountdown();
        } else {
          setShowWaitingOverlay(false);
        }
        
        // Set initial playback state
        setIsPlaying(response.isPlaying || false);
        if (typeof response.currentTime === 'number') {
          setCurrentTime(response.currentTime);
        }
      }
    }).catch((error) => {
      console.error(`[useWatchRoomSocket] Error joining room ${roomCode}:`, error);
    });
  }, [roomCode, handleRoomStateUpdate, handleRoomJoined, startWaitingCountdown]);

  // Setup socket connection and event listeners
  useEffect(() => {
    console.log(`[useWatchRoomSocket] useEffect for socket setup, roomCode: ${roomCode}`);
    
    // Check if already connected to this room
    if (connectionTracker.currentRoom === roomCode && connectionTracker.hasJoined) {
      console.log(`[useWatchRoomSocket] Already connected to room ${roomCode}`);
      return;
    }
    
    // Prevent double connections in React strict mode
    if (connectionTracker.isConnecting) {
      console.log(`[useWatchRoomSocket] Connection already in progress`);
      return;
    }
    
    connectionTracker.isConnecting = true;
    connectionTracker.currentRoom = roomCode;
    
    // Initialize socket connection
    socketService.initialize().then(() => {
      console.log(`[useWatchRoomSocket] Socket initialized, setting up room ${roomCode}`);
      connectionTracker.hasJoined = true;
      setupRoom();
    }).catch((error) => {
      console.error(`[useWatchRoomSocket] Socket initialization error:`, error);
      connectionTracker.isConnecting = false;
      connectionTracker.currentRoom = null;
    });
    
    // Listen for participant-joined event
    socketService.onParticipantJoined(handleParticipantJoined);
    
    // Listen for participant-left event
    socketService.onParticipantLeft(handleParticipantLeft);

    // --- Playback synchronization: listen for host events ---
    const onPlayVideo = ({ currentTime }: { currentTime: number }) => {
      console.log('[Socket] Received play-video event, setting isPlaying=true, currentTime:', currentTime);
      setIsPlaying(true);
      setCurrentTime(currentTime);
    };
    const onPauseVideo = ({ currentTime }: { currentTime: number }) => {
      console.log('[Socket] Received pause-video event, setting isPlaying=false, currentTime:', currentTime);
      setIsPlaying(false);
      setCurrentTime(currentTime);
    };
    const onSeekVideo = ({ currentTime }: { currentTime: number }) => {
      console.log('[Socket] Received seek-video event, setting currentTime:', currentTime);
      setCurrentTime(currentTime);
    };
    const onPlaybackSync = ({ currentTime }: { currentTime: number }) => {
      console.log('[Socket] Received playback-sync event, updating currentTime:', currentTime);
      // Only update time if we're playing (to avoid overriding paused state)
      if (isPlaying) {
        setCurrentTime(currentTime);
      }
    };
    
    // Register event handlers with detailed logging
    console.log('[useWatchRoomSocket] Registering play-video event handler');
    socketService.on('play-video', onPlayVideo).catch(err => {
      console.error('[useWatchRoomSocket] Failed to register play-video handler:', err);
    });
    
    console.log('[useWatchRoomSocket] Registering pause-video event handler');
    socketService.on('pause-video', onPauseVideo).catch(err => {
      console.error('[useWatchRoomSocket] Failed to register pause-video handler:', err);
    });
    
    console.log('[useWatchRoomSocket] Registering seek-video event handler');
    socketService.on('seek-video', onSeekVideo).catch(err => {
      console.error('[useWatchRoomSocket] Failed to register seek-video handler:', err);
    });
    
    console.log('[useWatchRoomSocket] Registering playback-sync event handler');
    socketService.on('playback-sync', onPlaybackSync).catch(err => {
      console.error('[useWatchRoomSocket] Failed to register playback-sync handler:', err);
    });

    return () => {
      console.log('Cleaning up socket connection');
      if (connectionTracker.currentRoom === roomCode) {
        leaveRoom();
      }
      connectionTracker.currentRoom = null;

      // Clean up listeners on unmount
      socketService.off('play-video', onPlayVideo);
      socketService.off('pause-video', onPauseVideo);
      socketService.off('seek-video', onSeekVideo);
      socketService.off('playback-sync', onPlaybackSync);
      socketService.off(SocketEvents.PARTICIPANT_JOINED, handleParticipantJoined);
      socketService.off(SocketEvents.PARTICIPANT_LEFT, handleParticipantLeft);
    };
  }, [roomCode, setupRoom, leaveRoom, handleParticipantJoined, handleParticipantLeft]);

  // Debug effect to log state changes
  // Debug effect to log state changes - only in development
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
