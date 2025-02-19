//CollaborationBoardStore.tsx
import React from "react";
import { createContext, useContext, useState } from 'react';

// Define the type for the context value
type CollaborationBoardContextType = {
  // Define your store properties and methods here
  boardData: any[]; // Example property
  addData: (data: any) => void; // Example method
};

// Create the context with initial values
const CollaborationBoardContext = createContext<CollaborationBoardContextType>({
  boardData: [],
  addData: () => {},
});

// Custom hook to access the CollaborationBoardContext
export const useCollaborationBoard = () => {
  return useContext(CollaborationBoardContext);
};

// CollaborationBoardStore component
export const CollaborationBoardStore: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State to store board data
  const [boardData, setBoardData] = useState<any[]>([]);

  // Method to add data to the board
  const addData = (data: any) => {
    setBoardData(prevData => [...prevData, data]);
  };

  // Value to be provided by the context
  const contextValue: CollaborationBoardContextType = {
    boardData,
    addData,
  };

  // Provide the context value to children components
  return (
    <CollaborationBoardContext.Provider value={contextValue}>
      {children}
    </CollaborationBoardContext.Provider>
  );
};
