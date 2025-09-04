'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';

interface Room {
  id: string;
  name: string;
  hostId: string;
  participants: string[];
  currentVideo?: string;
  isPlaying: boolean;
  currentTime: number;
}

interface RoomContextType {
  currentRoom: Room | null;
  isHost: boolean;
  isConnected: boolean;
  createRoom: (roomName: string) => Promise<void>;
  joinRoom: (roomId: string) => Promise<void>;
  leaveRoom: () => void;
  sendMessage: (message: string) => void;
  playVideo: () => void;
  pauseVideo: () => void;
  seekVideo: (time: number) => void;
  changeVideo: (videoId: string) => void;
}

const RoomContext = createContext<RoomContextType | undefined>(undefined);

export const RoomProvider = ({ children }: { children: ReactNode }) => {
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:5000', {
      withCredentials: true,
      transports: ['websocket']
    });
    
    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to WebSocket server');
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from WebSocket server');
    });

    // Handle room events
    newSocket.on('room_created', (room: Room) => {
      setCurrentRoom(room);
      router.push(`/room/${room.id}`);
    });

    newSocket.on('room_joined', (room: Room) => {
      setCurrentRoom(room);
    });

    newSocket.on('room_updated', (updatedRoom: Room) => {
      setCurrentRoom(prevRoom => ({
        ...prevRoom,
        ...updatedRoom
      }));
    });

    // Handle video events
    newSocket.on('video_changed', (data: { videoId: string }) => {
      setCurrentRoom(prevRoom => prevRoom ? {
        ...prevRoom,
        currentVideo: data.videoId,
        isPlaying: true,
        currentTime: 0
      } : null);
    });

    // Handle playback events
    newSocket.on('playback_state_changed', (data: { isPlaying: boolean, currentTime?: number }) => {
      setCurrentRoom(prevRoom => prevRoom ? {
        ...prevRoom,
        isPlaying: data.isPlaying,
        ...(data.currentTime !== undefined && { currentTime: data.currentTime })
      } : null);
    });

    newSocket.on('seek_video', (time: number) => {
      setCurrentRoom(prevRoom => prevRoom ? {
        ...prevRoom,
        currentTime: time
      } : null);
    });

    newSocket.on('play_video', () => {
      // Handle video play event
    });

    newSocket.on('pause_video', () => {
      // Handle video pause event
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [router]);

  const createRoom = async (roomName: string) => {
    if (!socket) return;
    socket.emit('create_room', { name: roomName });
  };

  const joinRoom = async (roomId: string) => {
    if (!socket) return;
    socket.emit('join_room', { roomId });
  };

  const leaveRoom = () => {
    if (!socket || !currentRoom) return;
    socket.emit('leave_room', { roomId: currentRoom.id });
    setCurrentRoom(null);
    router.push('/dashboard');
  };

  const sendMessage = (message: string) => {
    if (!socket || !currentRoom) return;
    socket.emit('send_message', { 
      roomId: currentRoom.id, 
      message 
    });
  };

  const playVideo = () => {
    if (!socket || !currentRoom) return;
    socket.emit('play_video', { roomId: currentRoom.id });
  };

  const pauseVideo = () => {
    if (!socket || !currentRoom) return;
    socket.emit('pause_video', { roomId: currentRoom.id });
  };

  const seekVideo = (time: number) => {
    if (!socket || !currentRoom) return;
    socket.emit('seek_video', { 
      roomId: currentRoom.id, 
      time 
    });
  };

  const changeVideo = async (videoId: string) => {
    if (!socket || !currentRoom) return;
    
    try {
      socket.emit('change_video', {
        roomId: currentRoom.id,
        videoId
      });
      
      // Optimistic update
      setCurrentRoom(prev => prev ? {
        ...prev,
        currentVideo: videoId,
        isPlaying: true,
        currentTime: 0
      } : null);
    } catch (error) {
      console.error('Failed to change video:', error);
      // Consider adding error handling (e.g., toast notification)
    }
  };

  const value = {
    currentRoom,
    isHost: currentRoom ? currentRoom.hostId === socket?.id : false,
    isConnected,
    createRoom,
    joinRoom,
    leaveRoom,
    sendMessage,
    playVideo,
    pauseVideo,
    seekVideo,
    changeVideo,
  };

  return (
    <RoomContext.Provider value={value}>
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
