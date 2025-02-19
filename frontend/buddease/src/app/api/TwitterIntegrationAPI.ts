// TwitterIntegrationAPI.ts

// Import necessary modules and types
import { headersConfig } from '../components/shared/SharedHeaders'; // Assuming you have shared headers configuration
import axiosInstance from './axiosInstance';

// Define the base URL for Twitter API
const TWITTER_API_BASE_URL = 'https://api.twitter.com/1.1';

// Define your Twitter access token
const TWITTER_ACCESS_TOKEN = process.env.TWITTER_ACCESS_TOKEN; // Make sure to set this environment variable


interface TwitterUserDetails {
  userId: string;
  username: string;
  fullName: string;
  description: string;
  profileImageUrl: string;
  // Add more properties specific to Twitter user details as needed
}




// Define the Twitter API module
const TwitterIntegrationAPI = {

  async fetchTweets(userId: string): Promise<any[]> {
    try {
      // Make a GET request to the Twitter API to fetch tweets for a specific user
      const response = await axiosInstance.get(`${TWITTER_API_BASE_URL}/statuses/user_timeline.json`, {
        params: {
          user_id: userId,
          count: 10, // Example: Fetching 10 tweets
          access_token: TWITTER_ACCESS_TOKEN,
        },
        headers: headersConfig, // Assuming you have shared headers configuration
      });

      // Process the response and extract relevant data
      const formattedTweets = response.data.map((tweet: any) => ({
        id: tweet.id_str,
        content: tweet.text,
        // Add more properties as needed
      }));

      return formattedTweets;
    } catch (error) {
      console.error('Error fetching tweets from Twitter:', error);
      throw error;
    }
  },


  async postTweet(content: string): Promise<void> {
    try {
      // Make a POST request to the Twitter API to post a tweet
      await axiosInstance.post(`${TWITTER_API_BASE_URL}/statuses/update.json`, {
        status: content,
      }, {
        headers: {
          ...headersConfig,
          Authorization: `Bearer ${TWITTER_ACCESS_TOKEN}`,
        },
      });
    } catch (error) {
      console.error('Error posting tweet on Twitter:', error);
      throw error;
    }
  },

  async likeTweet(tweetId: string): Promise<void> {
    try {
      // Make a POST request to the Twitter API to like a tweet
      await axiosInstance.post(`${TWITTER_API_BASE_URL}/favorites/create.json`, {
        id: tweetId,
      }, {
        headers: {
          ...headersConfig,
          Authorization: `Bearer ${TWITTER_ACCESS_TOKEN}`,
        },
      });
    } catch (error) {
      console.error('Error liking tweet on Twitter:', error);
      throw error;
    }
  },

  async retweet(tweetId: string): Promise<void> {
    try {
      // Make a POST request to the Twitter API to retweet
      await axiosInstance.post(`${TWITTER_API_BASE_URL}/statuses/retweet/${tweetId}.json`, null, {
        headers: {
          ...headersConfig,
          Authorization: `Bearer ${TWITTER_ACCESS_TOKEN}`,
        },
      });
    } catch (error) {
      console.error('Error retweeting on Twitter:', error);
      throw error;
    }
  },


  async fetchUserDetails(username: string): Promise<TwitterUserDetails> {
    try {
        // Make a GET request to the Twitter API to fetch user details
        const userDetailsResponse = await axiosInstance.get(`${TWITTER_API_BASE_URL}/users/show.json`, {
            params: {
                screen_name: username,
                access_token: TWITTER_ACCESS_TOKEN,
            },
            headers: headersConfig,
        });

        // Process the response and extract relevant data
        const userDetails: TwitterUserDetails = {
            userId: userDetailsResponse.data.id_str,
            username: userDetailsResponse.data.screen_name,
            fullName: userDetailsResponse.data.name,
            description: userDetailsResponse.data.description,
            profileImageUrl: userDetailsResponse.data.profile_image_url_https,
            // Add more properties as needed
        };

        return userDetails;
    } catch (error) {
        console.error('Error fetching user details from Twitter:', error);
        throw error;
    }
},

  // Add more methods for other Twitter API functionalities as needed
};

// Export the TwitterIntegrationAPI module
export default TwitterIntegrationAPI;
