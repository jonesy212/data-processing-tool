// ChatRoomContext.tsx
import React, { createContext, useContext, useState } from 'react';

// Define the context
interface ChatRoomContextProps {
  roomId: string;
  setRoomId: React.Dispatch<React.SetStateAction<string>>;
}

export const ChatRoomContext = createContext<ChatRoomContextProps | undefined>(undefined);

// Create a provider component
export const ChatRoomProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [roomId, setRoomId] = useState<string>("");

  return (
    <ChatRoomContext.Provider value={{ roomId, setRoomId }}>
      {children}
    </ChatRoomContext.Provider>
  );
};

// Custom hook to consume the context value
export const useChatRoom = () => {
  const context = useContext(ChatRoomContext);
  if (!context) {
    throw new Error('useChatRoom must be used within a ChatRoomProvider');
  }
  return context;
};
