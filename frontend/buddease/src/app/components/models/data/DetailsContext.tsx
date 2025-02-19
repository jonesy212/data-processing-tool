import React, { Dispatch, ReactNode, SetStateAction, createContext, useContext, useState } from 'react';
import { DetailsItem } from '../../state/stores/DetailsListStore';
import { Data, BaseData } from './Data';
import { DocumentMetadata } from '@/app/components/state/stores/DocumentStore'
import { DocumentData } from '../../documents/DocumentBuilder';
import { DocumentContent } from '../CommonData';

// Define the shape of your context data
interface DetailsContextData {
  detailsData: DetailsItem<BaseData<DocumentData<T, K, Meta>, DocumentMetadata>>[]; // Use concrete types
  updateDetailsData: Dispatch<SetStateAction<DetailsItem<BaseData<DocumentData, DocumentMetadata>>[]>>;

}

// Create the context
const DetailsContext = createContext<DetailsContextData | undefined>(undefined);

// Create a provider component to wrap your application with
interface DetailsProviderProps {
  children: ReactNode;
}

export const DetailsProvider: React.FC<DetailsProviderProps> = ({ children }: DetailsProviderProps) => {
  // State to manage detailsData
  const [detailsData, setDetailsData] = useState<DetailsItem<Data<DocumentData, DocumentMetadata>>[]>([]);

  // Function to update detailsData
  const updateDetailsData: Dispatch<SetStateAction<DetailsItem<Data<DocumentData, DocumentMetadata>>[]>> = (callback) => {
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





const exampleDocument: DocumentContent<Data<DocumentData, DocumentMetadata>> = {
  eventId: "event123",
  content: {
    /* content structure here */
  },
  meta: {
    documentMetadata: {
      characterSet: "UTF-8",
      charset: "UTF-8",
      compatMode: "on",
      contentType: "text/html",
      cookie: "cookieString",
      designMode: "design",
      dir: "ltr",
      domain: "example.com",
      inputEncoding: "UTF-8",
      lastModified: "2024-11-06",
      linkColor: "#0000FF",
      referrer: "referrerInfo",
      vlinkColor: "#8A2BE2",
    },
  },
};
