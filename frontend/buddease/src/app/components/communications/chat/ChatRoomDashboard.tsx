// ChatRoomMessages.tsx
import React, { useEffect, useState } from "react";

interface ChatRoomMessageProps {
  roomId: string;
  limit: number;
}

interface ChatMessageData {
  id: number;
  sender: string;
  message: string;
  timestamp: string;
  content: string
}

export const ChatRoom: React.FC<ChatRoomMessageProps> = ({ roomId, limit }) => {
  const [chatMessages, setChatMessages] = useState<ChatMessageData[]>([]);

  useEffect(() => {
    const fetchChatRoomMessages = async () => {
      try {
        // Fetch chat messages using the provided roomId and limit
        const messages = [] as ChatMessageData[];
        setChatMessages(messages);
      } catch (error) {
        // Handle errors (e.g., network error, server error)
        console.error("Error fetching chat messages:", error);
      }
    };

    fetchChatRoomMessages();

    // Cleanup logic if needed
    return () => {
      // Any cleanup logic can go here
    };
  }, [roomId, limit]);

  return (
    <div>
      <h2>Chat Room Messages</h2>
      <div className="chat-messages">
        {chatMessages.map((message) => (
          <div key={message.id}>
            <p>{`${message.sender}: ${message.message}`}</p>
            <p>{`Timestamp: ${message.timestamp}`}</p>
          </div>
        ))}
      </div>
    </div>
  );
};



export default ChatMessageData