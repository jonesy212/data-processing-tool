import React, { useState } from 'react';

// Simulated data for search results (replace with actual data)
const searchData = [
  { id: 1, title: 'Result 1', description: 'Description for Result 1' },
  { id: 2, title: 'Result 2', description: 'Description for Result 2' },
  // Add more data as needed
];

const SearchComponent: React.FC = () => {
  const [searchInput, setSearchInput] = useState("");
  const [searchResults, setSearchResults] = useState<
    {
      id: number;
      title: string;
      description: string;
    }[]
  >([]);

  const performSearch = () => {
    const query = searchInput.toLowerCase();
    const results = searchData.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
    );

    setSearchResults(results);
  };

  const clearSearchResults = () => {
    setSearchResults([]);
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
      <button onClick={performSearch}>Search</button>

      <div className="search-results">
        {searchResults.length === 0 ? (
          <p>No results found.</p>
        ) : (
          searchResults.map((result) => (
            <div key={result.id} className="search-result">
              <h3>{result.title}</h3>
              <p>{result.description}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SearchComponent;
