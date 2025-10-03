import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the type for toolbar items
interface ToolbarItem {
  id: string;
  label: string;
  // Add more properties as needed
}

// Define the type for the context value
interface ToolbarItemsContextValue {
  toolbarItems: ToolbarItem[];
  addToolbarItemToContext: (item: ToolbarItem) => void;
  removeToolbarItemFromContext: (itemId: string) => void;
  updateToolbarItemInContext: (updatedItem: ToolbarItem) => void;
}

// Create a context to manage toolbar items
const ToolbarItemsContext = createContext<ToolbarItemsContextValue>({
  toolbarItems: [],
  addToolbarItemToContext: () => {},
  removeToolbarItemFromContext: () => {},
  updateToolbarItemInContext: () => {},
});

// Custom hook to access the toolbar items context
export const useToolbarItems = () => useContext(ToolbarItemsContext);

// Component to provide and manage toolbar items
export const ToolbarItemsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toolbarItems, setToolbarItems] = useState<ToolbarItem[]>([]);

  // Function to add a toolbar item to the context
  const addToolbarItemToContext = (item: ToolbarItem) => {
    setToolbarItems((prevItems) => [...prevItems, item]);
  };

  // Function to remove a toolbar item from the context
  const removeToolbarItemFromContext = (itemId: string) => {
    setToolbarItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
  };

  // Function to update a toolbar item in the context
  const updateToolbarItemInContext = (updatedItem: ToolbarItem) => {
    setToolbarItems((prevItems) =>
      prevItems.map((item) => (item.id === updatedItem.id ? updatedItem : item))
    );
  };

  // Create the context value object with updated contextValue
  const contextValue: ToolbarItemsContextValue = {
    toolbarItems,
    addToolbarItemToContext,
    removeToolbarItemFromContext,
    updateToolbarItemInContext,
  };

  return (
    <ToolbarItemsContext.Provider value={contextValue}>
      {children}
    </ToolbarItemsContext.Provider>
  );
};

export default ToolbarItemsContext;
