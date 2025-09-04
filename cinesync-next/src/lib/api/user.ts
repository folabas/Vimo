import { ApiResponse, User } from '@/types';
import apiClient from './apiClient';

class UserService {
  public async getProfile(userId: string): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>(`/users/${userId}`);
    return response.data!;
  }

  public async updateProfile(
    userId: string,
    updates: Partial<Pick<User, 'username' | 'email' | 'avatar'>>
  ): Promise<User> {
    const response = await apiClient.patch<ApiResponse<User>>(
      `/users/${userId}`,
      updates
    );
    return response.data!;
  }

  public async updateAvatar(userId: string, file: File): Promise<{ avatarUrl: string }> {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const response = await apiClient.post<ApiResponse<{ avatarUrl: string }>>(
      `/users/${userId}/avatar`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    
    return response.data!;
  }

  public async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    await apiClient.post(`/users/${userId}/change-password`, {
      currentPassword,
      newPassword,
    });
  }

  public async deleteAccount(userId: string, password: string): Promise<void> {
    await apiClient.delete(`/users/${userId}`, {
      data: { password },
    });
  }

  public async searchUsers(query: string): Promise<User[]> {
    const response = await apiClient.get<ApiResponse<User[]>>(
      `/users/search?q=${encodeURIComponent(query)}`
    );
    return response.data || [];
  }

  public async getUserRooms(userId: string): Promise<any[]> {
    const response = await apiClient.get<ApiResponse<any[]>>(
      `/users/${userId}/rooms`
    );
    return response.data || [];
  }

  public async getUserActivity(userId: string): Promise<any[]> {
    const response = await apiClient.get<ApiResponse<any[]>>(
      `/users/${userId}/activity`
    );
    return response.data || [];
  }

  public async updateNotificationSettings(
    userId: string,
    settings: any
  ): Promise<void> {
    await apiClient.patch(`/users/${userId}/notifications`, settings);
  }

  public async getNotificationSettings(userId: string): Promise<any> {
    const response = await apiClient.get<ApiResponse<any>>(
      `/users/${userId}/notifications`
    );
    return response.data!;
  }
}

export const userService = new UserService();

export default userService;
