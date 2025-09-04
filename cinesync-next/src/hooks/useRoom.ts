import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import roomService from '@/lib/api/room';
import { useAuth } from './useAuth';
import { User, Room as ApiRoom } from '@/types';
import { Movie } from '@/types/tmdb';

interface RoomParticipant {
  id: string;
  username: string;
  avatar?: string;
  isHost: boolean;
}

interface Room extends Omit<ApiRoom, 'hostId' | 'currentVideo' | 'playbackPosition'> {
  host: Pick<User, 'id' | 'username' | 'avatar'>;
  currentVideo?: Movie & { source: string; thumbnail: string; duration: string; };
  currentTime: number;
  participants: RoomParticipant[];
}

interface CreateRoomData {
  title: string;
  isPrivate: boolean;
  video: Movie & { source: string; thumbnail: string; duration: string; };
  subtitlesEnabled?: boolean;
}

interface UseRoomReturn {
  room: Room | null;
  loading: boolean;
  error: string | null;
  createRoom: (roomData: CreateRoomData) => Promise<Room | null>;
  joinRoom: (roomId: string) => Promise<Room | null>;
  leaveRoom: () => Promise<void>;
  getRoom: (roomId: string) => Promise<Room | null>;
  playVideo: () => Promise<void>;
  pauseVideo: () => Promise<void>;
  seekVideo: (time: number) => Promise<void>;
  changeVideo: (video: {
    id: string;
    title: string;
    source: 'youtube' | 'vimeo' | 'upload' | 'other';
    thumbnail: string;
    duration: string;
  }) => Promise<void>;
  sendMessage: (message: string) => Promise<void>;
}

export function useRoom(): UseRoomReturn {
  const [room, setRoom] = useState<Room | null>(null);
  
  // Helper to convert API video to Movie type
  const toMovie = (video: any): Movie & { source: string; thumbnail: string; duration: string } => {
    return {
      id: video.id,
      title: video.title,
      overview: video.overview || '',
      poster_path: video.thumbnail || '',
      backdrop_path: video.thumbnail || '',
      release_date: video.release_date || new Date().toISOString().split('T')[0],
      vote_average: 0,
      vote_count: 0,
      source: video.source || 'tmdb',
      thumbnail: video.thumbnail || '',
      duration: video.duration || '0:00',
    };
  };
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const router = useRouter();

  const createRoom = useCallback(async (roomData: CreateRoomData): Promise<Room | null> => {
    if (!user) {
      router.push('/login');
      return null;
    }

    try {
      setLoading(true);
      setError(null);
      
      const roomDataWithRequiredFields = {
        ...roomData,
        video: {
          ...roomData.video,
          // Ensure we have all required fields
          id: String(roomData.video.id),
          thumbnail: roomData.video.thumbnail || roomData.video.poster_path || '',
          duration: roomData.video.duration || '0:00',
          source: roomData.video.source || 'tmdb',
        }
      };
      
      const apiRoom = await roomService.createRoom(roomDataWithRequiredFields.title, roomDataWithRequiredFields.isPrivate);
      
      // Transform the API response to our local Room type
      const newRoom: Room = {
        ...apiRoom,
        host: {
          id: user.id,
          username: user.username,
          avatar: (user as any).avatar || ''
        },
        currentTime: 0,
        currentVideo: apiRoom.currentVideo ? toMovie(apiRoom.currentVideo) : undefined,
        participants: [{
          id: user.id,
          username: user.username,
          avatar: (user as any).avatar || '',
          isHost: true
        }],
      };
      
      setRoom(newRoom);
      return newRoom;
    } catch (err: any) {
      console.error('Failed to create room:', err);
      setError(err.message || 'Failed to create room');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user, router]);

  const joinRoom = useCallback(async (roomId: string): Promise<Room | null> => {
    if (!user) {
      router.push('/login');
      return null;
    }

    try {
      setLoading(true);
      setError(null);
      
      const apiRoom = await roomService.joinRoom(roomId);
      
      const joinedRoom: Room = {
        ...apiRoom,
        host: {
          id: apiRoom.hostId,
          username: 'Host', // This should be fetched from the API
          avatar: ''
        },
        currentTime: apiRoom.playbackPosition || 0,
        currentVideo: apiRoom.currentVideo ? toMovie(apiRoom.currentVideo) : undefined,
        participants: [],
      };
      
      setRoom(joinedRoom);
      return joinedRoom;
    } catch (err: any) {
      console.error('Failed to join room:', err);
      setError(err.message || 'Failed to join room');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user, router]);

  const leaveRoom = useCallback(async (): Promise<void> => {
    if (!room?.id || !user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      await roomService.leaveRoom(room.id);
      setRoom(null);
      
      // Redirect to home page after leaving the room
      router.push('/');
    } catch (err: any) {
      console.error('Failed to leave room:', err);
      setError(err.message || 'Failed to leave room');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [room?.id, user, router]);

  const getRoom = useCallback(async (roomId: string): Promise<Room | null> => {
    try {
      setLoading(true);
      setError(null);
      
      const apiRoom = await roomService.getRoom(roomId);
      
      // Transform the API response to our local Room type
      const room: Room = {
        ...apiRoom,
        host: {
          id: apiRoom.hostId,
          username: 'Host', // This should be fetched from the API
          avatar: ''
        },
        currentTime: apiRoom.playbackPosition || 0,
        currentVideo: apiRoom.currentVideo ? toMovie(apiRoom.currentVideo) : undefined,
        participants: [],
      };
      
      setRoom(room);
      return room;
    } catch (err: any) {
      console.error('Failed to get room:', err);
      setError(err.message || 'Failed to get room');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const playVideo = useCallback(async () => {
    if (!room?.id) return;
    try {
      setLoading(true);
      await roomService.playVideo(room.id, room.currentTime || 0);
      setRoom(prev => prev ? { ...prev, isPlaying: true } : null);
    } catch (err) {
      setError('Failed to play video');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [room?.id, room?.currentTime]);

  const pauseVideo = useCallback(async () => {
    if (!room?.id) return;
    try {
      setLoading(true);
      await roomService.pauseVideo(room.id, room.currentTime || 0);
      setRoom(prev => prev ? { ...prev, isPlaying: false } : null);
    } catch (err) {
      setError('Failed to pause video');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [room?.id, room?.currentTime]);

  const seekVideo = useCallback(async (time: number) => {
    if (!room?.id) return;
    try {
      setLoading(true);
      await roomService.seekVideo(room.id, time);
      setRoom(prev => prev ? { ...prev, currentTime: time } : null);
    } catch (err) {
      setError('Failed to seek video');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [room?.id]);

  const changeVideo = useCallback(async (video: {
    id: string;
    title: string;
    source: 'youtube' | 'vimeo' | 'upload' | 'other';
    thumbnail: string;
    duration: string;
  }) => {
    if (!room?.id) return;
    try {
      setLoading(true);
      const videoData = {
        id: video.id,
        title: video.title,
        source: video.source,
        thumbnailUrl: video.thumbnail,
        videoUrl: video.source === 'youtube' 
          ? `https://www.youtube.com/watch?v=${video.id}` 
          : video.source === 'vimeo'
            ? `https://vimeo.com/${video.id}`
            : video.id,
        duration: parseInt(video.duration) || 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await roomService.changeVideo(room.id, videoData);
      
      setRoom(prev => ({
        ...prev!,
        currentVideo: video ? toMovie(video) : undefined,
        currentTime: 0,
        isPlaying: false
      }));
    } catch (err) {
      setError('Failed to change video');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [room?.id]);

  const sendMessage = useCallback(async (message: string) => {
    if (!room?.id || !user) return;
    try {
      setLoading(true);
      // In a real implementation, you would send this to your WebSocket or API
      // For now, we'll just update the local state
      const newMessage = {
        id: Date.now().toString(),
        content: message,
        sender: {
          id: user.id,
          username: user.username,
          avatar: user.avatar
        },
        timestamp: new Date().toISOString()
      };
      // This is a placeholder - in a real app, you'd use WebSockets
      console.log('Message sent:', newMessage);
    } catch (err) {
      setError('Failed to send message');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [room?.id, user]);

  return {
    room,
    loading,
    error,
    createRoom,
    joinRoom,
    leaveRoom,
    getRoom,
    playVideo,
    pauseVideo,
    seekVideo,
    changeVideo,
    sendMessage,
  };
}
