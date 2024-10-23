import { socialMediaIntegrationService } from './../components/socialMedia/SocialMediaIntegrationService';
// FacebookAPI.ts

// Import necessary modules and types
import axios, { AxiosError } from 'axios';
import { Note, handleNoteApiErrorAndNotify } from './ApiNote';
import axiosInstance from './axiosInstance';
import { headersConfig } from '../components/shared/SharedHeaders';
import { authToken } from '../components/auth/authToken';
import { endpoints } from './ApiEndpoints';

// Define the base URL for Facebook API
const FACEBOOK_API_BASE_URL = 'https://graph.facebook.com/v12.0';

// Define your Facebook access token
const FACEBOOK_ACCESS_TOKEN = 'YOUR_FACEBOOK_ACCESS_TOKEN';


const BASE_URL = endpoints.details.facebook
// Define the Facebook API module
const FacebookAPI = {

  async fetchMessages(): Promise<any[]> {
    try {
      // Make a GET request to the Facebook Graph API to fetch messages
      const response = await axios.get('https://graph.facebook.com/me/messages', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      // Process the response and extract relevant data
      const formattedMessages = response.data.data.map((message: any) => ({
        id: message.id,
        content: message.message, // Adjust according to the actual structure of the response
        // Add more properties as needed
      }));

      return formattedMessages;
    } catch (error) {
      console.error('Error fetching messages from Facebook:', error);
      throw error;
    }
  },

  post: async (endpoint: string, data: any): Promise<any> => {
    try {
      const response = await axios.post(`${BASE_URL}${endpoint}`, data);
      return response.data;
    } catch (error) {
      console.error('Error making POST request to Facebook API:', error);
      throw error;
    }
  },
  
  // Method to post a message
  postMessage: async (content: string): Promise<void> => {
    try {
      await axios.post(
        `${BASE_URL}/me/facebook/feed`, // Updated to use the correct endpoint path
        { message: content },
        {
          params: {
            access_token: authToken,
          },
        }
      );
    } catch (error) {
      console.error('Error posting message to Facebook:', error);
      throw error;
    }
  },

  // Method to fetch posts from a Facebook page
  fetchPosts: async (pageId: string): Promise<any[]> => {
    try {
      const response = await axios.get(`${FACEBOOK_API_BASE_URL}/${pageId}/posts`, {
        params: {
          access_token: FACEBOOK_ACCESS_TOKEN,
        },
      });
      return response.data.data; // Assuming posts are in the 'data' field of the response
    } catch (error) {
      console.error('Error fetching Facebook posts:', error);
      throw error;
    }
  },

  // Method to like a post on Facebook
  likePost: async (postId: string): Promise<void> => {
    try {
      await axios.post(`${FACEBOOK_API_BASE_URL}/${postId}/likes`, {
        access_token: FACEBOOK_ACCESS_TOKEN,
      });
    } catch (error) {
      console.error('Error liking Facebook post:', error);
      throw error;
    }
  },

  // Method to comment on a post on Facebook
  commentOnPost: async (postId: string, comment: string): Promise<void> => {
    try {
      await axios.post(`${FACEBOOK_API_BASE_URL}/${postId}/comments`, {
        message: comment,
        access_token: FACEBOOK_ACCESS_TOKEN,
      });
    } catch (error) {
      console.error('Error commenting on Facebook post:', error);
      throw error;
    }
  },

    fetchAllNotes: async (): Promise<Note[]> => {
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

    
  get: async (endpoint: string): Promise<any> => {
    try {
      const response = await axios.get(`${BASE_URL}${endpoint}`);
      return response.data;
    } catch (error) {
      console.error('Error making GET request to Facebook API:', error);
      throw error;
    }
  }
  // Add more methods as needed for other Facebook API functionalities
};

// Export the FacebookAPI module
export default FacebookAPI;
