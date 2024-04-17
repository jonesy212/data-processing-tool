import React, { useEffect, useState } from "react";
import { DappProps } from "../../web3/dAppAdapter/DAppAdapterConfig";
import { AquaConfig } from "../../web3/web_configs/AquaConfig";
import { AquaChat } from "./AquaChat";
import ChatInput from "./ChatInput";
import ChatNotification from "./ChatNotification";
import handleMessageSend from "./handleMessageSend"; // Import the handleMessageSend function
import useMessagingSystem from "./useMessagingSystem";
import ChatMessage from "./ChatMessage";

const ChatComponent: React.FC<{ dappProps: DappProps }> = ({ dappProps }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState<string | null>(null);
  const [inputMessage, setInputMessage] = useState<string>("");

  // Subscribe to the messaging system hook
  useMessagingSystem({
    onMessageReceived: (message: any) => {
      setNewMessage(message);
    },
  });

  // Function to add a new message to the chat
  const addMessage = (message: ChatMessage) => {
    // Update the state by adding the new message to the existing messages array
    setMessages([...messages, message]);
  };

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
      setMessages((prevMessages: ChatMessage[]) => [
        ...prevMessages,
        {
          id: "new Date",
          senderId: "bot",
          senderName: "Bot",
          content: newMessage,
          timestamp: new Date(),
          type: "text",
          status: "sent",
          sender: "", // Add missing sender property
          message: newMessage, // Add missing message property
          isRead: true, // Add missing isRead property
          messageType: "text", // Add missing messageType property
          user: {
            id: "user-id",
            name: "User Name",
          },
          // Add missing user property
        },
      ]);
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
            content={message.content} // Pass the content of the message
            roomId={""}
            sender={""}
            message={""}
            timestamp={new Date()} // Pass a Date object for the timestamp
            id={message.id}
            senderId={message.senderId}
            senderName={message.senderName}
            isRead={message.isRead}
            messageType={message.messageType}
            user= {message.user}
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
