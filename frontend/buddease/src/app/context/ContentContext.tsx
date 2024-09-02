import * as React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { ContentState } from 'draft-js';
import { StructuredMetadata } from '../configs/StructuredMetadata';
import * as contentApi from './../api/ApiContent';
import { endpoints } from '../api/endpointConfigurations';

interface ContentContextType {
  contentState: ContentState | null;
  fetchContentData: () => void;
  setContentState: (contentState: ContentState) => void;
  metadata: StructuredMetadata | null;
  url: string;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);
const CONTENT_API_URL = endpoints.content
export const ContentProvider: React.FC<{ children: React.ReactNode, url: string }> = ({ children, url}) => {
  const [contentState, setContentState] = useState<ContentState | null>(null);
  const [metadata, setMetadata] = useState<StructuredMetadata | null>(null);

  const fetchContentData = async () => {
    try {
      const contentId = await contentApi.getContentIdFromURL(url);
      const contentData = await contentApi.fetchContentDataFromAPI(contentId);
      
      if (contentData.contentState && contentData.contentId) {
        setContentState(contentData.contentState);
        setMetadata(await contentApi.getMetadataForContent(contentData.contentId, contentData.contentState));
      }
    } catch (error) {
      console.error('Error fetching content data:', error);
    }
  };

  useEffect(() => {
    fetchContentData();
  }, []); // Fetch data on component mount

  const value: ContentContextType = {
    contentState,
    fetchContentData,
    setContentState,
    metadata,
    url
  };

  return (
    <ContentContext.Provider value={value}>{children}</ContentContext.Provider>
  );
};

export const useContent = () => {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return context;
};
