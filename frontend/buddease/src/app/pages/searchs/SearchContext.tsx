// SearchContext.tsx
import React, { ReactNode, createContext, useContext, useState } from 'react';

interface SearchContextProps {
  searchQuery: string;
  contextSearchQuery: string; 
  updateSearchQuery: (query: string) => void;
}

const SearchContext = createContext<SearchContextProps | undefined>(undefined);

export const SearchProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const updateSearchQuery = (query: string) => {
    setSearchQuery(query);
  };

  const value: SearchContextProps = {
    searchQuery,
    updateSearchQuery,
    contextSearchQuery: searchQuery
  };

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
};

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};
