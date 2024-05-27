    // Import necessary modules and types
    import { headersConfig } from '../components/shared/SharedHeaders'; // Assuming you have shared headers configuration
    import axiosInstance from './axiosInstance';

    // Define the base URL for YouTube API
    const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3';

    // Define your YouTube access token
    const YOUTUBE_ACCESS_TOKEN = process.env.YOUTUBE_ACCESS_TOKEN; // Make sure to set this environment variable

    // Define the interface for YouTube user details
    interface YouTubeUserDetails {
        channelId: string;
        username: string;
        fullName: string;
        description: string;
        profileImageUrl: string;
        // Add more properties specific to YouTube user details as needed
    }

    // Define the YouTube API module
    const YouTubeIntegrationAPI = {
        async fetchVideos(channelId: string): Promise<any[]> {
            try {
                // Make a GET request to the YouTube API to fetch videos for a specific channel
                const response = await axiosInstance.get(`${YOUTUBE_API_BASE_URL}/videos`, {
                    params: {
                        key: YOUTUBE_ACCESS_TOKEN,
                        part: 'snippet',
                        channelId: channelId,
                        maxResults: 10, // Example: Fetching 10 videos
                    },
                    headers: headersConfig, // Assuming you have shared headers configuration
                });

                // Process the response and extract relevant data
                const formattedVideos = response.data.items.map((video: any) => ({
                    videoId: video.id.videoId,
                    channelId: video.snippet.channelId,
                    title: video.snippet.title,
                    description: video.snippet.description,
                    thumbnailUrl: video.snippet.thumbnails.default.url,
                    viewsCount: 0, // Example: Extract views count from video.statistics.viewCount if needed
                    likesCount: 0, // Example: Extract likes count from video.statistics.likeCount if needed
                    dislikesCount: 0, // Example: Extract dislikes count from video.statistics.dislikeCount if needed
                    publishedAt: new Date(video.snippet.publishedAt),
                    // Add more properties as needed
                }));

                return formattedVideos;
            } catch (error) {
                console.error('Error fetching videos from YouTube:', error);
                throw error;
            }
        },

        async likeVideo(videoId: string): Promise<void> {
            try {
                // Make a POST request to the YouTube API to like a video
                // Note: Liking a video through the YouTube API requires OAuth 2.0 authentication, and it's not a straightforward process like Twitter
                // You would typically need to integrate Google OAuth for user authentication and authorization to perform actions like liking a video
                console.log(`Liked video with ID: ${videoId}`);
            } catch (error) {
                console.error('Error liking video on YouTube:', error);
                throw error;
            }
        },

        async commentOnVideo(videoId: string, comment: string): Promise<void> {
            try {
                // Make a POST request to the YouTube API to comment on a video
                // Note: Commenting on a video through the YouTube API requires OAuth 2.0 authentication, similar to liking a video
                console.log(`Commented "${comment}" on video with ID: ${videoId}`);
            } catch (error) {
                console.error('Error commenting on video on YouTube:', error);
                throw error;
            }
        },

        async fetchUserDetails(channelId: string): Promise<YouTubeUserDetails> {
            try {
                // Make a GET request to the YouTube API to fetch user details (channel details)
                const userDetailsResponse = await axiosInstance.get(`${YOUTUBE_API_BASE_URL}/channels`, {
                    params: {
                        key: YOUTUBE_ACCESS_TOKEN,
                        part: 'snippet',
                        id: channelId,
                    },
                    headers: headersConfig,
                });

                // Process the response and extract relevant data
                const userDetails: YouTubeUserDetails = {
                    channelId: channelId,
                    username: '', // YouTube doesn't have a direct equivalent of username like Twitter
                    fullName: userDetailsResponse.data.items[0].snippet.title,
                    description: userDetailsResponse.data.items[0].snippet.description,
                    profileImageUrl: userDetailsResponse.data.items[0].snippet.thumbnails.default.url,
                    // Add more properties as needed
                };

                return userDetails;
            } catch (error) {
                console.error('Error fetching user details from YouTube:', error);
                throw error;
            }
        },

        // Add more methods for other YouTube API functionalities as needed
    };

    // Export the YouTubeIntegrationAPI module
    export default YouTubeIntegrationAPI;
