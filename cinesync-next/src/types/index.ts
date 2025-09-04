// User Types
export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

// Room Types
export interface Room {
  id: string;
  code: string;
  name: string;
  isPrivate: boolean;
  hostId: string;
  currentVideo?: Video;
  playbackPosition: number;
  isPlaying: boolean;
  createdAt: string;
  updatedAt: string;
}

// Video Types
export interface Video {
  id: string;
  title: string;
  description?: string;
  thumbnailUrl: string;
  videoUrl: string;
  duration: number; // in seconds
  source: 'youtube' | 'vimeo' | 'upload' | 'other';
  createdAt: string;
  updatedAt: string;
}

// Chat Message Types
export interface ChatMessage {
  id: string;
  roomId: string;
  userId: string;
  user: Pick<User, 'id' | 'username' | 'avatar'>;
  content: string;
  timestamp: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: unknown;
  };
  message: string;
  code?: string;
  details?: unknown;
  success: boolean;
}

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  username: string;
  confirmPassword: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

// Socket Event Types
export type SocketEvent =
  | 'room:joined'
  | 'room:left'
  | 'room:updated'
  | 'playback:play'
  | 'playback:pause'
  | 'playback:seek'
  | 'playback:buffer'
  | 'chat:message'
  | 'user:joined'
  | 'user:left';

export interface SocketEventData {
  'room:joined': Room;
  'room:left': { roomId: string; userId: string };
  'room:updated': Room;
  'playback:play': { position: number; timestamp: number };
  'playback:pause': { position: number; timestamp: number };
  'playback:seek': { position: number; userId: string; timestamp: number };
  'playback:buffer': { position: number; isBuffering: boolean };
  'chat:message': ChatMessage;
  'user:joined': { roomId: string; user: Pick<User, 'id' | 'username' | 'avatar'> };
  'user:left': { roomId: string; userId: string };
}
