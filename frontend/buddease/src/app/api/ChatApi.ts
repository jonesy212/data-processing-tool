// ChatApi.ts
import { CalendarManagerState } from '@/app/state/redux/slices/CalendarSlice';
import { uiStore } from '@/app/components/state/stores/UIStore';
import axiosInstance from "@/app/api/csrfToken";
import { endpoints } from "@/app/api/endpointConfigurations";
import { ChatRoom } from '@/app/communications/ChatRoom'
import ChatMessage from "@/app/components/communications/chat/ChatMessage";
import Group from "@/app/components/communications/chat/Group";
import { PrivacySettings } from "@/app/settings/PrivacySettings";
import { User } from "@/app/users/User";
import { AxiosResponse } from "axios";
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { Attachment } from "@/app/documents/attachment/Attachment";

interface AudioOptions {
  microphone?: boolean;
  speakers?: boolean;
  volume?: number;
  noiseCancellation?: boolean;
  inputDevice?: string;
  outputDevice?: string;
  [key: string]: any; // for additional dynamic properties
}


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

  static async createGroup<
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(
    groupName: string,
    isPublic: boolean
  ): Promise<Group<User<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>> {
    try {
      const response: AxiosResponse<Group<User<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>> = await axiosInstance.post(
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

    uiStore.displayAudioOptionsModal(async (selectedOptions: AudioOptions) => {
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

  
  // Additional methods for ChatApi class
static async startVideoCall(roomId: string, participants: string[]): Promise<{ callId: string; joinUrl: string }> {
  try {
    const response = await axiosInstance.post(`${this.API_BASE_URL}/rooms/${roomId}/video-call`, {
      participants
    });
    return response.data;
  } catch (error) {
    console.error("Error starting video call:", error);
    throw error;
  }
}

static async startAudioCall(roomId: string, participants: string[]): Promise<{ callId: string; joinUrl: string }> {
  try {
    const response = await axiosInstance.post(`${this.API_BASE_URL}/rooms/${roomId}/audio-call`, {
      participants
    });
    return response.data;
  } catch (error) {
    console.error("Error starting audio call:", error);
    throw error;
  }
}

static async createProjectPhaseChannel(projectId: string, phaseName: string, members: string[]): Promise<ChatRoom> {
  try {
    const response = await axiosInstance.post(`${this.API_BASE_URL}/projects/${projectId}/phase-channels`, {
      phaseName,
      members
    });
    return response.data;
  } catch (error) {
    console.error("Error creating project phase channel:", error);
    throw error;
  }
}

static async getCryptoDiscussionGroups(): Promise<Group[]> {
  try {
    const response = await axiosInstance.get(`${this.API_BASE_URL}/groups/crypto`);
    return response.data;
  } catch (error) {
    console.error("Error fetching crypto discussion groups:", error);
    throw error;
  }
}

static async shareCryptoPortfolio(roomId: string, portfolioData: any): Promise<void> {
  try {
    await axiosInstance.post(`${this.API_BASE_URL}/rooms/${roomId}/share-portfolio`, {
      portfolioData
    });
  } catch (error) {
    console.error("Error sharing crypto portfolio:", error);
    throw error;
  }
}

static async brainstormIdeas(roomId: string, ideas: string[]): Promise<{ sessionId: string; ideas: any[] }> {
  try {
    const response = await axiosInstance.post(`${this.API_BASE_URL}/rooms/${roomId}/brainstorm`, {
      ideas
    });
    return response.data;
  } catch (error) {
    console.error("Error starting brainstorming session:", error);
    throw error;
  }
}

static async getCollaborationTools(roomId: string): Promise<any> {
  try {
    const response = await axiosInstance.get(`${this.API_BASE_URL}/rooms/${roomId}/collaboration-tools`);
    return response.data;
  } catch (error) {
    console.error("Error fetching collaboration tools:", error);
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
