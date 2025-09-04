// Common types that can be used across different type files

// Base user interface with minimal required fields
export interface BaseUser {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  displayName?: string;
  isOnline?: boolean;
  role?: 'user' | 'moderator' | 'admin';
  isEmailVerified?: boolean;
  lastActiveAt?: Date;
}

// Base room interface with minimal required fields
export interface BaseRoom {
  id: string;
  name: string;
  description?: string;
  hostId: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  maxParticipants?: number;
  password?: string;
  settings: {
    allowPlaybackControl: boolean;
    allowSeeking: boolean;
    allowPlaybackRateChange: boolean;
    allowVideoChange: boolean;
    allowChat: boolean;
  };
}

// Base video interface
export interface BaseVideo {
  id: string;
  title: string;
  description?: string;
  thumbnailUrl: string;
  videoUrl: string;
  duration: number;
  source: 'youtube' | 'vimeo' | 'upload' | 'other';
  createdAt: Date;
  updatedAt: Date;
}

// Base chat message interface
export interface BaseChatMessage {
  id: string;
  roomId: string;
  userId: string;
  content: string;
  timestamp: Date;
  isSystemMessage: boolean;
}

// Base API response type
export interface BaseApiResponse<T = any> {
  data?: T;
  error?: {
    message: string;
    code?: string | number;
    details?: any;
  };
  message: string;
  success: boolean;
  statusCode?: number;
}

// Base auth response type
export interface BaseAuthResponse {
  user: BaseUser;
  token: string;
  refreshToken: string;
  expiresIn?: number;
}
