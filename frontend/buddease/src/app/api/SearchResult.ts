// SearchResult.ts
import React, { useState, useEffect } from 'react';
import SearchResultItem from './SearchResultItem'; // Import the SearchResultItem component
import { searchDocumentAPI } from '@/app/api/ApiDocument'; // Import the searchDocumentAPI method

const SearchResult: React.FC = () => {
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
        <SearchResultItem key={index} result={result} />
      ))}
    </div>
  );
};

export default SearchResult;
