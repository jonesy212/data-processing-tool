// VideoAPI.ts

import axios, { AxiosResponse } from 'axios';
import { VideoOptions } from '../communications/chat/ChatSettingsModal';
import { Video } from '../state/stores/VideoStore';
import axiosInstance from '../security/csrfToken';
import { PrivacySettings } from '../settings/PrivacySettings';



class VideoAPI {
  private static baseURL = 'https://example.com/api/videos';

  static async getVideos(): Promise<Video[]> {
    try {
      const response: AxiosResponse<Video[]> = await axios.get(this.baseURL);
      return response.data;
    } catch (error) {
      console.error('Error fetching videos:', error);
      return [];
    }
  }

  static async addVideo(video: Video): Promise<void> {
    try {
      await axios.post(this.baseURL, video);
      console.log('Video added successfully.');
    } catch (error) {
      console.error('Error adding video:', error);
    }
  }

  static async deleteVideo(videoId: string): Promise<void> {
    try {
      await axiosInstance.delete(`${this.baseURL}/${videoId}`);
      console.log('Video deleted successfully.');
    } catch (error) {
      console.error('Error deleting video:', error);
    }
  }


  static async updateVideo(videoId: string, video: Partial<Video>): Promise<void> { 
    try {
      await axiosInstance.patch(`${this.baseURL}/${videoId}`, video);
      console.log('Video updated successfully.');

    } catch (error) {
      console.error('Error updating video:', error);
    }
  }

  static async updateVideoOptions(videoId: string, options: { [key: string]: any }): Promise<void> { 
    try {
      await axiosInstance.patch(`${this.baseURL}/${videoId}/options`, options);
      console.log('Video options updated successfully.');
    } catch (error) {
      console.error('Error updating video options:', error);
    }
  }

  static async openVideoOptionsMenu(videoOptions: VideoOptions[], roomId: string, videoId: string): Promise<void> {
    try {
      // Call backend to open video options menu
      await axiosInstance.post(`${this.baseURL}/${videoId}/open-options`);
    } catch (error) {
      console.error('Error opening video options menu:', error);
    }
  }


    static async saveVideoOptionsToBackend(
      selectedOptions: VideoOptions | boolean,
      roomId: string,
      videoOptions: VideoOptions // Include videoOptions argument here
    ): Promise<void> {
      try {
        // Call backend to save video options
        await axiosInstance.post(`${this.baseURL}/${roomId}/save-options`, {
          selectedOptions,
          videoOptions // Pass videoOptions to the backend
        });
      } catch (error) {
        console.error('Error saving video options to backend:', error);
      }
    }
  
  
  static async getPrivacySettings(videoId: string): Promise<PrivacySettings | undefined> {
    try {
      const response = await axiosInstance.get(`${this.baseURL}/${videoId}/privacy`);
      return response.data;
    } catch (error) {
      console.error('Error fetching privacy settings:', error);
    }
  }
  // Add more API methods as needed
}

export default VideoAPI;
