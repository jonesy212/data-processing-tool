import React, { useState, useEffect } from 'react';
import SearchComponent from '@/app/pages/searchs/SearchComponent';
import { searchDocuments, SearchResult } from '@/app/api/ApiDocument'; // Assuming SearchResult is the type of each item in searchResults
import useErrorHandling from '../hooks/useErrorHandling';
import LoadingSpinner from '../models/tracker/LoadingSpinner';

const SearchPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]); // Specify the type of searchResults as SearchResult[]
  const [loading, setLoading] = useState(false);
  const { error, handleError, clearError } = useErrorHandling();

  useEffect(() => {
    if (searchQuery) {
      performSearch(searchQuery);
    }
  }, [searchQuery]);

  const performSearch = async (query: string) => {
    try {
      setLoading(true);
      const results = await searchDocuments(query);
      setSearchResults(results);
      setLoading(false);
      clearError();
    } catch (error) {
      handleError("Failed to fetch search results. Please try again.");
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <div>
      <div className="search-container">
        <input
          type="text"
          id="searchInput"
          placeholder="Search..."
          onChange={(e) => handleSearch(e.target.value)}
        />
        <button id="searchButton">Search</button>
      </div>
      <LoadingSpinner loading={loading} />
      {error && <div>Error: {error}</div>}
      <div className="search-results">
        {searchResults.map((result, index) => (
          <div key={index}>
            <h3>{result.title}</h3>
            <p>{result.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchPage;
