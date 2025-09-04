import { ApiResponse, Room, Video } from '@/types';
import apiClient from './apiClient';

class RoomService {
  public async createRoom(name: string, isPrivate: boolean = false): Promise<Room> {
    const response = await apiClient.post<ApiResponse<Room>>('/rooms', {
      name,
      isPrivate,
    });
    return response.data!;
  }

  public async getRoom(roomId: string): Promise<Room> {
    const response = await apiClient.get<ApiResponse<Room>>(`/rooms/${roomId}`);
    return response.data!;
  }

  public async joinRoom(roomCode: string): Promise<Room> {
    const response = await apiClient.post<ApiResponse<Room>>(
      `/rooms/join/${roomCode}`
    );
    return response.data!;
  }

  public async leaveRoom(roomId: string): Promise<void> {
    await apiClient.post(`/rooms/${roomId}/leave`);
  }

  public async updateRoom(
    roomId: string,
    updates: Partial<{
      name?: string;
      isPrivate?: boolean;
      isPlaying?: boolean;
      currentTime?: number;
      currentVideo?: {
        id: string;
        title: string;
        source: string;
        thumbnail: string;
        duration: string;
      };
    }>
  ): Promise<Room> {
    const response = await apiClient.patch<ApiResponse<Room>>(
      `/rooms/${roomId}`,
      updates
    );
    return response.data!;
  }

  public async deleteRoom(roomId: string): Promise<void> {
    await apiClient.delete(`/rooms/${roomId}`);
  }

  public async getUserRooms(): Promise<Room[]> {
    const response = await apiClient.get<ApiResponse<Room[]>>('/user/rooms');
    return response.data || [];
  }

  // Video Controls
  public async playVideo(roomId: string, position: number = 0): Promise<void> {
    await apiClient.post(`/rooms/${roomId}/play`, { position });
  }

  public async pauseVideo(roomId: string, position: number): Promise<void> {
    await apiClient.post(`/rooms/${roomId}/pause`, { position });
  }

  public async seekVideo(roomId: string, position: number): Promise<void> {
    await apiClient.post(`/rooms/${roomId}/seek`, { position });
  }

  public async changeVideo(
    roomId: string,
    video: Pick<Video, 'id' | 'title' | 'videoUrl' | 'thumbnailUrl' | 'duration' | 'source'>
  ): Promise<Room> {
    const response = await apiClient.post<ApiResponse<Room>>(
      `/rooms/${roomId}/video`,
      { video }
    );
    return response.data!;
  }

  // Chat
  public async sendMessage(
    roomId: string,
    content: string
  ): Promise<void> {
    await apiClient.post(`/rooms/${roomId}/messages`, { content });
  }

  public async getMessages(roomId: string): Promise<any[]> {
    const response = await apiClient.get<ApiResponse<any[]>>(
      `/rooms/${roomId}/messages`
    );
    return response.data || [];
  }

  // Participants
  public async getParticipants(roomId: string): Promise<any[]> {
    const response = await apiClient.get<ApiResponse<any[]>>(
      `/rooms/${roomId}/participants`
    );
    return response.data || [];
  }
}

export const roomService = new RoomService();

export default roomService;
