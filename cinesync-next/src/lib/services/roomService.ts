import { apiClient } from './apiClient';

export interface Room {
  id: string;
  name: string;
  hostId: string;
  participants: string[];
  currentVideo?: string;
  isPlaying: boolean;
  currentTime: number;
  createdAt: string;
  updatedAt: string;
}

export const createRoom = async (name: string): Promise<Room> => {
  const response = await apiClient.post<Room>('/api/rooms', { name });
  return response.data;
};

export const joinRoom = async (roomId: string): Promise<Room> => {
  const response = await apiClient.post<Room>(`/api/rooms/${roomId}/join`);
  return response.data;
};

export const getRoom = async (roomId: string): Promise<Room> => {
  const response = await apiClient.get<Room>(`/api/rooms/${roomId}`);
  return response.data;
};

export const leaveRoom = async (roomId: string): Promise<void> => {
  await apiClient.post(`/api/rooms/${roomId}/leave`);
};

export const updateRoomVideo = async (
  roomId: string, 
  videoId: string
): Promise<Room> => {
  const response = await apiClient.put<Room>(`/api/rooms/${roomId}/video`, { videoId });
  return response.data;
};

export const updatePlaybackState = async (
  roomId: string, 
  isPlaying: boolean, 
  currentTime: number
): Promise<Room> => {
  const response = await apiClient.put<Room>(`/api/rooms/${roomId}/playback`, {
    isPlaying,
    currentTime
  });
  return response.data;
};

export const getRoomMessages = async (roomId: string): Promise<any[]> => {
  const response = await apiClient.get(`/api/rooms/${roomId}/messages`);
  return response.data;
};

export const sendRoomMessage = async (
  roomId: string, 
  message: string
): Promise<void> => {
  await apiClient.post(`/api/rooms/${roomId}/messages`, { message });
};
