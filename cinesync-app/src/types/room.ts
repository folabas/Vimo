export interface Participant {
  id: string;
  name: string;
}

export interface Movie {
  id: string;
  title: string;
  source: string;
  thumbnail?: string;
  duration?: number | string;
  _sourceInvalid?: boolean; // Flag to indicate if the source is invalid
  videoUrl?: string; // Add videoUrl property to handle server responses
}

export interface RoomState {
  roomCode: string;
  isHost: boolean;
  participants: Participant[];
  selectedMovie: Movie | null;
  isPlaying: boolean;
  currentTime: number;
  subtitlesEnabled: boolean;
  isPrivate?: boolean;
  expiresAt?: string; // ISO date string for room expiration
}

export interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: Date;
}
