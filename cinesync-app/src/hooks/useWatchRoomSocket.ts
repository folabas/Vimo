import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
  localCurrentTime: number;
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
  const navigate = useNavigate();
  
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
  const [waitingTimeLeft, setWaitingTimeLeft] = useState(60); // 60 seconds countdown
  const [isPlaying, setIsPlaying] = useState(initialRoomState.isPlaying);
  const [currentTime, setCurrentTime] = useState(initialRoomState.currentTime);
  const [localCurrentTime, setLocalCurrentTime] = useState(initialRoomState.currentTime);
  
  // Refs to track component mounted state and for cleanup
  const isMountedRef = useRef(true);
  const controllerRef = useRef(new AbortController());
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasSetupRef = useRef(false);

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

  const handleChatMessage = useCallback((message: Message) => {
    if (!isMountedRef.current || controllerRef.current.signal.aborted) return;

    console.log('Received chat message:', message); // Debug log
    setMessages((prev) => [...prev, message]);
  }, []);

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

  // Socket event emitters - memoized to prevent recreation
  const emitPlay = useCallback((time: number) => socketService.emitPlay(time), []);
  const emitPause = useCallback((time: number) => socketService.emitPause(time), []);
  const emitTimeUpdate = useCallback((time: number) => socketService.emitTimeUpdate(time), []);
  const emitSeek = useCallback((time: number) => socketService.emitSeek(time), []);
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

  // Setup and cleanup function
  const setupRoom = useCallback(async () => {
    if (connectionTracker.currentRoom === roomCode) {
      console.log(`Already connected to room: ${roomCode}`);
      return;
    }
    connectionTracker.currentRoom = roomCode;

    try {
      // Register event handlers
      await socketService.on(SocketEvents.ROOM_STATE_UPDATE, handleRoomStateUpdate);
      await socketService.on(SocketEvents.ROOM_JOINED, handleRoomJoined);

      // Join the room
      await socketService.joinRoom(roomCode);
      console.log(`Successfully joined room: ${roomCode}`);
    } catch (error) {
      console.error('Error setting up room:', error);
      connectionTracker.currentRoom = null;
    }
  }, [roomCode, handleRoomStateUpdate, handleRoomJoined]);

  // Start countdown for waiting overlay
  const startWaitingCountdown = useCallback(() => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
    
    setWaitingTimeLeft(60);
    
    countdownIntervalRef.current = setInterval(() => {
      setWaitingTimeLeft((prev) => {
        if (prev <= 1) {
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // Setup socket connection and event listeners
  useEffect(() => {
    if (!roomCode) return;

    console.log(`Setting up socket for room: ${roomCode}`);
    setupRoom();

    // Listen for chat messages
    socketService.onChatMessage((message: Message) => {
      console.log('Chat message received:', message); // Debug log
      setMessages((prev) => [...prev, message]);
    });

    // Listen for participant-joined event
    socketService.onParticipantJoined(handleParticipantJoined);
    
    // Listen for participant-left event
    socketService.onParticipantLeft(handleParticipantLeft);

    return () => {
      console.log('Cleaning up socket connection');
      if (connectionTracker.currentRoom === roomCode) {
        leaveRoom();
      }
      connectionTracker.currentRoom = null;

      // Clean up listeners on unmount
      socketService.off(SocketEvents.PARTICIPANT_JOINED, handleParticipantJoined);
      socketService.off(SocketEvents.PARTICIPANT_LEFT, handleParticipantLeft);
    };
  }, [roomCode, setupRoom, leaveRoom, handleParticipantJoined, handleParticipantLeft]);

  // Debug effect to log state changes
  useEffect(() => {
    console.log('Room state in hook:', {
      hasMovie: !!roomState.selectedMovie,
      movieId: roomState.selectedMovie?.id,
      source: roomState.selectedMovie?.source,
      participants: roomState.participants.length,
      isPlaying: roomState.isPlaying,
      currentTime: roomState.currentTime
    });
  }, [roomState]);

  return {
    roomState,
    setRoomState,
    messages,
    isWaitingForParticipants,
    showWaitingOverlay,
    isHost: roomState.isHost,
    isPlaying,
    currentTime,
    localCurrentTime,
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
