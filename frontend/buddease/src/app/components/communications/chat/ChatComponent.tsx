import React, { useEffect, useState } from 'react';
import { DappProps } from '../../web3/dAppAdapter/DAppAdapterConfig';
import { AquaConfig } from '../../web3/web_configs/AquaConfig';
import { AquaChat } from './AquaChat';
import ChatInput from './ChatInput';
import ChatMessage from './ChatMessage';
import ChatNotification from './ChatNotification';
import handleMessageSend from './handleMessageSend'; // Import the handleMessageSend function
import useMessagingSystem from './useMessagingSystem';

const ChatComponent: React.FC<{ dappProps: DappProps }> = ({ dappProps }) => {
  const [messages, setMessages] = useState<string[]>([]);
  const [newMessage, setNewMessage] = useState<string | null>(null);
  const [inputMessage, setInputMessage] = useState<string>("");

  // Subscribe to the messaging system hook
  useMessagingSystem({
    onMessageReceived: (message: any) => {
      setNewMessage(message);
    },
  });

  
  const aquaChat = new AquaChat(dappProps.aquaConfig as AquaConfig);
  aquaChat.sendMessage(inputMessage);

  // Scroll to the latest message in the chat window
  const scrollToLatestMessage = () => {
    const chatWindow = document.getElementById("chat-window");
    if (chatWindow) {
      chatWindow.scrollTop = chatWindow.scrollHeight;
    }
  };

  // Effect to handle new messages
  useEffect(() => {
    if (newMessage) {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      // Optionally, you can scroll to the latest message in the chat window
      scrollToLatestMessage();
    }
  }, [newMessage]);

  // Handle message submission
  const handleSubmit = () => {
    // Prevent sending an empty message
    if (inputMessage.trim() !== "") {
      // Call the handleMessageSend function to send the message
      handleMessageSend(inputMessage, setInputMessage.bind(null, ""));
    }
  };

  // ... (rest of the ChatComponent logic)

  return (
    <div>
      <h2>Chat Component</h2>
      <div id="chat-window" className="chat-window">
        {messages.map((message, index) => (
          <ChatMessage
            key={index}
            content={message}
            roomId={""}
            sender={""}
            message={""}
            timestamp={""}
          />
        ))}
      </div>
      <ChatInput
        value={inputMessage}
        onChange={(e: any) => setInputMessage(e.target.value)}
        onSubmit={handleSubmit}
      />
      <ChatNotification content="New message received!" />
    </div>
  );
};

export default ChatComponent;