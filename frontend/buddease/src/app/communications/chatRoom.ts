import ChatMessage from '@/app/components/communications/chat/ChatMessage'
import { User } from '@/app/users/User'

export interface ChatRoom {
  id: string;
  creatorId: string;
  // Define properties of ChatRoom here, including 'topics'
  topics: any[]; // Adjust 'any[]' to the actual type of 'topics'
  messages: ChatMessage[]; // Add 'messages' property
  users: User[]; // Add 'users' property
}
