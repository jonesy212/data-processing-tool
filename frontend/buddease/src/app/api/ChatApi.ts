// ChatApi.ts
import axios, { AxiosResponse } from 'axios';
import { ChatMessage } from '../components/communications';
import Group from '../components/communications/chat/Group';
class ChatApi {
  private static API_BASE_URL = 'https://example.com/api/chat';


  static async fetchMessages(groupId: string, limit: number): Promise<ChatMessage[]> {
    try {
      const response: AxiosResponse<ChatMessage[]> = await axios.get(`${this.API_BASE_URL}/messages`, {
        params: { groupId, limit },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching chat messages:', error);
      throw error;
    }
  }

  static async sendGroupMessage(groupId: string, message: string): Promise<void> {
    try {
      await axios.post(`${this.API_BASE_URL}/messages`, { groupId, message });
    } catch (error) {
      console.error('Error sending group message:', error);
      throw error;
    }
  }

  static async createGroup(groupName: string, isPublic: boolean): Promise<Group> {
    try {
      const response: AxiosResponse<Group> = await axios.post(`${this.API_BASE_URL}/groups`, {
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
      await axios.patch(`${this.API_BASE_URL}/groups/${groupId}/toggle-privacy`);
    } catch (error) {
      console.error('Error toggling group privacy:', error);
      throw error;
    }
  }

  // Add more methods as needed for various chat functionalities

  // Example:
  // static async additionalChatFunction(): Promise<any> {
  //   // Implementation
  // }
}



export const getChatData = async () => {
  try {
    const response = await axios.get('/api/chat');
    return response.data;
  } catch (error) {
    console.error('Error fetching chat data:', error);
  }
};

export { ChatApi };

