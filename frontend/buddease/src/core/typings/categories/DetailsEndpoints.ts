// DetailsEndpoints.ts
import { EndpointCategoryConfig, EndpointConfig } from '@/core/config/EndpointConfig';

export interface DetailsEndpoints extends EndpointCategoryConfig {
  list: EndpointConfig;
  single: (detailsId: string) => EndpointConfig;
  add: EndpointConfig;
  remove: (detailsId: string) => EndpointConfig;
  update: (detailsId: string) => EndpointConfig;
  facebook: {
    fetchMessages: EndpointConfig;
    postMessage: EndpointConfig;
    addMessage: EndpointConfig;
    fetchPosts: EndpointConfig;
    likePost: (postId: string) => EndpointConfig;
    commentOnPost: (postId: string) => EndpointConfig;
    fetchAllNotes: EndpointConfig;
  };
  instagram: {
    fetchMessages: EndpointConfig;
    postMessage: EndpointConfig;
  };
  twitter: {
    fetchMessages: EndpointConfig;
    postMessage: EndpointConfig;
    updateTweet: EndpointConfig;
    deleteTweet: EndpointConfig;
    likeTweet: (tweetId: string) => EndpointConfig;
    retweet: (tweetId: string) => EndpointConfig;
  };
  youtube: {
    fetchMessages: EndpointConfig;
    postMessage: EndpointConfig;
  };
  tiktok: {
    fetchMessages: EndpointConfig;
    postMessage: EndpointConfig;
  };
}