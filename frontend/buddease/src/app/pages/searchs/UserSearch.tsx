import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const UserSearchPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const navigate = useNavigate(); // Use useNavigate to get the navigation function

  const handleSearch = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
       // Get the access token from localStorage
       const accessToken = localStorage.getItem('token');

      const response = await fetch(`/api/users/search?q=${searchQuery}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // Add any other headers or authentication tokens if needed
          Authorization: `Bearer ${accessToken}`,

        },
      });

      if (response.ok) {
        const results = await response.json();
        setSearchResults(results);

        // Example: Navigate to a dynamic route based on the first result
        if (results.length > 0) {
          const firstResult = results[0];
          navigate(`/user-details/${firstResult.id}`); // Replace with your desired dynamic route
        } else {
          // Handle case when there are no search results
          console.warn("No search results found.");
        }
      } else {
        // Handle error response
        console.error("Error fetching search results");
      }
    } catch (error) {
      console.error("Error fetching search results", error);
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
        {searchResults.map((user: { id: string, username: string, email: string }) => (
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
