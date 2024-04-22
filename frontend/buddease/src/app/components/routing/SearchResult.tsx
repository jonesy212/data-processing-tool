// SearchResult.tsx
import { searchDocumentAPI } from '@/app/api/ApiDocument'; // Import the searchDocumentAPI method
import ListGenerator from '@/app/generators/ListGenerator';
import React, { useEffect, useState } from 'react';
import SearchResultItem from '../models/data/SearchResultItem';
import FolderData from '../models/data/FolderData';
import { DocumentOptions } from '../documents/DocumentOptions';


interface SearchResultProps {
  result: {
    id: number;
    title: string;
    description: string;
    source: string;
    content: string;
    topics: string[];
    highlights: string[];
    keywords: string[];
    load: (content: any) => void;
    folders: FolderData[];
    options: DocumentOptions;
    folderPath: string;
    previousMetadata: any;
    currentMetadata: any;
    accessHistory: any[];
    lastModifiedDate: Date;
    searchHistory: any[];
    version: VersionData;
  };
}

const SearchResult: React.FC<SearchResultProps> = ({ result }) => {
  const [searchResults, setSearchResults] = useState<any[]>([]); // State to store search results
  const [loading, setLoading] = useState(false); // State to track loading status
  const [error, setError] = useState(""); // State to track errors

  useEffect(() => {
    // Perform search on component mount
    performSearch();
  }, []); // Empty dependency array to run effect only once on mount

  const performSearch = async () => {
    try {
      setLoading(true); // Set loading to true while fetching search results
      const results = await searchDocumentAPI("your_search_query_here"); // Replace "your_search_query_here" with the actual search query
      setSearchResults(results); // Update searchResults state with the fetched results
      setLoading(false); // Set loading to false after fetching
    } catch (error) {
      setError("Failed to fetch search results. Please try again."); // Set error message if search fails
      setLoading(false); // Set loading to false in case of error
    }
  };

  return (
    <div className="search-results">
      {loading && <div>Loading...</div>}
      {error && <div>Error: {error}</div>}
      {/* Display search results */}
      {searchResults.map((result, index) => (
        <div key={index}>
          {/* Check if items exist and if there are multiple items */}
          {result.items && result.items.length > 1 ? (
            // If there are multiple items, render a list
            <ListGenerator items={result.items} />
          ) : (
            // If there is only one item, render its details using SearchResultItem
            <SearchResultItem
              key={index}
              items={result.items}
              id={result.id}
              title={result.title}
              description={result.description}
              source={result.source}
              result={result}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default SearchResult;
