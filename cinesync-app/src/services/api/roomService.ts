import { apiClient } from './apiClient';

// Movie interface
export interface Movie {
  id: string;
  title: string;
  source: string;
  thumbnail?: string;
  duration?: number | string;
}

// Room interface
export interface Room {
  roomCode: string;
  movie: Movie;
  isPrivate: boolean;
  subtitlesEnabled: boolean;
  isPlaying: boolean;
  currentTime: number;
  participants: Participant[];
  isHost: boolean;
  createdAt: string;
}

// Room state interface for socket updates
export interface RoomState {
  roomCode: string;
  selectedMovie: Movie;
  isPrivate: boolean;
  subtitlesEnabled: boolean;
  isPlaying: boolean;
  currentTime: number;
  participants: Participant[];
  isHost: boolean;
}

// Participant interface
export interface Participant {
  id?: string;
  userId: string;
  username: string;
  name?: string;
  profilePicture?: string;
  joinedAt?: string;
}

// Message interface for chat
export interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: Date;
}

// Create room response
interface CreateRoomResponse {
  roomCode: string;
  movie: Movie;
  isPrivate: boolean;
  subtitlesEnabled: boolean;
}

// Join room response
interface JoinRoomResponse {
  roomCode: string;
  movie: Movie;
  isPrivate: boolean;
  subtitlesEnabled: boolean;
  isPlaying: boolean;
  currentTime: number;
  isHost: boolean;
}

/**
 * Create a new room
 * @param movie - Movie to watch
 * @param isPrivate - Whether the room is private
 * @param subtitlesEnabled - Whether subtitles are enabled
 * @returns Promise with the create room response
 */
export const createRoom = async (
  movie: Movie,
  isPrivate: boolean,
  subtitlesEnabled: boolean
): Promise<CreateRoomResponse> => {
  return apiClient.post<CreateRoomResponse>('/api/rooms', {
    movie,
    isPrivate,
    subtitlesEnabled,
  });
};

/**
 * Join a room
 * @param roomCode - Room code to join
 * @returns Promise with the join room response
 */
export const joinRoom = async (roomCode: string): Promise<JoinRoomResponse> => {
  return apiClient.post<JoinRoomResponse>('/api/rooms/join', { roomCode });
};

/**
 * Get room details
 * @param roomCode - Room code
 * @returns Promise with the room details
 */
export const getRoomDetails = async (roomCode: string): Promise<Room> => {
  return apiClient.get<Room>(`/api/rooms/${roomCode}`);
};

/**
 * Leave a room
 * @param roomCode - Room code to leave
 * @returns Promise with the leave room response
 */
export const leaveRoom = async (roomCode: string): Promise<{ message: string }> => {
  return apiClient.post<{ message: string }>(`/rooms/${roomCode}/leave`, {});
};
