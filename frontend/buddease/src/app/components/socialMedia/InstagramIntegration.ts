import { endpoints } from "@/app/api/ApiEndpoints";
import InstagramAPI from "@/app/api/InstagramAPI";
import { authToken } from "../auth/authToken";
import axiosInstance from "../security/csrfToken";


const INSTAGRAM_API_BASE_URL = endpoints.details.instagram
// InstagramIntegration.ts
interface InstagramUserDetails {
    userId: string;
    username: string;
    fullName: string;
    bio: string;
    profilePictureUrl: string;
    // Additional properties specific to Instagram user details
}

interface InstagramPost {
    postId: string;
    userId: string;
    username: string;
    caption: string;
    imageUrl: string;
    likesCount: number;
    commentsCount: number;
    createdAt: Date;
    // Additional properties specific to Instagram posts
}

  
  export const InstagramIntegration = {
    async fetchUserDetails(username: string): Promise<InstagramUserDetails> {
      try {
          // Call the Instagram API to fetch user details
          const userDetails = await InstagramAPI.fetchUserDetails(username);

          // Process the response and extract relevant data
          const formattedUserDetails: InstagramUserDetails = {
              userId: userDetails.id,
              username: userDetails.username,
              fullName: userDetails.fullName,
              bio: userDetails.bio,
              profilePictureUrl: userDetails.profilePictureUrl
          };

          return formattedUserDetails;
      } catch (error) {
          console.error('Error fetching user details from Instagram:', error);
          throw error;
      }
  },

  async fetchPosts(accountId: string): Promise<InstagramPost[]> {
      try {
          // Call the Instagram API to fetch posts from an account
          const posts = await InstagramAPI.fetchPosts(accountId);

          // Process the response and extract relevant data
          const formattedPosts: InstagramPost[] = posts.map((post: any) => ({
              postId: post.id,
              userId: post.userId,
              username: post.username,
              caption: post.caption,
              imageUrl: post.imageUrl,
              likesCount: post.likesCount,
              commentsCount: post.commentsCount,
              createdAt: post.createdAt
          }));

          return formattedPosts;
      } catch (error) {
          console.error('Error fetching posts from Instagram account:', error);
          throw error;
      }
  },

  async likePost(postId: string): Promise<void> {
      try {
          // Call the Instagram API to like a post
          await InstagramAPI.likePost(postId);

          // Log success message
          console.log('Successfully liked post on Instagram:', postId);
      } catch (error) {
          // Log error message
          console.error('Error liking post on Instagram:', error);
          throw error;
      }
  },

  async commentOnPost(postId: string, comment: string): Promise<void> {
      try {
          // Call the Instagram API to comment on a post
          await InstagramAPI.commentOnPost(postId, comment);

          // If successful, no need to return anything
      } catch (error) {
          console.error('Error commenting on post on Instagram:', error);
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
},
};
  