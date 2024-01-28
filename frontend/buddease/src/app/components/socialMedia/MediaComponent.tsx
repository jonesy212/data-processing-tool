// MediaComponent.tsx

import React, { useEffect, useState } from 'react';
import { socialMediaIntegrationService } from './SocialMediaIntegrationService';

const MediaComponent: React.FC = () => {
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    // Fetch messages from all social media platforms when the component mounts
    fetchMessagesFromAllPlatforms();
  }, []);

  const fetchMessagesFromAllPlatforms = async () => {
    const platforms: ('Facebook' | 'Instagram' | 'Twitter' | 'YouTube' | 'TikTok')[] = ['Facebook', 'Instagram', 'Twitter', 'YouTube', 'TikTok'];
    const allMessages: any[] = [];

    for (const platform of platforms) {
      try {
        const messages = await socialMediaIntegrationService.fetchMessages(platform);
        allMessages.push(...messages);
      } catch (error) {
        console.error(`Error fetching messages from ${platform}:`, error);
      }
    }

    setMessages(allMessages);
  };

  return (
    <div>
      <h2>Social Media Content</h2>
      <ul>
        {messages.map((message, index) => (
          <li key={index}>{message}</li>
        ))}
      </ul>
    </div>
  );
};

export default MediaComponent;
