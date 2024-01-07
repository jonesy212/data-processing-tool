// ChatRoom.tsx
import DynamicTextArea from '@/app/ts/DynamicTextArea';
import React, { useEffect, useState } from 'react';
import ChatMessageData from './ChatRoomDashboard';

interface ChatRoomProps {
  roomId: string;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ roomId }) => {
  const [chatMessages, setChatMessages] = useState<ChatMessageData[]>([]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const messages = await fetchMessagesFromAPI();
        setChatMessages(messages);
      } catch (error) {
        console.error("Error fetching chat room messages:", error);
      }
    };

    fetchMessages();

    return () => {};
  }, [roomId]);

  const sendMessage = (message: string) => {
    console.log(`Sending message to room ${roomId}: ${message}`);
  };

  const fetchMessagesFromAPI = async (): Promise<ChatMessageData[]> => {
    return [];
  };

  return (
    <div>
      <h2>Chat Room {roomId}</h2>
      <div className="chat-messages">
        {chatMessages.map((message) => (
          <div key={message.id}>
            <p>{`${message.sender}: ${message.message}`}</p>
            <p>{`Timestamp: ${message.timestamp}`}</p>
          </div>
        ))}
      </div>
      <div className="chat-input">
        <DynamicTextArea
          value=""
          placeholder="Type your message..."
          onChange={(newText) => sendMessage(newText)}

        />
        <button onClick={() => sendMessage("Send")}>Send</button>
      </div>
    </div>
  );
};

export default ChatRoom;
