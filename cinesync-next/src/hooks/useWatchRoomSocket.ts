import { useEffect, useRef, useCallback, useMemo, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './useAuth';

interface RoomState {
  id: string;
  hostId: string;
  participants: string[];
  currentVideo?: {
    id: string;
    title: string;
    source: string;
    thumbnail: string;
    duration: string;
  };
  isPlaying: boolean;
  currentTime: number;
  messages: Array<{
    id: string;
    text: string;
    sender: string;
    timestamp: string;
  }>;
}

type RoomStateUpdater = (prevState: RoomState) => RoomState;

interface UseWatchRoomSocketProps {
  roomId: string;
  onRoomUpdate: (updater: RoomState | RoomStateUpdater) => void;
  onError: (error: { type: string; message: string }) => void;
}

export function useWatchRoomSocket({ roomId, onRoomUpdate, onError }: UseWatchRoomSocketProps) {
  const { user } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const [isConnected, setIsConnected] = useState(false);

  // Initialize socket connection
  useEffect(() => {
    if (!user || !roomId) return;

    const socket = io(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:5000', {
      auth: { token: localStorage.getItem('token') },
      query: { roomId },
      reconnectionAttempts: maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    // Connection events
    const onConnect = () => {
      console.log('Connected to WebSocket server');
      setIsConnected(true);
      reconnectAttempts.current = 0;
    };

    const onDisconnect = (reason: string) => {
      console.log('Disconnected from WebSocket server:', reason);
      setIsConnected(false);
      
      if (reason === 'io server disconnect') {
        // The server was restarted or the token is invalid
        onError({
          type: 'CONNECTION_ERROR',
          message: 'Disconnected from server. Please refresh the page.',
        });
      }
    };

    const onConnectError = (error: Error) => {
      console.error('WebSocket connection error:', error);
      
      if (reconnectAttempts.current >= maxReconnectAttempts) {
        onError({
          type: 'CONNECTION_ERROR',
          message: 'Failed to connect to the server. Please check your internet connection and try again.',
        });
      } else {
        reconnectAttempts.current += 1;
      }
    };

    // Room events
    const onRoomState = (room: RoomState) => {
      onRoomUpdate(room);
    };

    const onPlay = () => {
      onRoomUpdate((prev: RoomState) => ({
        ...prev,
        isPlaying: true,
      }));
    };

    const onPause = () => {
      onRoomUpdate((prev: RoomState) => ({
        ...prev,
        isPlaying: false,
      }));
    };

    const onSeek = (time: number) => {
      onRoomUpdate((prev: RoomState) => ({
        ...prev,
        currentTime: time,
      }));
    };

    const onVideoChange = (video: RoomState['currentVideo']) => {
      onRoomUpdate((prev: RoomState) => ({
        ...prev,
        currentVideo: video,
        currentTime: 0,
        isPlaying: true,
      }));
    };

    const onMessage = (message: { id: string; text: string; sender: string; timestamp: string }) => {
      onRoomUpdate((prev: RoomState) => ({
        ...prev,
        messages: [...prev.messages, message],
      }));
    };

    const onParticipantJoin = (participant: string) => {
      onRoomUpdate((prev: RoomState) => ({
        ...prev,
        participants: [...prev.participants, participant],
      }));
    };

    const onParticipantLeave = (participantId: string) => {
      onRoomUpdate((prev: RoomState) => ({
        ...prev,
        participants: prev.participants.filter(id => id !== participantId),
      }));
    };

    // Set up event listeners
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);
    
    // Room events
    socket.on('room:state', onRoomState);
    socket.on('room:play', onPlay);
    socket.on('room:pause', onPause);
    socket.on('room:seek', onSeek);
    socket.on('room:video:change', onVideoChange);
    socket.on('room:message', onMessage);
    socket.on('room:participant:join', onParticipantJoin);
    socket.on('room:participant:leave', onParticipantLeave);

    // Error events
    const onAuthError = (error: { message: string }) => {
      onError({
        type: 'AUTH_ERROR',
        message: error.message || 'Authentication failed. Please log in again.',
      });
    };

    const onRoomError = (error: { message: string }) => {
      onError({
        type: 'ROOM_ERROR',
        message: error.message || 'An error occurred in the room.',
      });
    };

    socket.on('error:auth', onAuthError);
    socket.on('error:room', onRoomError);

    socketRef.current = socket;

    // Clean up on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.off('connect', onConnect);
        socketRef.current.off('disconnect', onDisconnect);
        socketRef.current.off('connect_error', onConnectError);
        socketRef.current.off('room:state', onRoomState);
        socketRef.current.off('room:play', onPlay);
        socketRef.current.off('room:pause', onPause);
        socketRef.current.off('room:seek', onSeek);
        socketRef.current.off('room:video:change', onVideoChange);
        socketRef.current.off('room:message', onMessage);
        socketRef.current.off('room:participant:join', onParticipantJoin);
        socketRef.current.off('room:participant:leave', onParticipantLeave);
        socketRef.current.off('error:auth', onAuthError);
        socketRef.current.off('error:room', onRoomError);
        
        if (socketRef.current.connected) {
          socketRef.current.disconnect();
        }
        socketRef.current = null;
      }
    };
  }, [roomId, user, onRoomUpdate, onError]);

  // Emit play event
  const play = useCallback(() => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('room:play');
    }
  }, []);

  // Emit pause event
  const pause = useCallback(() => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('room:pause');
    }
  }, []);

  // Emit seek event
  const seek = useCallback((time: number) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('room:seek', time);
    }
  }, []);

  // Emit video change event
  const changeVideo = useCallback((videoId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('room:video:change', { videoId });
    }
  }, []);

  // Send chat message
  const sendMessage = useCallback((message: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('room:message', { text: message });
    }
  }, []);

  return {
    isConnected,
    play,
    pause,
    seek,
    changeVideo,
    sendMessage,
  };
}
