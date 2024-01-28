import React, { Dispatch, ReactNode, SetStateAction, createContext, useContext, useState } from 'react';
import { DetailsItem } from '../../state/stores/DetailsListStore';

// Define the shape of your context data
interface DetailsContextData {
  detailsData: DetailsItem[];
  updateDetailsData: Dispatch<SetStateAction<DetailsItem[]>>;
}

// Create the context
const DetailsContext = createContext<DetailsContextData | undefined>(undefined);

// Create a provider component to wrap your application with
interface DetailsProviderProps {
  children: ReactNode;
}

export const DetailsProvider: React.FC<DetailsProviderProps> = ({ children }: DetailsProviderProps) => {
  // State to manage detailsData
  const [detailsData, setDetailsData] = useState<DetailsItem[]>([]);

  // Function to update detailsData
  const updateDetailsData: Dispatch<SetStateAction<DetailsItem[]>> = (callback) => {
    setDetailsData((prevData) => {
      if (typeof callback === 'function') {
        return callback([...prevData]);
      } else {
        return callback;
      }
    });
  };

  // Value object to be provided to consumers
  const value: DetailsContextData = {
    detailsData,
    updateDetailsData,
  };

  // Provide the context value to the entire application
  return <DetailsContext.Provider value={value}>{children}</DetailsContext.Provider>;
};

// Custom hook to consume the context
export const useDetailsContext = (): DetailsContextData => {
  const context = useContext(DetailsContext);

  if (!context) {
    throw new Error('useDetailsContext must be used within a DetailsProvider');
  }

  return context;
};
