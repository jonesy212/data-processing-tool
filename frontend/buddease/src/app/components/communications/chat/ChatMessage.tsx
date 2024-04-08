// ChatMessage.tsx
import { AquaConfig } from '@/app/components/web3/web_configs/AquaConfig';
import { openChatSettingsPanel } from "@/app/utils/ChatSettingsPanelUtils";
import { initializeGeolocationService } from "@/app/utils/GeolocationServiceUtils";
import axios, { AxiosResponse } from "axios";
import React, { useEffect, useState } from "react";
import ChatCard from "../../cards/ChatCard";
import { subscriptionService } from "../../hooks/dynamicHooks/dynamicHooks";
import FluenceConnection from "../../web3/fluenceProtocoIntegration/FluenceConnection";
import connectToChatWebSocket, { retryConfig } from "../WebSocket";
import { AquaChat } from "./AquaChat";
import resetUnreadMessageCount from "./ResetUnreadMessageCount";
import {
  createRichTextEditor,
  getUnreadMessageCount,

  initializeSpeechToText,
  leaveChatRoom,
  openChatSettingsModal,

  openChatSidebar,
  openEmojiPicker,
  openFileUploadModal,
  sendChatMessage,
} from "./chatUtils";
import disconnectFromChatServer from "./features/disconnectFromChatServer";

type ChatSettingsModal = {
  close?: () => void;
  // other properties and methods specific to the modal
};

// Update similar types for editor and notification if needed
type ChatEditor = {
  dispose?: () => void;
  // other properties and methods specific to the editor
};

type ChatNotification = {
  clear?: () => void;
  // other properties and methods specific to the notification
};

export interface ChatMessage {
  id: string; // Unique identifier for the message
  sender: string;
  message: string;
  senderId: string; // Unique identifier for the message sender
  senderName: string; // Display name of the message sender
  content: string; // The text content of the message
  timestamp: Date; // Timestamp when the message was sent
  isRead: boolean; // Flag indicating whether the message has been read
  messageType: string; // Optional type for the message e.g. "text", "image" etc
  user: {
    id: string;
    name: string;
  };
  // Add more properties based on your requirements
}

interface CancellablePromise<T> extends Promise<T> {
  cancel?: () => void;
  close?: () => void;
}

export interface ChatMessageProps extends ChatMessage {
  roomId: string;
}

// Define the API endpoint for fetching chat messages
const CHAT_API_ENDPOINT = "https://example.com/api/chat/messages";

/**
 * Fetches chat messages from the server.
 * @param roomId - The ID of the chat room.
 * @param limit - The maximum number of messages to fetch.
 * @returns A promise that resolves with the fetched chat messages.
 */
const fetchChatMessages = async (
  roomId: string,
  limit: number
): Promise<ChatMessageProps[]> => {
  try {
    // Make a GET request to the chat API endpoint
    const response: AxiosResponse<ChatMessageProps[]> = await axios.get(
      CHAT_API_ENDPOINT,
      {
        params: { roomId, limit },
      }
    );

    // Return the fetched chat messages
    return response.data;
  } catch (error) {
    // Handle errors (e.g., network error, server error)
    console.error("Error fetching chat messages:", error);
    throw error;
  }
};

// Subscribe to new chat messages
const ChatMessage: React.FC<ChatMessageProps> = ({ roomId,  }) => {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    const geolocationService = initializeGeolocationService();
  // Additional logic if needed

  // Run this effect once when the component mounts
    const fetchMessages = async () => {
      try {
        const messages = await fetchChatMessages(roomId, 10);

        // Map response to ChatMessage type
        const mappedMessages = messages.map((message: ChatMessageProps) => {
          return {
            sender: message.sender,
            message: message.message,
            timestamp: message.timestamp,
          } as ChatMessage;
        });

        setChatMessages(mappedMessages);
      } catch (error) {
        console.error("Error fetching chat messages:", error);
      }
    };

    fetchMessages();

    //#todo impement event listeners cleanup into chat
    subscriptionService.subscribe("chat_updates_" + roomId, (message: any) => {
      // Handle new message
      const newMessage = JSON.parse(message);

      setChatMessages((prevMessages) => {
        return [newMessage, ...prevMessages];
      });
      return newMessage;
    });

    const sampleMessage: ChatMessageProps = {
      id: "some-id",
      sender: "Sender Name",
      message: "Hello, this is a chat message!",
      senderId: "sender-id",
      senderName: "Sender Name",
      content: "Some content",
      timestamp: new Date(Date.now()),
      isRead: false,
      roomId: "room-id",
      messageType: "text",
      user: {
        id: "user-id",
        name: "User Name"
      }
    };

    // Handle unread message count reset

    //todo verify which editor and notification to use

    const socket = connectToChatWebSocket(roomId, retryConfig);
    let modal: ChatSettingsModal | undefined = openChatSettingsModal();
    const request: CancellablePromise<void> = sendChatMessage(
      sampleMessage.message
    );
    // let editor: ChatEditor | undefined;
    let notification: ChatNotification | undefined;
    let editor = createRichTextEditor();
    // const notification = sendChatNotification(sampleMessage.message);
    const unreadCount = getUnreadMessageCount(roomId);
    const emojiPicker = openEmojiPicker();
    const sidebar = openChatSidebar();
    const speechToTextEngine = initializeSpeechToText();
    leaveChatRoom(roomId);
    localStorage.removeItem("chatMessages");

    roomId;
    // timers for auto-refresh or any periodic tasks, clear them during cleanup.
    const timerId = setInterval(() => {
      // Auto-refresh logic
    }, 5000);
    // Cleanup logic if needed
    return () => {
      subscriptionService.unsubscribe("chat_updates_" + roomId);
      socket!.close();
      resetUnreadMessageCount(roomId);

      // Check if modal has a close method before calling it
      
      if (modal !== undefined && typeof modal.close === "function") {
        modal.close();
      }

      // Check if request is a Promise with a cancel method before calling it
      if (request instanceof Promise && typeof request.cancel === "function") {
        request.cancel();
      }

      // Check if editor has a dispose method before calling it
      // Check if editor has a dispose method before calling it
      if (editor && typeof (editor as ChatEditor).dispose === "function") {
        editor.props.dispose();
      }

      // Check if notification is defined and has a clear method before calling it
      if (
        notification !== undefined &&
        notification &&
        typeof notification.clear === "function"
      ) {
        notification.clear();
      }
      const fileUploadModal = openFileUploadModal();
      const geolocationService = initializeGeolocationService();
      const settingsPanel = openChatSettingsPanel();
      const aquaConfig: AquaConfig = {
        appId: "app-id",
        appSecret: "app-secret",
        relayUrl: "relay-url",
        relayToken: "relay-token",
        chatToken: "chat-token",
        chatUrl: "chat-url",
        chatWebsocketUrl: "chat-websocket-url",
        chatImageUploadUrl: "chat-image-upload-url",
        chatImageUploadHeaders: {
          "Content-Type": "application/json",
        },
        chatImageUploadParams: {
          chat_id: roomId,
        },
        chatImageUploadUrlParams: {
          chat_id: roomId,
        },
        chatImageDownloadUrl: "chat-image-download-url",
        chatImageDownloadHeaders: {
          "Content-Type": "application/json",
        },
        chatImageDownloadParams: {
          chat_id: roomId,
        },
        chatImageDownloadUrlParams: {
          chat_id: roomId,
        },
        chatImageCacheUrl: "chat-image-cache-url",
        chatImageCacheHeaders: {
          "Content-Type": "application/json",
        },
        chatImageCacheParams: {
          chat_id: roomId,
        },
        apiUrl: '',
        maxConnections: 0,
        timeout: 0,
        secureConnection: false,
        reconnectAttempts: 0,
        autoReconnect: false
      }


      
      const aquaChat = new AquaChat(aquaConfig)
      const fluenceConnection = new FluenceConnection
      const handleFileUploadClick = () => {
        const fileUploadModal = openFileUploadModal();
        // Additional logic if needed
      };



      
      //   // 1. Clear Cache for Chat Images
      //     clearChatImageCache();

      //     // 2. Close Emoji Picker
      //     emojiPicker.close();

      //     // 3. Revoke Media Permissions
      //     revokeMediaPermissions();

      //     // 4. Stop Background Audio
      //     stopBackgroundChatAudio();

      //     // 5. Clear Draft Messages
      //     clearDraftMessages(roomId);

      //     // 6. Close Chat Sidebar
      //     sidebar.close();

      //     // 7. Reset Chat Preferences
      //     resetChatPreferences();

      //     // 8. Dispose of Speech-to-Text Engine
      //     speechToTextEngine.dispose();

      //     // 9. Remove User from Typing Indicators
      //     removeUserFromTypingIndicators(roomId, currentUser);

      //     // 10. Clear Chat Analytics Data
      //   clearChatAnalyticsData();

      //   // 11. Clear Interval Timer
      //   clearInterval(timerId);
      //   // Any cleanup logic can go here

      // 11. Disconnect from Real-time Chat Server
      disconnectFromChatServer(fluenceConnection, aquaChat)

      // // 12. Close File Upload Modal
      // fileUploadModal.close();

      // // 13. Unsubscribe from Chat Notifications
      // unsubscribeFromChatNotifications();

      // // 14. Reset Unread Message Count
      // resetUnreadMessageCount(roomId);

      // // 15. Remove Expired Chat Tokens
      // removeExpiredChatTokens();

      // // 16. Stop Animated Emoticons
      // stopAnimatedEmoticons();

      // // 17. Clear Chat Search History
      // clearChatSearchHistory();

      // // 18. Dispose of Geolocation Services
      // geolocationService.dispose();

      // // 19. Close Chat Settings Panel
      // settingsPanel.close();

      // // 20. Remove Stale Chat Sessions
      // removeStaleChatSessions();
      localStorage.setItem("chatMessages", JSON.stringify(chatMessages));
    };
  }, [roomId]);

  // Rest of component

  return (
    <div>
      <h2>Chat Dashboard</h2>
      <div className="chat-messages">
        {chatMessages.map((message) => (
          <ChatCard
            key={message.id}
            sender={message.senderId}
            message={message.message}
            timestamp={String(message.timestamp)}
          />
        ))}
      </div>
    </div>
  );
};

export default ChatMessage;
