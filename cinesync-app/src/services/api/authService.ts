import { apiClient } from './apiClient';

// Token storage key
const TOKEN_KEY = 'vimo_auth_token';
const USER_KEY = 'vimo_user';

// User interface
export interface User {
  id: string;
  username: string;
  email: string;
  profilePicture?: string;
}

// Auth response interface
interface AuthResponse {
  token: string;
  user: User;
}

/**
 * Register a new user
 * @param username - Username
 * @param email - Email
 * @param password - Password
 * @returns Promise with the auth response
 */
export const register = async (
  username: string,
  email: string,
  password: string
): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>(
    '/auth/register',
    { username, email, password },
    false
  );
  
  // Store token and user
  localStorage.setItem(TOKEN_KEY, response.token);
  localStorage.setItem(USER_KEY, JSON.stringify(response.user));
  
  return response;
};

/**
 * Login a user
 * @param email - Email
 * @param password - Password
 * @returns Promise with the auth response
 */
export const login = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>(
    '/auth/login',
    { email, password },
    false
  );
  
  // Store token and user
  localStorage.setItem(TOKEN_KEY, response.token);
  localStorage.setItem(USER_KEY, JSON.stringify(response.user));
  
  return response;
};

/**
 * Logout the current user
 */
export const logout = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

/**
 * Get the current user
 * @returns User object or null
 */
export const getCurrentUser = (): User | null => {
  const userJson = localStorage.getItem(USER_KEY);
  return userJson ? JSON.parse(userJson) : null;
};

/**
 * Get the auth token
 * @returns Token string or null
 */
export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Check if user is authenticated
 * @returns Boolean indicating if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return !!getToken();
};
