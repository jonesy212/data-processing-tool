import React, { createContext, useContext, useState } from 'react';
import { openChatSidebar } from '../components/communications/chat/chatUtils';

// Define the type for the props of ChatSidebarProvider
type ChatSidebarProviderProps = {
  children: React.ReactNode;
};

// Create a context for managing the chat sidebar state
const ChatSidebarContext = createContext<{
  isChatSidebarOpen: boolean;
  openChatSidebar: (setIsChatSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>) => void;
}>({
  isChatSidebarOpen: false,
  openChatSidebar: () => {},
});

// Create a provider component to manage the chat sidebar state
export const ChatSidebarProvider = ({
  children,
}: ChatSidebarProviderProps) => {
  const [isChatSidebarOpen, setIsChatSidebarOpen] = useState(false);

  // Function to open the chat sidebar
  openChatSidebar(setIsChatSidebarOpen)

  // Value to be provided by the context
  const value = {
    isChatSidebarOpen,
    openChatSidebar,
  };

  return (
    <ChatSidebarContext.Provider value={value}>
      {children}
    </ChatSidebarContext.Provider>
  );
};

// Custom hook to consume the chat sidebar context
export const useChatSidebar = () => {
  const context = useContext(ChatSidebarContext);
  if (!context) {
    throw new Error('useChatSidebar must be used within a ChatSidebarProvider');
  }
  return context;
};
