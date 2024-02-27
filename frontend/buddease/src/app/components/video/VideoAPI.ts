// VideoAPI.ts

import axios, { AxiosResponse } from 'axios';

interface Video {
  id: string;
  title: string;
  url: string;
  // Add more properties as needed
}

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
      await axios.delete(`${this.baseURL}/${videoId}`);
      console.log('Video deleted successfully.');
    } catch (error) {
      console.error('Error deleting video:', error);
    }
  }

  // Add more API methods as needed
}

export default VideoAPI;
