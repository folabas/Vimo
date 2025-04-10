import React, { createContext, useState, useContext, ReactNode } from 'react';
import { createRoom as apiCreateRoom, joinRoom as apiJoinRoom, leaveRoom as apiLeaveRoom, Movie } from '../services/api/roomService';
import { socketService, SocketEvents } from '../services/api/socketService';

interface RoomState {
  roomCode: string | null;
  isHost: boolean;
  selectedMovie: Movie | null;
  participants: string[];
  subtitlesEnabled: boolean;
  isPrivate: boolean;
  currentTime: number;
  isPlaying: boolean;
}

interface RoomContextType {
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

const RoomContext = createContext<RoomContextType | undefined>(undefined);

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
      
      // Listen for socket events
      setupSocketListeners(response.roomCode);
      
      return response.roomCode;
    } catch (error) {
      console.error('Error creating room:', error);
      throw error;
    }
  };

  // Real implementation using API service
  const joinRoom = async (roomCode: string): Promise<boolean> => {
    try {
      const response = await apiJoinRoom(roomCode);
      
      setRoomState({
        roomCode: response.roomCode,
        isHost: response.isHost,
        selectedMovie: response.movie,
        participants: ['Host', 'You'], // Will be updated by socket events
        subtitlesEnabled: response.subtitlesEnabled,
        isPrivate: response.isPrivate,
        currentTime: response.currentTime,
        isPlaying: response.isPlaying,
      });
      
      // Connect to socket room
      socketService.initialize();
      socketService.joinRoom(roomCode);
      
      // Listen for socket events
      setupSocketListeners(roomCode);
      
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

  // Setup socket event listeners
  const setupSocketListeners = (roomCode: string) => {
    // Video playback events
    socketService.on(SocketEvents.VIDEO_PLAYED, (data: any) => {
      setIsPlaying(true);
      setCurrentTime(data.currentTime);
    });
    
    socketService.on(SocketEvents.VIDEO_PAUSED, (data: any) => {
      setIsPlaying(false);
      setCurrentTime(data.currentTime);
    });
    
    socketService.on(SocketEvents.VIDEO_SEEKED, (data: any) => {
      setCurrentTime(data.currentTime);
    });
    
    // Subtitle events
    socketService.on(SocketEvents.SUBTITLES_TOGGLED, (data: any) => {
      setSubtitlesEnabled(data.enabled);
    });
    
    // Participant events
    socketService.on(SocketEvents.PARTICIPANT_JOINED, (data: any) => {
      setParticipants((prev: string[]) => [...prev, data.username]);
    });
    
    socketService.on(SocketEvents.PARTICIPANT_LEFT, (data: any) => {
      setParticipants((prev: string[]) => prev.filter((username: string) => username !== data.username));
    });
  };

  // Remove socket event listeners
  const removeSocketListeners = () => {
    socketService.off(SocketEvents.VIDEO_PLAYED, () => {});
    socketService.off(SocketEvents.VIDEO_PAUSED, () => {});
    socketService.off(SocketEvents.VIDEO_SEEKED, () => {});
    socketService.off(SocketEvents.SUBTITLES_TOGGLED, () => {});
    socketService.off(SocketEvents.PARTICIPANT_JOINED, () => {});
    socketService.off(SocketEvents.PARTICIPANT_LEFT, () => {});
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
  const context = useContext(RoomContext);
  if (context === undefined) {
    throw new Error('useRoom must be used within a RoomProvider');
  }
  return context;
};
