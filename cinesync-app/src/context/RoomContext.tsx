import React, { createContext, useState, useContext, ReactNode } from 'react';

interface Movie {
  id: string;
  title: string;
  source: string;
  thumbnail?: string;
  duration?: number | string;
}

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
  setParticipants: (participants: string[]) => void;
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

  const setParticipants = (participants: string[]) => {
    setRoomState(prev => ({ ...prev, participants }));
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

  // Mock implementation - would connect to backend in real app
  const createRoom = async (
    movie: Movie, 
    isPrivate: boolean, 
    subtitlesEnabled: boolean
  ): Promise<string> => {
    // Generate a random room code (in real app this would come from the server)
    const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    setRoomState({
      roomCode,
      isHost: true,
      selectedMovie: movie,
      participants: ['You'],
      subtitlesEnabled,
      isPrivate,
      currentTime: 0,
      isPlaying: false,
    });
    
    return roomCode;
  };

  // Mock implementation - would connect to backend in real app
  const joinRoom = async (roomCode: string): Promise<boolean> => {
    // In a real app, this would verify the room exists on the server
    // For now, we'll simulate a successful join
    setRoomState({
      roomCode,
      isHost: false,
      selectedMovie: {
        id: 'sample-movie',
        title: 'Sample Movie',
        source: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4',
        thumbnail: 'https://sample-videos.com/img/Sample-jpg-image-50kb.jpg',
      },
      participants: ['Host', 'You'],
      subtitlesEnabled: false,
      isPrivate: false,
      currentTime: 0,
      isPlaying: false,
    });
    
    return true;
  };

  const leaveRoom = () => {
    setRoomState(initialRoomState);
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
