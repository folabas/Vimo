import { BaseUser, BaseRoom, BaseVideo, BaseChatMessage } from './common';

export interface Room extends Omit<BaseRoom, 'settings'> {
  host: BaseUser;
  video: BaseVideo & {
    isPlaying: boolean;
    currentTime: number;
    lastPlayedAt: Date;
  };
  participants: BaseUser[];
  settings: BaseRoom['settings'] & {
    requireApprovalToJoin: boolean;
    allowScreenSharing: boolean;
    allowFileSharing: boolean;
  };
}

export interface CreateRoomData extends Pick<BaseRoom, 'name' | 'description' | 'isPublic' | 'maxParticipants' | 'password'> {
  settings?: Partial<Room['settings']>;
}

export interface UpdateRoomData extends Partial<Omit<CreateRoomData, 'settings'>> {
  video?: Partial<BaseVideo> & {
    isPlaying?: boolean;
    currentTime?: number;
    lastPlayedAt?: Date;
  };
  settings?: Partial<Room['settings']>;
}

export interface JoinRoomData {
  roomId: string;
  password?: string;
}

export interface RoomParticipant extends BaseUser {
  isHost: boolean;
  joinedAt: Date;
  lastActiveAt: Date;
  role?: 'user' | 'moderator' | 'admin';
  status?: 'active' | 'idle' | 'away' | 'offline';
}

export interface RoomMessage extends BaseChatMessage {
  user: Pick<BaseUser, 'id' | 'username' | 'avatar'>;
  metadata?: {
    isPinned?: boolean;
    isEdited?: boolean;
    replyTo?: string;
    reactions?: Record<string, string[]>; // emoji -> array of user IDs
  };
}

export interface RoomState {
  isPlaying: boolean;
  currentTime: number;
  video: BaseVideo;
  buffered: number;
  volume: number;
  playbackRate: number;
  isMuted: boolean;
  isFullscreen: boolean;
  isTheaterMode: boolean;
  isMiniPlayerMode: boolean;
  lastUpdatedBy?: string;
  lastUpdatedAt: Date;
}

export type RoomEventType = 
  | 'play' 
  | 'pause' 
  | 'seek' 
  | 'buffering' 
  | 'ratechange' 
  | 'volumechange' 
  | 'fullscreenchange' 
  | 'theatermodechange' 
  | 'minimodechange' 
  | 'videochange'
  | 'user-joined'
  | 'user-left'
  | 'user-role-updated';

export interface RoomEvent<T = any> {
  type: RoomEventType;
  timestamp: number;
  roomId: string;
  userId: string;
  payload: T;
  metadata?: Record<string, any>;
}

export type RoomSettings = BaseRoom['settings'] & {
  requireApprovalToJoin: boolean;
  allowScreenSharing: boolean;
  allowFileSharing: boolean;
  allowGuestJoins: boolean;
  allowRaiseHand: boolean;
  allowPrivateMessages: boolean;
  allowReactions: boolean;
  allowPolls: boolean;
  allowScreenRecording: boolean;
  maxVideoQuality: '144p' | '240p' | '360p' | '480p' | '720p' | '1080p' | '1440p' | '2160p' | 'original';
  defaultRole: 'viewer' | 'moderator';
  retentionPeriod: number; // in days
  maxMessageLength: number;
  maxFileSize: number; // in MB
  allowedFileTypes: string[];
}
