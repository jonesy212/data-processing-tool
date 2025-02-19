import { uiStore } from './../components/state/stores/UIStore';
// ChatApi.ts
import { AxiosResponse } from "axios";
import { CalendarManagerState, ChatRoom } from "../components/calendar/CalendarSlice";
import ChatMessage from "../components/communications/chat/ChatMessage";
import Group from "../components/communications/chat/Group";
import { PrivacySettings } from "../components/settings/PrivacySettings";
import { User } from "../components/users/User";
import { endpoints } from "./ApiEndpoints";
import axiosInstance from "./axiosInstance";


class ChatApi {
  private static API_BASE_URL = endpoints.chat;

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
  ): Promise<Group<User>> {
    try {
      const response: AxiosResponse<Group<User>> = await axiosInstance.post(
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


  static async sendMessageToServer(roomId: string, message: string) {
    try {
      // Send the message to the server
      const response = await axiosInstance.post(`/api/chat/${roomId}/messages`, { message });
      return response.data;
    } catch (error) {
      console.error('Error sending message to server:', error);
      throw error;
    }
  }


  static async saveAudioOptionsToBackend(
    selectedOptions: { [key: string]: any },
    roomId: string,
    audioOptions: { [key: string]: any }
  ) {
    try {
      await axiosInstance.patch(`${this.API_BASE_URL}/rooms/${roomId}/audio-options`, {
        audioOptions: selectedOptions // Pass selectedOptions instead of audioOptions
      });
    } catch (error) {
      console.error('Error saving audio options to backend:', error);
    }
  }

  static async setPrivacySettings(roomId: string, privacySettings: { [key: string]: boolean }) { 
    try {
      await axiosInstance.patch(`${this.API_BASE_URL}/rooms/${roomId}/privacy-settings`, {
        privacySettings
      });
    } catch(error) {
      console.error('Error setting privacy settings:', error);
      throw error;
    }
  }



  static async savePrivacySettingsToBackend(
    videoId: string,
    selectedSettings: PrivacySettings,
    roomId: string,
    privacySettings: PrivacySettings
  ): Promise<void> {
    try {
      await axiosInstance.patch(`${this.API_BASE_URL}/rooms/${roomId}/privacy-settings`, {
        privacySettings,
        selectedSettings
      });
    } catch (error) {
      console.error('Error saving privacy settings to backend:', error);
      throw error;
    }
  }

  static fetchAudioOptions = async (
  roomId: string
    ) => { 
    try {
      const response = await axiosInstance.get(`${this.API_BASE_URL}/rooms/${roomId}/audio-options`);
      return response.data;
    } catch (error) {
      console.error("Error fetching audio options:", error);
      throw error;
    }
  }



  static displayAudioOptionsMenu = async (roomId: string) => {
    try {
      // Fetch audio options
      const audioOptions = await this.fetchAudioOptions(roomId);

      // Display modal
      uiStore.displayAudioOptionsModal(async (selectedOptions) => {
        await this.saveAudioOptionsToBackend(
          selectedOptions,
          roomId,
          audioOptions
        );
      });

    } catch (error) {
      console.error('Error displaying audio options menu:', error);
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
