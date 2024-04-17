// SearchBar.tsx
import React, { useState } from 'react';
import { userId } from '../users/ApiUser';

interface SearchBarProps {
  onSearch: (userId:  string, query:  string) => Promise<void>
  
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };
    
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleKeyPress(event);
    }
  };
  

  const handleSearch = () => {
    // Perform search action when the search button is clicked
    const user = userId !== undefined ? userId : undefined;
    if (user !== undefined) {
      onSearch(user, searchQuery);
    }

  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    // Perform search action when the Enter key is pressed
    if (event.key === 'Enter') {
      const user = userId !== undefined ? userId : undefined;
      if (user !== undefined) {
        onSearch(user, searchQuery);
      }
    }
    // Perform search on Enter key press
    handleSearch();
  };

  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="Search..."
        value={searchQuery}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        />
      <button onClick={handleSearch}>Search</button>
    </div>
  );
};

export default SearchBar;
