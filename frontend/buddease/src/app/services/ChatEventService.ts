// ChatEventService.ts
import { AxiosResponse } from 'axios';
import axiosInstance from '../api/axiosInstance';
import ChatEvent from '../components/state/stores/ChatEvent';
import ChatMessage from '../components/communications/chat/ChatMessage';

class ChatEventService {
  private static API_BASE_URL = 'https://example.com/api/chat';

  private static getEventsEndpoint(groupId: string, limit: number): string {
    return `${this.API_BASE_URL}/groups/${groupId}/events?limit=${limit}`;
  }

  static async fetchEvents(groupId: string, limit: number): Promise<ChatEvent[]> {
    try {
      const endpoint = this.getEventsEndpoint(groupId, limit);
      const response: AxiosResponse<ChatEvent[]> = await axiosInstance.get(endpoint);
      return response.data;
    } catch (error) {
      console.error('Error fetching chat events:', error);
      throw error;
    }
  }


  // Assuming you have a function to fetch chat event data
  static async fetchChatEvent(roomId: string): Promise<ChatMessage> {
    try {
      // Fetch chat event data from API or any other source
      const response: AxiosResponse<ChatMessage> = await axiosInstance.get(
        `${this.API_BASE_URL}/events/${roomId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching chat event:", error);
      throw error;
    }
  }

  static async createEvent(groupId: string, eventData: any): Promise<ChatEvent> {
    try {
      const endpoint = `${this.API_BASE_URL}/groups/${groupId}/events`;
      const response: AxiosResponse<ChatEvent> = await axiosInstance.post(endpoint, eventData);
      return response.data;
    } catch (error) {
      console.error('Error creating chat event:', error);
      throw error;
    }
  }

  // Add more methods as needed for managing chat events
}

export default ChatEventService;
