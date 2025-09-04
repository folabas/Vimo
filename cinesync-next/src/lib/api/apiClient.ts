import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { getToken, removeToken } from './auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        const token = getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any;
        
        // Handle 401 Unauthorized
        if (error.response?.status === 401) {
          // If we have a refresh token, try to refresh the access token
          if (!originalRequest._retry) {
            originalRequest._retry = true;
            
            try {
              // TODO: Implement token refresh logic
              // const { token } = await authService.refreshToken();
              // setToken(token);
              // originalRequest.headers.Authorization = `Bearer ${token}`;
              // return this.client(originalRequest);
            } catch (refreshError) {
              // If refresh fails, clear auth and redirect to login
              removeToken();
              window.location.href = '/auth/login';
              return Promise.reject(refreshError);
            }
          } else {
            // If we've already tried to refresh, clear auth and redirect
            removeToken();
            window.location.href = '/auth/login';
          }
        }
        
        // Handle other errors
        return Promise.reject(error);
      }
    );
  }

  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  public async post<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  public async put<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }

  public async patch<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }

  // File upload helper
  public async upload<T>(
    url: string,
    file: File,
    fieldName = 'file',
    onUploadProgress?: (progressEvent: ProgressEvent) => void
  ): Promise<T> {
    const formData = new FormData();
    formData.append(fieldName, file);

    const config: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };

    if (onUploadProgress) {
      config.onUploadProgress = onUploadProgress;
    }

    return this.post<T>(url, formData, config);
  }
}

export const apiClient = new ApiClient();

export default apiClient;
