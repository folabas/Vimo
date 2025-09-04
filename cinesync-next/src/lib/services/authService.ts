import { apiClient } from '../apiClient';

export interface User {
  id: string;
  username: string;
  email: string;
  profilePicture?: string;
}

export const register = async (
  username: string,
  email: string,
  password: string
): Promise<{ user: User; token: string }> => {
  const response = await apiClient.post<{ user: User; token: string }>(
    '/api/auth/register',
    { username, email, password }
  );
  
  if (response.token) {
    localStorage.setItem('vimo_auth_token', response.token);
  }
  
  return response;
};

export const login = async (
  email: string,
  password: string
): Promise<{ user: User; token: string }> => {
  const response = await apiClient.post<{ user: User; token: string }>(
    '/api/auth/login',
    { email, password }
  );
  
  if (response.token) {
    localStorage.setItem('vimo_auth_token', response.token);
  }
  
  return response;
};

export const logout = async (): Promise<void> => {
  try {
    await apiClient.post('/api/auth/logout');
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    localStorage.removeItem('vimo_auth_token');
  }
};

export const getCurrentUser = async (): Promise<User> => {
  const response = await apiClient.get<{ user: User }>('/api/auth/me');
  return response.user;
};

export const isAuthenticated = async (): Promise<boolean> => {
  const token = localStorage.getItem('vimo_auth_token');
  if (!token) return false;
  
  try {
    await getCurrentUser();
    return true;
  } catch (error) {
    return false;
  }
};
