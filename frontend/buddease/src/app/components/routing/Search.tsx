import { searchDocuments } from "@/app/api/ApiDocument"; // Assuming SearchResult is the type of each item in searchResults
import SearchComponent, {
  SearchComponentProps,
} from "@/app/pages/searchs/SearchComponent";
import React, { useEffect, useState } from "react";
import useErrorHandling from "../hooks/useErrorHandling";
import { SearchLogger } from "../logging/Logger";
import LoadingSpinner from "../models/tracker/LoadingSpinner";
import { userId } from "../users/ApiUser";
import SearchResult from "./SearchResult";
import { sanitizeInput } from "../security/SanitizationFunctions";
import { Entity } from "./FuzzyMatch";

const SearchPage: React.FC<SearchComponentProps> = ({
  componentSpecificData,
  documentData,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Entity[]>([]);
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
      const sanitizedQuery = sanitizeInput(query); // Sanitize the search query
      const results = await searchDocuments(sanitizedQuery);
      setSearchResults(results);
      setLoading(false);
      SearchLogger.logSearchResults(query, results.length, String(userId)); // Replace "userId" with actual user ID
      clearError();
    } catch (error: any) {
      handleError("Failed to fetch search results. Please try again.");
      // Log search error
      SearchLogger.logSearchError(query, error.message, String(userId)); // Replace "userId" with actual user ID

      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    SearchLogger.logSearch(query, userId);
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
          <SearchResult key={index} result={result} />
        ))}
        <SearchComponent
          componentSpecificData={searchResults.filter(
            (result) =>
              typeof result.source === "string" && result.source === "local"
          )}
          documentData={searchResults.filter(
            (result) => result.source === "global"
          )}
          searchQuery={searchQuery}
        />
      </div>
    </div>
  );
};

export default SearchPage;
