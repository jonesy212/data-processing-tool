import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';

const UserSearchPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const history = useHistory();

  const handleSearch = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      const response = await fetch(`/api/users/search?q=${searchQuery}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Add any other headers or authentication tokens if needed
        },
      });

      if (response.ok) {
        const results = await response.json();
        setSearchResults(results);
      } else {
        // Handle error response
        console.error('Error fetching search results');
      }
    } catch (error) {
      console.error('Error fetching search results', error);
    }
  };

  return (
    <div>
      <h2>User Search</h2>

      <form onSubmit={handleSearch}>
        <label htmlFor="searchQuery">Search Query:</label>
        <input
          type="text"
          id="searchQuery"
          name="q"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          required
        />
        <button type="submit">Search</button>
      </form>

      {/* Display search results here */}
      <div id="searchResults">
        {searchResults.map((user) => (
          <div key={user.id}>
            <p>ID: {user.id}</p>
            <p>Username: {user.username}</p>
            <p>Email: {user.email}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserSearchPage;
