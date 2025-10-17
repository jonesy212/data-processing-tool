// detailsConfig.ts
import { DetailsEndpoints } from '@/app/typings/categories/DetailsEndpoints'
const BASE_URL = "https://api.example.com";

export const detailsConfig: DetailsEndpoints = {
  list: { path: `${BASE_URL}/details/list`, method: "GET" },
  single: (detailsId: string) => ({ path: `${BASE_URL}/details/${detailsId}`, method: "GET" }),
  add: { path: `${BASE_URL}/details/add`, method: "POST" },
  remove: (detailsId: string) => ({ path: `${BASE_URL}/details/${detailsId}`, method: "DELETE" }),
  update: (detailsId: string) => ({ path: `${BASE_URL}/details/${detailsId}`, method: "PUT" }),

  facebook: {
    fetchMessages: { path: `${BASE_URL}/facebook/messages/fetch`, method: "GET" },
    postMessage: { path: `${BASE_URL}/facebook/messages/post`, method: "POST" },
    addMessage: { path: `${BASE_URL}/facebook/messages/add`, method: "POST" },
    fetchPosts: { path: `${BASE_URL}/facebook/posts/fetch`, method: "GET" },
    likePost: (postId: string) => ({ path: `${BASE_URL}/facebook/posts/${postId}/like`, method: "POST" }),
    commentOnPost: (postId: string) => ({ path: `${BASE_URL}/facebook/posts/${postId}/comment`, method: "POST" }),
    fetchAllNotes: { path: `${BASE_URL}/facebook/notes/fetchAll`, method: "GET" },
  },

  instagram: {
    fetchMessages: { path: `${BASE_URL}/instagram/messages/fetch`, method: "GET" },
    postMessage: { path: `${BASE_URL}/instagram/messages/post`, method: "POST" },
  },

  twitter: {
    fetchMessages: { path: `${BASE_URL}/twitter/messages/fetch`, method: "GET" },
    postMessage: { path: `${BASE_URL}/twitter/messages/post`, method: "POST" },
    updateTweet: { path: `${BASE_URL}/twitter/tweet/update`, method: "PUT" },
    deleteTweet: { path: `${BASE_URL}/twitter/tweet/delete`, method: "DELETE" },
    likeTweet: (tweetId: string) => ({ path: `${BASE_URL}/twitter/tweet/${tweetId}/like`, method: "POST" }),
    retweet: (tweetId: string) => ({ path: `${BASE_URL}/twitter/tweet/${tweetId}/retweet`, method: "POST" }),
  },

  youtube: {
    fetchMessages: { path: `${BASE_URL}/youtube/messages/fetch`, method: "GET" },
    postMessage: { path: `${BASE_URL}/youtube/messages/post`, method: "POST" },
  },

  tiktok: {
    fetchMessages: { path: `${BASE_URL}/tiktok/messages/fetch`, method: "GET" },
    postMessage: { path: `${BASE_URL}/tiktok/messages/post`, method: "POST" },
  },
};
