// ChatMessage.tsx
import { ChatApi } from "@/app/api/ChatApi";
import { AquaConfig } from "@/app/components/web3/web_configs/AquaConfig";
import { Message } from "@/app/generators/GenerateChatInterfaces";
import UniqueIDGenerator from "@/app/generators/GenerateUniqueIds";
import GeolocationService from "@/app/services/GeolocationService";
import { openChatSettingsPanel } from "@/app/utils/ChatSettingsPanelUtils";
import { initializeGeolocationService } from "@/app/utils/GeolocationServiceUtils";
import axios, { AxiosResponse } from "axios";
import { EditorState } from "draft-js";
import React, { useEffect, useState } from "react";
import { ChatMessageActions } from "../../actions/ChatMessageActions";
import { useAuth } from "../../auth/AuthContext";
import ChatCard from "../../cards/ChatCard";
import { FileUploadModalProps } from "../../cards/modal/FileUploadModal";
import { subscriptionServiceInstance } from "../../hooks/dynamicHooks/dynamicHooks";
import useFiles from "../../hooks/useFiles";
import { UserRole } from "../../users/UserRole";
import UserRoles from "../../users/UserRoles";
import FluenceConnection from "../../web3/fluenceProtocoIntegration/FluenceConnection";
import connectToChatWebSocket, { retryConfig } from "../WebSocket";
import { AquaChat } from "./AquaChat";
import ChatSettings from "./ChatSettingsPanel";
import resetUnreadMessageCount from "./ResetUnreadMessageCount";
import {
    SidebarController,
    SpeechToTextEngine,
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
import clearChatAnalyticsData from "./features/clearChatAnalyticsData";
import clearChatImageCache from "./features/clearChatImageCache";
import clearChatSearchHistory from "./features/clearChatSearchHistory";
import clearDraftMessages from "./features/clearDraftMessages";
import { closeChatSettingsPanel } from "./features/closeChatSettingsPanel";
import disconnectFromChatServer from "./features/disconnectFromChatServer";
import { disposeGeolocationService } from "./features/disposeGeolocationServices";
import removeExpiredChatTokens from "./features/removeExpiredChatTokens";
import removeStaleChatSessions from "./features/removeStaleChatSessions";
import resetChatPreferences from "./features/resetChatPreferences";
import revokeMediaPermissions from "./features/revokeMediaPermissions";
import stopAnimatedEmoticons from "./features/stopAnimatedEmoticons";
import stopBackgroundChatAudio from "./features/stopBackgroundChatAudio";
import unsubscribeFromChatNotifications from "./features/unsubscribeFromChatNotifications";

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

interface ChatMessage {
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

// Define an interface for the props
interface EditorComponentProps {
  editorState: EditorState;
  // Add other props if needed
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

const ChatMessage: React.FC<ChatMessageProps> = ({ roomId }) => {
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isChatSidebarOpen, setIsChatSidebarOpen] = useState(false);
  // const { roomId } = useParams<{ roomId: string }>();

  const sendMessage = async () => {
    if (message.trim() === "") return;
    const userRole: UserRole | undefined = useAuth().user?.role;

    if (userRole === UserRoles.Administrator || userRole === UserRoles.Moderator) {
      sendChatMessage(roomId, message);
    } else {
      ChatMessageActions.sendMessage({ roomId, message });
    }
    const chatThreadId = UniqueIDGenerator.generateChatThreadID(roomId);
    const chatMessageId = UniqueIDGenerator.generateChatMessageID(chatThreadId);
    const newMessage: Message = {
      id: chatMessageId,
      text: message,
      senderId: "user",
      isOnline: true,
      lastSeen: new Date(),
      deletedAt: null,
      imageUrl: "",
      timestamp: new Date(),
      website: "",
      location: "",
      coverImageUrl: "",
      following: [],
      followers: [],
      sender: undefined,
      channel: undefined,
      channelId: undefined,
      content: "",
      tags: [],
      receiver: undefined,
      username: "",
      firstName: "",
      lastName: "",
      email: "",
      tier: "",
      token: null,
      uploadQuota: 0,
      avatarUrl: null,
      createdAt: undefined,
      updatedAt: undefined,
      fullName: null,
      isVerified: false,
      isAdmin: false,
      isActive: false,
      bio: null,
      userType: "",
      hasQuota: false,
      profilePicture: null,
      processingTasks: [],
      role: userRole || UserRoles.Guest,
      persona: null,
      friends: [],
      blockedUsers: [],
      settings: null,
      interests: [],
      privacySettings: undefined,
      notifications: undefined,
      activityLog: [],
      socialLinks: undefined,
      relationshipStatus: null,
      hobbies: [],
      skills: [],
      achievements: [],
      profileVisibility: "",
      profileAccessControl: undefined,
      activityStatus: "",
      isAuthorized: false,
      chatRooms: [],
      blockedBy: [],
    };

    setMessages([...messages, newMessage]);
    setMessage("");

    // Send message to server
    await ChatApi.sendMessageToServer(roomId, newMessage.text);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchMessages(String(roomId));
        await fetchUnreadCount(String(roomId));
        // Other asynchronous tasks
      } catch (error) {
        console.error("Error in useEffect:", error);
      }
    };

    fetchData();

    let geolocationService: GeolocationService | undefined;
    let settingsPanel: ChatSettings | undefined;

    const initialize = async () => {
      await fetchData();

      // Additional initialization tasks
      const modal = await openChatSettingsModal();
      const request = sendChatMessage(
        String(roomId),
        JSON.stringify(sampleMessage)
      );

      // Check if modal has a close method before calling it
      if (modal !== undefined && modal && typeof modal.close === "function") {
        modal.close();
      }
      // Clean up resources and return cleanup function
      return () => {
        // Clean up resources
      };
    };

    // const geolocationService = initializeGeolocationService();
    // Additional logic if needed
    const fetchUnreadCount = async (roomId: string) => {
      const count = await getUnreadMessageCount(roomId);
      // Use unreadCount here directly
      console.log("Unread message count:", count);

    };

    // Run this effect once when the component mounts
    const fetchMessages = async (roomId: string) => {
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

    fetchMessages(String(roomId));

    //#todo impement event listeners cleanup into chat
    subscriptionServiceInstance.subscribe("chat_updates_" + roomId, (message: any) => {
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
        name: "User Name",
      },
    };

    // Handle unread message count reset

    //todo verify which editor and notification to use

    const socket = connectToChatWebSocket(roomId, retryConfig);
    // let modal: ChatSettingsModal | undefined = await openChatSettingsModal();
    const request: CancellablePromise<void> = sendChatMessage(
      String(roomId),
      JSON.stringify(sampleMessage)
    );
    let notification: ChatNotification | undefined;
    let editorState: EditorState | undefined;

    // Call createRichTextEditor to get the editor component
    const editorComponent: React.ReactElement<EditorComponentProps> =
      createRichTextEditor();
    // const notification = sendChatNotification(sampleMessage.message);
    const unreadCount = getUnreadMessageCount(String(roomId));
    const emojiPicker = openEmojiPicker();
    const sidebar: SidebarController | undefined = openChatSidebar(
      setIsChatSidebarOpen
    ) as SidebarController | undefined;

    // Call initializeSpeechToText() to get the speech-to-text engine
    const speechToTextEngine: SpeechToTextEngine | undefined =
      initializeSpeechToText() as SpeechToTextEngine | undefined;
    leaveChatRoom(String(roomId));
    localStorage.removeItem("chatMessages");

    // roomId;
    // timers for auto-refresh or any periodic tasks, clear them during cleanup.
    const timerId = setInterval(() => {
      // Auto-refresh logic
    }, 5000);
    // // Cleanup logic if needed

    fetchData();

    initialize();

    return () => {
      subscriptionServiceInstance.unsubscribe("chat_updates_" + roomId, "");
      socket?.close();
      resetUnreadMessageCount(String(roomId));

      // Check if request is a Promise with a cancel method before calling it
      if (request instanceof Promise && typeof request.cancel === "function") {
        request.cancel();
      }

      // Check if editor is defined and has a dispose method before calling it
      // If the returned component is a ReactElement, extract the EditorState from it
      if (React.isValidElement(editorComponent)) {
        // Extract the editorState from the props
        editorState = editorComponent.props.editorState;
      }

      // Check if notification is defined and has a clear method before calling it
      if (
        notification !== undefined &&
        notification &&
        typeof notification.clear === "function"
      ) {
        notification.clear();
      }

      let fileUploadModal: FileUploadModalProps | undefined;
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
          chat_id: String(roomId),
        },
        chatImageUploadUrlParams: {
          chat_id: String(roomId),
        },
        chatImageDownloadUrl: "chat-image-download-url",
        chatImageDownloadHeaders: {
          "Content-Type": "application/json",
        },
        chatImageDownloadParams: {
          chat_id: String(roomId),
        },
        chatImageDownloadUrlParams: {
          chat_id: String(roomId),
        },
        chatImageCacheUrl: "chat-image-cache-url",
        chatImageCacheHeaders: {
          "Content-Type": "application/json",
        },
        chatImageCacheParams: {
          chat_id: String(roomId),
        },
        apiUrl: "",
        maxConnections: 0,
        timeout: 0,
        secureConnection: false,
        reconnectAttempts: 0,
        autoReconnect: false,
      };

      const aquaChat = new AquaChat(aquaConfig);
      const fluenceConnection = new FluenceConnection();
      const currentUser = useAuth().state.user;
      // Use the useFiles hook to manage file upload state

      const { files, handleFileUpload } = useFiles();

      const handleFileUploadClick = () => {
        if (handleFileUpload) {
          openFileUploadModal(handleFileUpload);
        } else {
          console.error("handleFileUpload function is not defined");
        }
        // Additional logic if needed
      };

      // Define a map to track typing indicators for each room
      const typingIndicators: Map<string, string[]> = new Map();

      // Function to remove a user from typing indicators in a specific room
      const removeUserFromTypingIndicators = (
        roomId: string,
        currentUser: string | null
      ) => {
        // Retrieve the typing indicators for the specified room
        const usersTyping = typingIndicators.get(roomId);

        // If there are users typing in the room
        if (usersTyping) {
          // Remove the current user from the list of users typing
          const updatedUsersTyping = usersTyping.filter(
            (user) => user !== currentUser
          );

          // Update the typing indicators for the room
          typingIndicators.set(roomId, updatedUsersTyping);

          console.log(
            `User ${currentUser} removed from typing indicators in room ${roomId}`
          );
        } else {
          console.log(`No typing indicators found for room ${roomId}`);
        }
      };

      // 1. Clear Cache for Chat Images
      clearChatImageCache();

      // 2. Close Emoji Picker
      emojiPicker?.close();

      // 3. Revoke Media Permissions
      revokeMediaPermissions();

      // 4. Stop Background Audio
      stopBackgroundChatAudio();

      // 5. Clear Draft Messages
      clearDraftMessages(String(roomId));

      // 6. Close Chat Sidebar
      sidebar?.close();

      // 7. Reset Chat Preferences
      resetChatPreferences();

      // 8. Dispose of Speech-to-Text Engine
      speechToTextEngine?.dispose();

      // 9. Remove User from Typing Indicators
      if (currentUser !== null) {
        removeUserFromTypingIndicators(String(roomId), String(currentUser));
      }

      // 10. Clear Chat Analytics Data
      clearChatAnalyticsData();

      // 11. Clear Interval Timer
      clearInterval(timerId);
      // Any cleanup logic can go here

      // 11. Disconnect from Real-time Chat Server
      disconnectFromChatServer(fluenceConnection, aquaChat);

      // Check if files is not null before calling openFileUploadModal
      if (files !== null) {
        openFileUploadModal((files: FileList | null) => {
          // Do something with files if needed
          console.log("File upload modal opened");
        });
      } else {
        console.error("Files are null");
      }

      // 13. Unsubscribe from Chat Notifications
      unsubscribeFromChatNotifications();

      // 14. Reset Unread Message Count
      resetUnreadMessageCount(String(roomId));

      // 15. Remove Expired Chat Tokens
      removeExpiredChatTokens();

      // 16. Stop Animated Emoticons
      stopAnimatedEmoticons();

      // 17. Clear Chat Search History
      clearChatSearchHistory();

      // 18. Dispose of Geolocation Services
      disposeGeolocationService();

      // 19. Close Chat Settings Panel
      closeChatSettingsPanel();

      // 20. Remove Stale Chat Sessions
      removeStaleChatSessions();
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
      <div>
        {messages.map((message) => (
          <div key={message.id}>
            <span>{message.text}</span>
          </div>
        ))}
      </div>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default ChatMessage;
