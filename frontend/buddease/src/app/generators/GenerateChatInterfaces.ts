// GenerateChatInterfaces.ts

import { ChatRoom } from "../components/calendar/CalendarSlice";
import { TaggableItem } from "../components/intelligence/Tag";
import { User, UserData } from "../components/users/User";

  interface Message extends User, UserData {
    id: string;
    sender: User;
    channelId: ChatRoom;
    content: string;
    tags: TaggableItem[];
    userId?: number
    timestamp: Date | string;
    text: string;
    isUserMessage?: boolean
    receiver: User;
  }


  
  // Function to generate dynamic interfaces
  const generateChatInterfaces = (entities: string[]) => {
    const interfaces: Record<string, any> = {};
  
    entities.forEach(entity => {
      switch (entity.toLowerCase()) {
        case 'user':
          interfaces[entity] = {
            id: 'string',
            username: 'string',
            // Add more user properties as needed
          };
          break;
        case 'channel':
          interfaces[entity] = {
            id: 'string',
            name: 'string',
            members: ['User'],
            // Add more channel properties as needed
          };
          break;
        case 'message':
          interfaces[entity] = {
            id: 'string',
            userId: 'string',
            channelId: 'string',
            content: 'string',
            timestamp: 'Date',
            // Add more message properties as needed
          };
          break;
        case 'conversation':
          interfaces[entity] = {
            id: 'string',
            participants: ['User'], // Assuming conversation involves multiple users
            // Add more conversation properties as needed
          };
          break;
        // Add more cases for other entities
      }
    });
  
    return interfaces;
  };

  export type { Message };
  
  // Example usage
  const generatedInterfaces = generateChatInterfaces(['User', 'Channel', 'Message']);
  console.log(generatedInterfaces);
  