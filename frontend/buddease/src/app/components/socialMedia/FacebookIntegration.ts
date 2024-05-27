import { detailsApiService } from '@/app/components/models/data/DetailsService';
import FacebookAPI from "@/app/api/FacebookAPI";
import { endpoints } from '@/app/api/ApiEndpoints';
import axiosInstance from '../security/csrfToken';

interface FacebookUserDetails {
    userId: string;
    username: string;
    fullName: string;
    email: string;
    profilePictureUrl: string;
    // Additional properties specific to Facebook user details
}

interface FacebookPost {
    postId: string;
    userId: string;
    userName: string;
    content: string;
    mediaUrls: string[];
    createdAt: Date;
    // Additional properties specific to Facebook posts
}

const FACEBOOK_API_BASE_URL = endpoints.details.facebookk
const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;

export const FacebookIntegration = {
    async fetchMessages(userId: string): Promise<any[]> {
        try {
          // Make a GET request to the Facebook Graph API to fetch messages for a specific user
          const response = await axiosInstance.get(`${FACEBOOK_API_BASE_URL}/${userId}/messages`, {
            params: {
              access_token: FACEBOOK_ACCESS_TOKEN,
            },
          });
      
          // Process the response and extract relevant data
          const formattedMessages = response.data.data.map((message: any) => ({
            id: message.id,
            content: message.message,
            // Add more properties as needed
          }));
      
          return formattedMessages;
        } catch (error) {
          console.error('Error fetching messages from Facebook:', error);
          throw error;
        }
      },
    
      async postMessage(message: string): Promise<void> {
        try {
          // Call the Facebook API to post a message
          await FacebookAPI.postMessage(message)
    
          // Message posted successfully
          console.log('Message posted on Facebook:', message);
        } catch (error) {
          console.error('Error posting message on Facebook:', error);
          throw error;
        }
    },
      
      async fetchUserDetails(userId: string): Promise<FacebookUserDetails> {
        try {
          // Call the Facebook API to fetch user details
          const userDetails = await FacebookAPI.get(`/users/${userId}`);
    
          // Process the response and extract relevant data
          const formattedUserDetails: FacebookUserDetails = {
              userId: userDetails.id,
              username: userDetails.name,
              fullName: userDetails.fullName,
              email: userDetails.email,
              profilePictureUrl: userDetails.profilePictureUrl
          };
    
          return formattedUserDetails;
        } catch (error) {
          console.error('Error fetching user details from Facebook:', error);
          throw error;
        }
      },
    
      async fetchPosts(pageId: string): Promise<FacebookPost[]> {
        try {
          // Call the Facebook API to fetch posts from a page
          const posts = await FacebookAPI.get(`/pages/${pageId}/posts`);
    
          // Process the response and extract relevant data
          const formattedPosts: FacebookPost[] = posts.map((post: any) => ({
            id: post.id,
            content: post.content,
            // Add more properties as needed
          }));
    
          return formattedPosts;
        } catch (error) {
          console.error('Error fetching posts from Facebook page:', error);
          throw error;
        }
    },
      
    async likePost(postId: string): Promise<void> {
        try {
          // Call the Facebook API to like a post
          await FacebookAPI.post(`/posts/${postId}/likes`, {});
          
          // Log success message
          console.log('Successfully liked post on Facebook:', postId);
        } catch (error) {
          // Log error message
          console.error('Error liking post on Facebook:', error);
          throw error;
        }
      },
      
      async commentOnPost(postId: string, comment: string): Promise<void> {
        try {
          // Call the Facebook API to comment on a post
          await FacebookAPI.post(`/posts/${postId}/comments`, { message: comment });
    
          // If successful, no need to return anything
        } catch (error) {
          console.error('Error commenting on post on Facebook:', error);
          throw error;
        }
      }
};
