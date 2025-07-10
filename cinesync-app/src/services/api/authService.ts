import { apiClient } from './apiClient';

// User interface
export interface User {
  id: string;
  username: string;
  email: string;
  profilePicture?: string;
}

/**
 * Register a new user
 * @param username - Username
 * @param email - Email
 * @param password - Password
 * @returns Promise with the user data
 */
export const register = async (
  username: string,
  email: string,
  password: string
): Promise<{ user: User }> => {
  const response = await apiClient.post<{ user: User }>(
    '/api/auth/register',
    { username, email, password },
    false
  );
  
  return response;
};

/**
 * Login a user
 * @param email - Email
 * @param password - Password
 * @returns Promise with the user data
 */
export const login = async (
  email: string,
  password: string
): Promise<{ user: User }> => {
  const response = await apiClient.post<{ user: User }>(
    '/api/auth/login',
    { email, password },
    false
  );
  
  return response;
};

/**
 * Logout the current user
 * @returns Promise that resolves when logout is complete
 */
export const logout = async (): Promise<void> => {
  try {
    // The second parameter is the request body (empty object) and the third is for options
    await apiClient.post('/api/auth/logout', {}, false);
  } catch (error) {
    console.error('Logout error:', error);
    // Even if the request fails, we still want to clear the local state
  }
};

/**
 * Get the current user from the server
 * @returns Promise with the current user or null if not authenticated
 */
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const response = await apiClient.get<{ user: User | null }>('/api/auth/user');
    return response.user;
  } catch (error) {
    console.error('Failed to fetch current user:', error);
    return null;
  }
};

/**
 * Check if user is authenticated
 * @returns Promise that resolves to true if user is authenticated
 */
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const user = await getCurrentUser();
    return !!user;
  } catch (error) {
    return false;
  }
};
