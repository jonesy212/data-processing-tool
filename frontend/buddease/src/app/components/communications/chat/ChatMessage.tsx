// ChatMessage.tsx
import axios, { AxiosResponse } from "axios";
import React, { Key, useEffect, useState } from "react";
import ChatCard from "../../cards/ChatCard";

export interface ChatMessage {
  [x: string]: Key | null | undefined;
  sender: string;
  message: string;
  timestamp: string;
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
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    // Fetch chat messages when the component mounts
    const fetchMessages = async () => {
      try {
        const messages = await fetchChatMessages(roomId, 10);

        // Map response to ChatMessage type
        const mappedMessages = messages.map((message: ChatMessageProps) => {
          return {
            sender: message.sender,
            message: message.message,
            timestamp: message.timestamp,
          };
        });

        setChatMessages(mappedMessages);
      } catch (error) {
        // Handle errors (e.g., network error, server error)
        console.error("Error fetching chat messages:", error);
      }
    };

    fetchMessages();

      
      
      
    // //   #todo impement event listeners cleanup into chat
    // const subscription = subscribeToChatUpdates(roomId);
    // const socket = connectToChatWebSocket(roomId);
    // const modal = openChatSettingsModal();
    // const request = sendChatMessage(message);
    // const editor = createRichTextEditor();
    // const notification = sendChatNotification(message);
    
    // const unreadCount = getUnreadMessageCount(roomId);
    // const emojiPicker = openEmojiPicker();
    // const sidebar = openChatSidebar();
    // const speechToTextEngine = initializeSpeechToText();
    // leaveChatRoom(roomId);
    // localStorage.removeItem('chatMessages');

 
      (roomId);
    // timers for auto-refresh or any periodic tasks, clear them during cleanup.
    const timerId = setInterval(() => {
        // Auto-refresh logic
    }, 5000)
    // Cleanup logic if needed
      return () => {
        // subscription.unsubscribe();
        // socket.disconnect();
        //   resetUnreadMessageCount(roomId);
        //   modal.close();
        //   request.cancel();
        //   editor.dispose();
        //   notification.clear();
        // const fileUploadModal = openFileUploadModal();
        // const geolocationService = initializeGeolocationService();
        // const settingsPanel = openChatSettingsPanel();


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
        
    // // 11. Disconnect from Real-time Chat Server
    // disconnectFromChatServer();

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

    };
  }, [roomId]);

  return (
    <div>
      <h2>Chat Dashboard</h2>
      <div className="chat-messages">
        {chatMessages.map((message) => (
          <ChatCard
            key={message.id} // Assuming id is a property of ChatMessage
            sender={message.sender}
            message={message.message}
            timestamp={message.timestamp}
          />
        ))}
      </div>
    </div>
  );
};

export default ChatMessage;
