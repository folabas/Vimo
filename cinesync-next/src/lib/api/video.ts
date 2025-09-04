import { ApiResponse, Video } from '@/types';
import apiClient from './apiClient';

class VideoService {
  public async searchVideos(query: string): Promise<Video[]> {
    const response = await apiClient.get<ApiResponse<Video[]>>(
      `/videos/search?q=${encodeURIComponent(query)}`
    );
    return response.data || [];
  }

  public async getVideo(videoId: string): Promise<Video> {
    const response = await apiClient.get<ApiResponse<Video>>(`/videos/${videoId}`);
    return response.data!;
  }

  public async getPopularVideos(): Promise<Video[]> {
    const response = await apiClient.get<ApiResponse<Video[]>>('/videos/popular');
    return response.data || [];
  }

  public async getRecommendedVideos(): Promise<Video[]> {
    const response = await apiClient.get<ApiResponse<Video[]>>('/videos/recommended');
    return response.data || [];
  }

  public async uploadVideo(
    file: File,
    onUploadProgress?: (progress: number) => void
  ): Promise<Video> {
    const response = await apiClient.upload<Video>(
      '/videos/upload',
      file,
      'video',
      (progressEvent) => {
        if (onUploadProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onUploadProgress(progress);
        }
      }
    );
    return response;
  }

  public async deleteVideo(videoId: string): Promise<void> {
    await apiClient.delete(`/videos/${videoId}`);
  }

  public async getVideoThumbnail(videoId: string): Promise<string> {
    const response = await apiClient.get<ApiResponse<{ thumbnailUrl: string }>>(
      `/videos/${videoId}/thumbnail`
    );
    return response.data?.thumbnailUrl || '';
  }

  public async getVideoDuration(videoId: string): Promise<number> {
    const response = await apiClient.get<ApiResponse<{ duration: number }>>(
      `/videos/${videoId}/duration`
    );
    return response.data?.duration || 0;
  }

  public async getVideoMetadata(videoId: string): Promise<Partial<Video>> {
    const response = await apiClient.get<ApiResponse<Partial<Video>>>(
      `/videos/${videoId}/metadata`
    );
    return response.data || {};
  }
}

export const videoService = new VideoService();

export default videoService;
