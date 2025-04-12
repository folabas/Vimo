import React, { createContext, useState, ReactNode } from 'react';
import { createRoom as apiCreateRoom, joinRoom as apiJoinRoom, leaveRoom as apiLeaveRoom, Movie } from '../services/api/roomService';
import { socketService, SocketEvents } from '../services/api/socketService';

export interface RoomState {
  roomCode: string | null;
  isHost: boolean;
  selectedMovie: Movie | null;
  participants: string[];
  subtitlesEnabled: boolean;
  isPrivate: boolean;
  currentTime: number;
  isPlaying: boolean;
}

export interface RoomContextType {
  roomState: RoomState;
  setRoomCode: (code: string | null) => void;
  setIsHost: (isHost: boolean) => void;
  setSelectedMovie: (movie: Movie | null) => void;
  setParticipants: (participants: string[] | ((prev: string[]) => string[])) => void;
  setSubtitlesEnabled: (enabled: boolean) => void;
  setIsPrivate: (isPrivate: boolean) => void;
  setCurrentTime: (time: number) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  createRoom: (movie: Movie, isPrivate: boolean, subtitlesEnabled: boolean) => Promise<string>;
  joinRoom: (roomCode: string) => Promise<boolean>;
  leaveRoom: () => void;
}

const initialRoomState: RoomState = {
  roomCode: null,
  isHost: false,
  selectedMovie: null,
  participants: [],
  subtitlesEnabled: false,
  isPrivate: false,
  currentTime: 0,
  isPlaying: false,
};

export const RoomContext = createContext<RoomContextType | undefined>(undefined);

export const RoomProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [roomState, setRoomState] = useState<RoomState>(initialRoomState);

  const setRoomCode = (code: string | null) => {
    setRoomState(prev => ({ ...prev, roomCode: code }));
  };

  const setIsHost = (isHost: boolean) => {
    setRoomState(prev => ({ ...prev, isHost }));
  };

  const setSelectedMovie = (movie: Movie | null) => {
    setRoomState(prev => ({ ...prev, selectedMovie: movie }));
  };

  const setParticipants = (participants: string[] | ((prev: string[]) => string[])) => {
    setRoomState(prev => ({ ...prev, participants: typeof participants === 'function' ? participants(prev.participants) : participants }));
  };

  const setSubtitlesEnabled = (enabled: boolean) => {
    setRoomState(prev => ({ ...prev, subtitlesEnabled: enabled }));
  };

  const setIsPrivate = (isPrivate: boolean) => {
    setRoomState(prev => ({ ...prev, isPrivate }));
  };

  const setCurrentTime = (time: number) => {
    setRoomState(prev => ({ ...prev, currentTime: time }));
  };

  const setIsPlaying = (isPlaying: boolean) => {
    setRoomState(prev => ({ ...prev, isPlaying }));
  };

  // Real implementation using API service
  const createRoom = async (
    movie: Movie, 
    isPrivate: boolean, 
    subtitlesEnabled: boolean
  ): Promise<string> => {
    try {
      const response = await apiCreateRoom(movie, isPrivate, subtitlesEnabled);
      
      setRoomState({
        roomCode: response.roomCode,
        isHost: true,
        selectedMovie: movie,
        participants: ['You'], // Will be updated by socket events
        subtitlesEnabled,
        isPrivate,
        currentTime: 0,
        isPlaying: false,
      });
      
      // Connect to socket room
      socketService.initialize();
      socketService.joinRoom(response.roomCode);
      
      // Listen for socket events and store callbacks
      const callbacks = setupSocketListeners(response.roomCode);
      setEventCallbacks(callbacks);
      
      return response.roomCode;
    } catch (error) {
      console.error('Error creating room:', error);
      throw error;
    }
  };

  // Real implementation using API service
  const joinRoom = async (roomCode: string): Promise<boolean> => {
    try {
      // Call API to join room
      const success = await apiJoinRoom(roomCode);
      
      if (!success) {
        return false;
      }
      
      // Update room state
      setRoomCode(roomCode);
      
      // Join socket room
      socketService.joinRoom(roomCode);
      
      // Listen for socket events and store callbacks
      const callbacks = setupSocketListeners(roomCode);
      setEventCallbacks(callbacks);
      
      return true;
    } catch (error) {
      console.error('Error joining room:', error);
      return false;
    }
  };

  const leaveRoom = async () => {
    try {
      if (roomState.roomCode) {
        // Leave socket room
        socketService.leaveRoom(roomState.roomCode);
        
        // Call API to leave room
        await apiLeaveRoom(roomState.roomCode);
      }
      
      // Remove socket listeners
      removeSocketListeners();
      
      // Reset room state
      setRoomState(initialRoomState);
    } catch (error) {
      console.error('Error leaving room:', error);
      // Reset room state anyway
      setRoomState(initialRoomState);
    }
  };

  // Store event listener callbacks
  const [eventCallbacks, setEventCallbacks] = useState<any>(null);

  // Setup socket event listeners
  const setupSocketListeners = (roomCode: string) => {
    // Store callback references so we can remove them later
    const videoPlayedCallback = (data: any) => {
      setIsPlaying(true);
      setCurrentTime(data.currentTime);
    };
    
    const videoPausedCallback = (data: any) => {
      setIsPlaying(false);
      setCurrentTime(data.currentTime);
    };
    
    const videoSeekedCallback = (data: any) => {
      setCurrentTime(data.currentTime);
    };
    
    const subtitlesToggleCallback = (data: any) => {
      setSubtitlesEnabled(data.enabled);
    };
    
    const participantJoinedCallback = (data: any) => {
      setParticipants((prev: string[]) => [...prev, data.username]);
    };
    
    const participantLeftCallback = (data: any) => {
      setParticipants((prev: string[]) => prev.filter((username: string) => username !== data.username));
    };

    // Register event listeners
    socketService.on(SocketEvents.VIDEO_PLAYED, videoPlayedCallback);
    socketService.on(SocketEvents.VIDEO_PAUSED, videoPausedCallback);
    socketService.on(SocketEvents.VIDEO_SEEKED, videoSeekedCallback);
    socketService.on(SocketEvents.SUBTITLES_TOGGLED, subtitlesToggleCallback);
    socketService.on(SocketEvents.PARTICIPANT_JOINED, participantJoinedCallback);
    socketService.on(SocketEvents.PARTICIPANT_LEFT, participantLeftCallback);
    
    // Store callbacks for cleanup
    const callbacks = {
      videoPlayed: videoPlayedCallback,
      videoPaused: videoPausedCallback,
      videoSeeked: videoSeekedCallback,
      subtitlesToggled: subtitlesToggleCallback,
      participantJoined: participantJoinedCallback,
      participantLeft: participantLeftCallback
    };
    
    // Return callbacks for cleanup
    return callbacks;
  };

  // Remove socket event listeners
  const removeSocketListeners = () => {
    if (!eventCallbacks) return;
    
    socketService.off(SocketEvents.VIDEO_PLAYED, eventCallbacks.videoPlayed);
    socketService.off(SocketEvents.VIDEO_PAUSED, eventCallbacks.videoPaused);
    socketService.off(SocketEvents.VIDEO_SEEKED, eventCallbacks.videoSeeked);
    socketService.off(SocketEvents.SUBTITLES_TOGGLED, eventCallbacks.subtitlesToggled);
    socketService.off(SocketEvents.PARTICIPANT_JOINED, eventCallbacks.participantJoined);
    socketService.off(SocketEvents.PARTICIPANT_LEFT, eventCallbacks.participantLeft);
    
    // Clear callbacks
    setEventCallbacks(null);
  };

  return (
    <RoomContext.Provider
      value={{
        roomState,
        setRoomCode,
        setIsHost,
        setSelectedMovie,
        setParticipants,
        setSubtitlesEnabled,
        setIsPrivate,
        setCurrentTime,
        setIsPlaying,
        createRoom,
        joinRoom,
        leaveRoom,
      }}
    >
      {children}
    </RoomContext.Provider>
  );
};

export const useRoom = (): RoomContextType => {
  const context = React.useContext(RoomContext);
  if (context === undefined) {
    throw new Error('useRoom must be used within a RoomProvider');
  }
  return context;
};
