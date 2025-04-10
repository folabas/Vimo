/**
 * Get the auth token from localStorage
 * @returns Token string or null
 */
const getToken = (): string | null => {
  return localStorage.getItem('vimo_auth_token');
};

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * Base API client for making HTTP requests to the backend
 */
export const apiClient = {
  /**
   * Make a GET request
   * @param endpoint - API endpoint
   * @param requireAuth - Whether the request requires authentication
   * @returns Promise with the response data
   */
  async get<T>(endpoint: string, requireAuth = true): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (requireAuth) {
      const token = getToken();
      if (token) {
        headers['x-auth-token'] = token;
      }
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Something went wrong');
    }

    return response.json();
  },

  /**
   * Make a POST request
   * @param endpoint - API endpoint
   * @param data - Request body data
   * @param requireAuth - Whether the request requires authentication
   * @returns Promise with the response data
   */
  async post<T>(endpoint: string, data: any, requireAuth = true): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (requireAuth) {
      const token = getToken();
      if (token) {
        headers['x-auth-token'] = token;
      }
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Something went wrong');
    }

    return response.json();
  },
};
