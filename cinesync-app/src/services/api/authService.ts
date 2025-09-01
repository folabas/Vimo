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
    '/auth/register',
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
    '/auth/login',
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
    await apiClient.post('/auth/logout', {}, false);
  } catch (error) {
    console.error('Logout error:', error);
    // Even if the request fails, we still want to clear the local state
  }
};

/**
 * Get the current user from the server
 * @returns Promise with the current user
 * @throws {Error} If there's an error fetching the user
 */
export const getCurrentUser = async (): Promise<User> => {
  const token = localStorage.getItem('vimo_auth_token');
  if (!token) {
    throw new Error('No token, authorization denied');
  }

  try {
    const response = await apiClient.get<{ user: User }>('/auth/user');
    if (!response.user) {
      throw new Error('User not found');
    }
    return response.user;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Failed to fetch current user:', error.message);
      throw error;
    }
    throw new Error('Failed to fetch current user');
  }
};

/**
 * Check if user is authenticated
 * @returns Promise that resolves to true if user is authenticated
 */
export const isAuthenticated = async (): Promise<boolean> => {
  const token = localStorage.getItem('vimo_auth_token');
  // If there's no token, we're definitely not authenticated
  if (!token) {
    return false;
  }
  
  try {
    const user = await getCurrentUser();
    return !!user;
  } catch (error: unknown) {
    // If we get a 401, clear the invalid token
    if (error instanceof Error && 
        (error.message === 'No token, authorization denied' || 
         error.message === 'Token expired')) {
      localStorage.removeItem('vimo_auth_token');
    }
    return false;
  }
};
