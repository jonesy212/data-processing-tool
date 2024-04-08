// ChatApi.ts
import { AxiosResponse } from "axios";
import { CalendarManagerState, ChatRoom } from "../components/calendar/CalendarSlice";
import { ChatMessage } from "../components/communications";
import Group from "../components/communications/chat/Group";
import axiosInstance from "./axiosInstance";
class ChatApi {
  private static API_BASE_URL = "https://example.com/api/chat";

  static async fetchMessages(
    groupId: string,
    limit: number
  ): Promise<ChatMessage[]> {
    try {
      const response: AxiosResponse<ChatMessage[]> = await axiosInstance.get(
        `${this.API_BASE_URL}/messages`,
        {
          params: { groupId, limit },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      throw error;
    }
  }
  static async getChatroomMessages(roomId: string, limit: number): Promise<ChatMessage[]> { 
    try {
      const response: AxiosResponse<ChatMessage[]> = await axiosInstance.get(
        `${this.API_BASE_URL}/rooms/${roomId}/messages`,
        {
          params: { limit }
        }
      );
      return response.data;
    } catch (error: any) {
      console.error("Error fetching chat room messages:", error);
      throw error;
     }
  }

  static async getChatRoom(chatRoomId: CalendarManagerState): Promise<ChatRoom> {
    try {
      const response: AxiosResponse<ChatRoom> = await axiosInstance.get(
        `${this.API_BASE_URL}/rooms/${chatRoomId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching chat room:", error);
      throw error;
    }
   }

  static async getChatRooms(
    roomIds: string[]
  ): Promise<ChatRoom[] | undefined> {
    try {
      const response: AxiosResponse<ChatRoom[]> = await axiosInstance.post(
        `${this.API_BASE_URL}/rooms/bulk`,
        {
          roomIds,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching chat rooms:", error);
      return undefined;
    }
  }

  static async sendGroupMessage(
    groupId: string,
    message: string
  ): Promise<void> {
    try {
      await axiosInstance.post(`${this.API_BASE_URL}/messages`, {
        groupId,
        message,
      });
    } catch (error) {
      console.error("Error sending group message:", error);
      throw error;
    }
  }

  static async createGroup(
    groupName: string,
    isPublic: boolean
  ): Promise<Group> {
    try {
      const response: AxiosResponse<Group> = await axiosInstance.post(
        `${this.API_BASE_URL}/groups`,
        {
          name: groupName,
          isPublic,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error creating group:", error);
      throw error;
    }
  }

  static async toggleGroupPrivacy(groupId: string): Promise<void> {
    try {
      await axiosInstance.patch(
        `${this.API_BASE_URL}/groups/${groupId}/toggle-privacy`
      );
    } catch (error) {
      console.error("Error toggling group privacy:", error);
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
    const response = await axiosInstance.get("/api/chat");
    return response.data;
  } catch (error) {
    console.error("Error fetching chat data:", error);
  }
};

export { ChatApi };
