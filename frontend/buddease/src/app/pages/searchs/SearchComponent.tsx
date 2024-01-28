// Search.tsx
import { DocumentData } from "@/app/components/documents/DocumentBuilder";
import { getDefaultDocumentOptions } from "@/app/components/documents/DocumentOptions";
import React, { useEffect, useState } from "react";
import { useSearch } from "./SearchContext";

type DocumentDataPartial = Partial<DocumentData>;

// Simulated data for global search results (replace with actual data)
const globalSearchData = [
  {
    id: 1,
    title: "local result 1",
    description: "Description for local result 1",
    source: "local",
    highlights: ["highlighted phrases"],
  },
  {
    id: 2,
    title: "global result 2",
    description: "Description for global result 2",
    source: "global",
    highlights: ["highlighted phrases"],
  },
  // Add more data as needed
];

const globalDocumentData: DocumentDataPartial[] = [
  {
    ...getDefaultDocumentOptions(),
    id: 1,
    title: "Document 1",
    content: "Content for Document 1",
    highlights: ["highlighted phrase 1", "tagged item 2"],
  },
  // Add more document data as needed
];

export interface SearchComponentProps {
  documentData: DocumentData[];
}

export interface SearchComponentProps {
  componentSpecificData: {
    id: number;
    title: string;
    description: string;
    source: string; // a 'source' property to indicate the origin
  }[];
}

const SearchComponent: React.FC<SearchComponentProps> = ({
  componentSpecificData,
}) => {
  const [searchInput, setSearchInput] = useState("");
  const { searchQuery, updateSearchQuery } = useSearch();
  const [componentSearchResults, setComponentSearchResults] = useState<
    {
      id: number;
      title: string;
      description: string;
      source: string;
    }[]
  >([]);
  const [globalSearchResults, setGlobalSearchResults] = useState<
    {
      id: number;
      title: string;
      description: string;
      source: string;
      highlights: string[];
    }[]
  >([]);

  useEffect(() => {
    // Perform component-specific search when searchQuery changes
    const query = searchQuery.toLowerCase();
    const results = componentSpecificData.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
    );
    setComponentSearchResults(results);

    // Perform global search
    const globalResults = globalSearchData.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
    );
    setGlobalSearchResults(globalResults);
  }, [searchQuery, componentSpecificData]);

  const clearSearchResults = () => {
    setComponentSearchResults([]);
    setGlobalSearchResults([]);
  };

  const handleSearchClick = () => {
    updateSearchQuery(searchInput);
  };

  return (
    <div>
      <input
        type="text"
        id="searchInput"
        placeholder="Search..."
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
      />
      <button
        onClick={() => {
          handleSearchClick();
          clearSearchResults();
        }}
      >
        Search
      </button>

      <div className="search-results">
        <h2>Component-Specific Results</h2>
        {componentSearchResults.length === 0 ? (
          <p>No component-specific results found.</p>
        ) : (
          componentSearchResults.map((result) => (
            <div
              key={result.id.toString()}
              className={`search-result ${
                result.source === "component" ? "component-result" : ""
              }`}
            >
              <h3>{result.title}</h3>
              <p>{result.description}</p>
            </div>
          ))
        )}

        <h2>Global Results</h2>
        {globalSearchResults.length === 0 ? (
          <p>No global results found.</p>
        ) : (
          globalSearchResults.map((result) => (
            <div
              key={result.id.toString()}
              className={`search-result ${
                result.source === "component" ? "component-result" : ""
              }`}
            >
              <h3>{result.title}</h3>
              <p>{result.description}</p>
              <div>
                {result.highlights.map((highlight, index) => (
                  <span key={index} className="highlight">
                    {highlight}
                  </span>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SearchComponent;
