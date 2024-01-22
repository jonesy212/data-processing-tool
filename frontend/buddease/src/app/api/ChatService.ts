// ChatService.ts
import { AxiosResponse } from 'axios';
import { ChatMessage } from '../components/communications';
import Group from '../components/communications/chat/Group';
import axiosInstance from './axiosInstance';

class ChatService {
  private static API_BASE_URL = 'https://example.com/api/chat';

  private static getMessagesEndpoint(groupId: string, limit: number): string {
    return `${this.API_BASE_URL}/groups/${groupId}/messages?limit=${limit}`;
  }

  private static getGroupMessagesEndpoint(groupId: string): string {
    return `${this.API_BASE_URL}/groups/${groupId}/messages`;
  }

  private static getGroupsEndpoint(): string {
    return `${this.API_BASE_URL}/groups`;
  }

  static async fetchMessages(groupId: string, limit: number): Promise<ChatMessage[]> {
    try {
      const endpoint = this.getMessagesEndpoint(groupId, limit);
      const response: AxiosResponse<ChatMessage[]> = await axiosInstance.get(endpoint);
      return response.data;
    } catch (error) {
      console.error('Error fetching chat messages:', error);
      throw error;
    }
  }

  static async sendGroupMessage(groupId: string, message: string): Promise<void> {
    try {
      const endpoint = this.getGroupMessagesEndpoint(groupId);
      await axiosInstance.post(endpoint, { message });
    } catch (error) {
      console.error('Error sending group message:', error);
      throw error;
    }
  }

  static async createGroup(groupName: string, isPublic: boolean): Promise<Group> {
    try {
      const endpoint = this.getGroupsEndpoint();
      const response: AxiosResponse<Group> = await axiosInstance.post(endpoint, {
        name: groupName,
        isPublic,
      });
      return response.data;
    } catch (error) {
      console.error('Error creating group:', error);
      throw error;
    }
  }

  static async toggleGroupPrivacy(groupId: string): Promise<void> {
    try {
      const endpoint = `${this.API_BASE_URL}/groups/${groupId}/toggle-privacy`;
      await axiosInstance.patch(endpoint);
    } catch (error) {
      console.error('Error toggling group privacy:', error);
      throw error;
    }
  }

  // Add more methods as needed for various chat functionalities
}

export default ChatService;
