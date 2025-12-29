// externalApiConfig.ts
import { externalAPIs } from '@/core/api/externalAPIs';
import axios from 'axios';

// Base external API configuration
const createExternalApiInstance = (baseURL: string, defaultHeaders: Record<string, string> = {}) => {
  return axios.create({
    baseURL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
      ...defaultHeaders
    }
  });
};

// Individual external API instances
export const wixApi = createExternalApiInstance('https://www.wixapis.com');
export const twitterApi = createExternalApiInstance('https://api.twitter.com/2');
export const facebookApi = createExternalApiInstance('https://graph.facebook.com/v18.0');
export const youtubeApi = createExternalApiInstance('https://www.googleapis.com/youtube/v3');
export const stripeApi = createExternalApiInstance('https://api.stripe.com/v1');
export const githubApi = createExternalApiInstance('https://api.github.com');

// Add authentication interceptors
wixApi.interceptors.request.use((config) => {
  config.headers['Authorization'] = `Bearer ${process.env.WIX_API_KEY}`;
  return config;
});

twitterApi.interceptors.request.use((config) => {
  config.headers['Authorization'] = `Bearer ${process.env.TWITTER_BEARER_TOKEN}`;
  return config;
});

// Export all instances in one object for easy access
export const externalApiInstances = {
  wix: wixApi,
  twitter: twitterApi,
  facebook: facebookApi,
  youtube: youtubeApi,
  stripe: stripeApi,
  github: githubApi,
  // Add more as needed
};

// Helper to get API info
export const getApiInfo = (apiName: keyof typeof externalAPIs) => {
  return externalAPIs[apiName];
};