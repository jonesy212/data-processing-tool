// ChatRoom.tsx
import axiosInstance from '@/app/api/axiosInstance';
import Logger from '@/app/pages/logging/Logger';
import DynamicTextArea from '@/app/ts/DynamicTextArea';
import React, { useEffect, useState } from 'react';
import { useThemeConfig } from '../../hooks/userInterface/ThemeConfigContext';
import { setMessages } from '../../state/redux/slices/ChatSlice';
import connectToChatWebSocket, { retryConfig } from '../WebSocket';
import ChatMessageData from './ChatRoomDashboard';

interface ChatRoomProps {
  roomId: string;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ roomId }) => {
  const [chatMessages, setChatMessages] = useState<ChatMessageData[]>([]);
  const { primaryColor, fontSize } = useThemeConfig();

  useEffect(() => {


    const socket = connectToChatWebSocket(roomId, retryConfig);

    if (socket) {
      socket.addEventListener('message', (event) => {
        const newMessage = JSON.parse(event.data);
        setMessages((prevMessages: Messages) => [...prevMessages, newMessage]);
      });
    }

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

 
  const sendMessage = async (message: string) => {
    try {
      // Ensure the message is not empty
      if (!message.trim()) {
        console.warn("Cannot send an empty message.");
        return;
      }

      // Send the message to the server
      const response = await axiosInstance.post('/api/chat/send', {
        roomId,
        message,
      });

      // Check if the message was sent successfully
      if (response.status === 200) {

        console.log('Message sent successfully:', response.data);

        // Log chat message
        Logger.log("Chat", `Sending message to room ${roomId}: ${message}`, "uniqueID");
      } else {
        console.error('Failed to send message. Server response:', response);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };


  const fetchMessagesFromAPI = async (): Promise<ChatMessageData[]> => {
    return [];
  };

  return (
    <div style={{ borderColor: primaryColor, fontSize }}>
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
