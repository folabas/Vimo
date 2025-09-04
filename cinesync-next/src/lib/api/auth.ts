import { ApiResponse, AuthResponse, LoginCredentials, RegisterData, User } from '@/types';
import apiClient from './apiClient';
import { setToken, removeToken } from './authStorage';

class AuthService {
  public async login(credentials: LoginCredentials): Promise<User> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      '/auth/login',
      credentials
    );
    
    if (!response.data) {
      throw new Error('No data received from server');
    }
    
    if (response.data.token) {
      setToken(response.data.token);
    }
    
    if (!response.data.user) {
      throw new Error('No user data received');
    }
    
    return response.data.user;
  }

  public async register(userData: RegisterData): Promise<User> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      '/auth/register',
      userData
    );
    
    if (!response.data) {
      throw new Error('No data received from server');
    }
    
    if (response.data.token) {
      setToken(response.data.token);
    }
    
    if (!response.data.user) {
      throw new Error('No user data received');
    }
    
    return response.data.user;
  }

  public async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      removeToken();
    }
  }

  public async getCurrentUser(): Promise<User | null> {
    try {
      const response = await apiClient.get<ApiResponse<{ user: User }>>('/auth/me');
      return response.data?.user || null;
    } catch (error) {
      return null;
    }
  }

  public async refreshToken(): Promise<string> {
    const response = await apiClient.post<ApiResponse<{ token: string }>>(
      '/auth/refresh-token'
    );
    
    if (response.data?.token) {
      setToken(response.data.token);
      return response.data.token;
    }
    
    throw new Error('Failed to refresh token');
  }

  public async requestPasswordReset(email: string): Promise<void> {
    await apiClient.post('/auth/request-password-reset', { email });
  }

  public async resetPassword(
    token: string,
    newPassword: string
  ): Promise<void> {
    await apiClient.post('/auth/reset-password', { token, newPassword });
  }
}

export const authService = new AuthService();

export default authService;
