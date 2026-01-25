// SocialMediaIntegrationService.tsx

// Import necessary modules and types
import { useSecureAccountId } from '@/core/hooks/useSecureAccountId';
import { useSecureUserId } from '@/core/hooks/useSecureUserId';
import { FacebookIntegration } from '@/core/socialMedia/FacebookIntegration';
import { InstagramIntegration } from '@/core/socialMedia/InstagramIntegration';
import { TikTokIntegration } from '@/core/socialMedia/TikTokIntegration';
import { TwitterIntegration } from '@/core/socialMedia/TwitterIntegration';
import { YouTubeIntegration } from '@/core/socialMedia/YouTubeIntegration';

// Define a type for the social media platform
type SocialMediaPlatform = 'Facebook' | 'Instagram' | 'Twitter' | 'YouTube' | 'TikTok';

// Define the interface for the Social Media Integration Service
interface SocialMediaIntegrationService {
  fetchMessages(platform: SocialMediaPlatform): Promise<any[]>;
  postMessage(platform: SocialMediaPlatform, message: string): Promise<void>;
}

 
// Implement the Social Media Integration Service
const userId = useSecureUserId()
const accountId = useSecureAccountId()
class SocialMediaIntegrationServiceImpl implements SocialMediaIntegrationService {

  // Method to fetch messages from a specific social media platform
  async fetchMessages(platform: SocialMediaPlatform): Promise<any[]> {
    switch (platform) {
      case 'Facebook':
        return FacebookIntegration.fetchMessages(String(userId));
      case 'Instagram':
        return InstagramIntegration.fetchMessages(String(userId));
      case 'Twitter':
        return TwitterIntegration.fetchTweets(String(accountId));
      case 'YouTube':
        return YouTubeIntegration.fetchMessages();
      case 'TikTok':
        return TikTokIntegration.fetchMessages();
      default:
        throw new Error('Invalid social media platform');
    }
  }

  // Method to post a message to a specific social media platform
  async postMessage(platform: SocialMediaPlatform, message: string): Promise<void> {
    switch (platform) {
      case 'Facebook':
        return FacebookIntegration.postMessage(message);
      case 'Instagram':
        return InstagramIntegration.postMessage(message);
      case 'Twitter':
        return TwitterIntegration.postMessage(message);
      case 'YouTube':
        return YouTubeIntegration.postMessage(message);
      case 'TikTok':
        return TikTokIntegration.postMessage(message);
      default:
        throw new Error('Invalid social media platform');
    }
  }
}

// Export the Social Media Integration Service instance
export const socialMediaIntegrationService: SocialMediaIntegrationService = new SocialMediaIntegrationServiceImpl();
