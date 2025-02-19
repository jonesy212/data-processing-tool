// InstagramAPI.ts
import axios, { AxiosError } from 'axios';
import { authToken } from '../components/auth/authToken';
import { headersConfig } from '../components/shared/SharedHeaders';
import { endpoints } from './ApiEndpoints';
import { Note, handleNoteApiErrorAndNotify } from './ApiNote';
import axiosInstance from './axiosInstance';

const INSTAGRAM_API_BASE_URL = 'https://api.instagram.com/v1'; // Adjust the base URL accordingly

const BASE_URL = endpoints.details.instagram; // Assuming you have endpoint details configured

const InstagramAPI = {
  async fetchUserDetails(userId: string): Promise<any> {
    try {
      const response = await axios.get(`${INSTAGRAM_API_BASE_URL}/users/${userId}`, {
        params: {
          access_token: authToken, // Assuming you have an access token for Instagram
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching user details from Instagram:', error);
      throw error;
    }
  },

  async fetchPosts(userId: string): Promise<any[]> {
    try {
      const response = await axios.get(`${INSTAGRAM_API_BASE_URL}/users/${userId}/media/recent`, {
        params: {
          access_token: authToken,
        },
      });
      return response.data.data; // Assuming posts are in the 'data' field of the response
    } catch (error) {
      console.error('Error fetching posts from Instagram:', error);
      throw error;
    }
  },

  async likePost(postId: string): Promise<void> {
    try {
      await axios.post(`${INSTAGRAM_API_BASE_URL}/media/${postId}/likes`, {
        access_token: authToken,
      });
    } catch (error) {
      console.error('Error liking Instagram post:', error);
      throw error;
    }
  },

  async commentOnPost(postId: string, comment: string): Promise<void> {
    try {
      await axios.post(`${INSTAGRAM_API_BASE_URL}/media/${postId}/comments`, {
        access_token: authToken,
        text: comment,
      });
    } catch (error) {
      console.error('Error commenting on Instagram post:', error);
      throw error;
    }
  },

  async fetchAllNotes(): Promise<Note[]> {
    try {
      const response = await axiosInstance.get(`${BASE_URL}/api/notes`, {
        headers: headersConfig,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching all notes:', error);
      const errorMessage = 'Failed to fetch all notes';
      handleNoteApiErrorAndNotify(
        error as AxiosError<unknown>,
        errorMessage,
        'FETCH_ALL_NOTES_ERROR'
      );
      throw error;
    }
  },

  async get(endpoint: string): Promise<any> {
    try {
      const response = await axios.get(`${BASE_URL}${endpoint}`);
      return response.data;
    } catch (error) {
      console.error('Error making GET request to Instagram API:', error);
      throw error;
    }
  },

  async post(endpoint: string, data: any): Promise<any> {
    try {
      const response = await axios.post(`${BASE_URL}${endpoint}`, data);
      return response.data;
    } catch (error) {
      console.error('Error making POST request to Instagram API:', error);
      throw error;
    }
  },




  async fetchMessages(userId: string): Promise<any[]> {
    try {
      // Assuming you have a separate endpoint or logic to fetch messages or conversations
      const response = await axiosInstance.get(`${INSTAGRAM_API_BASE_URL}/users/${userId}/messages`, {
        params: {
          access_token: authToken,
        },
      });
  
      // Process the response and extract relevant data
      const formattedMessages = response.data.messages.map((message: any) => ({
        id: message.id,
        content: message.content,
        senderId: message.senderId,
        // Add more properties as needed
      }));
  
      return formattedMessages;
    } catch (error) {
      console.error('Error fetching messages from Instagram:', error);
      throw error;
    }
  }
  
};

export default InstagramAPI;
