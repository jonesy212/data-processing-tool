// ContentContext.tsx
import { createContext, useContext, useEffect, useState } from 'react';
import { ContentState } from 'draft-js'; // Assuming you're using Draft.js for content state
import { StructuredMetadata } from '../configs/StructuredMetadata';

interface ContentContextType {
  contentState: ContentState | null;
  fetchContentData: () => void;
  setContentState: (contentState: ContentState) => void;
  metadata: StructuredMetadata | null;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export const ContentProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [contentState, setContentState] = useState<ContentState | null>(null);
  const [metadata, setMetadata] = useState<StructuredMetadata | null>(null);


    
  // Example function to fetch content data (replace with your actual logic)
  const fetchContentData = async () => {
    // Replace with actual data fetching logic
    const contentData = await fetchContentDataFromApi();
    setContentState(contentData.contentState);
    setMetadata(getMetadataForContent(contentData.contentState));
  };

  useEffect(() => {
    fetchContentData();
  }, []); // Fetch data on component mount

  const value: ContentContextType = {
    contentState,
    fetchContentData,
    setContentState,
    metadata,
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
