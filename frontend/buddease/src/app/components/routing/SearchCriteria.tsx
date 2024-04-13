import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../state/redux/slices/RootSlice";
import { debounce } from "@/app/pages/searchs/Debounce";
import { fuzzyMatchEntities } from "./FuzzyMatch";
import { Entity } from "../state/redux/slices/EntitySlice";
import { SearchLogger } from "../logging/Logger";
import { useParams } from "react-router-dom";
import { fetchUserData } from "@/app/api/UsersApi";
import userService from "../users/ApiUser";

const SearchCriteria: React.FC<{
  onUpdateCriteria: (criteria: string) => void;
}> = ({ onUpdateCriteria }) => {
  const [criteria, setCriteria] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Entity[]>([]);
  const dispatch = useDispatch();
  const entities = useSelector((state: RootState) => state.entityManager);

  // Function to perform fuzzy search with debounce
  const { userId } = useParams();
  const debouncedSearch = debounce(async (term: string) => {
    try {
      const matchedEntities = await fuzzyMatchEntities(
        term,
        Object.values(entities)
      );
      setSearchResults(matchedEntities);
      if (userId !== undefined) {
        // Log search results along with the user ID
        const fetchedUserId: string | undefined =
          await userService.fetchUserById(userId);
        if (fetchedUserId !== undefined) {
          // User ID is defined, proceed with logging
          SearchLogger.logSearchResults(
            term,
            matchedEntities.length,
            fetchedUserId
          );
        } else {
          // User ID is undefined, handle accordingly (e.g., provide a default value)
          SearchLogger.logSearchResults(
            term,
            matchedEntities.length,
            "Unknown"
          );
        }
      }
    } catch (error: any) {
      console.error("Error occurred while performing search:", error);
      // Log search error
      if (userId !== undefined) {
        SearchLogger.logSearchError(term, error.message, userId);
      }
    }
  }, 300);

  // Handle search term changes
  const handleSearchTermChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { value } = event.target;
    setSearchTerm(value);
    debouncedSearch(value);
    // Log search query
    if (userId !== undefined) {
      SearchLogger.logSearch(value, userId);
    }
  };

  const handleCriteriaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCriteria(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateCriteria(criteria);
  };

  // Dispatch action example (not used currently)
  const handleDispatchExample = () => {
    dispatch({ type: "EXAMPLE_ACTION" });
  };

  return (
    <div>
      <div>
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchTermChange}
          placeholder="Search..."
        />
        <div>
          {/* Render dynamic search results */}
          <ul>
            {searchResults.map((entity) => (
              <li key={entity.id}>{entity.name}</li>
            ))}
          </ul>
        </div>
      </div>
      <h2>Search Criteria</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="criteria">Enter Search Criteria:</label>
        <input
          type="text"
          id="criteria"
          value={criteria}
          onChange={handleCriteriaChange}
          placeholder="Enter search criteria..."
          required
        />
        <button type="submit">Search</button>
      </form>
      {/* Additional features specific to project management app */}
      <div>
        <h3>Additional Filters:</h3>
        {/* Filter by project phase */}
        <select>
          <option value="">All Phases</option>
          <option value="ideation">Ideation</option>
          <option value="team-creation">Team Creation</option>
          <option value="product-brainstorming">Product Brainstorming</option>
          <option value="product-launch">Product Launch</option>
          <option value="data-analysis">Data Analysis</option>
        </select>
        {/* Filter by team members */}
        <input type="text" placeholder="Filter by Team Member..." />
        {/* Filter by tags or categories */}
        <input type="text" placeholder="Filter by Tags or Categories..." />
        {/* Add more filters as needed */}

        {/* Use searchTerm and searchResults here */}
        <div>
          <p>Search Term: {searchTerm}</p>
          <p>Search Results: {searchResults.length}</p>
        </div>
      </div>

      {/* Utilize handleDispatchExample */}
      <button onClick={handleDispatchExample}>Dispatch Example Action</button>
    </div>
  );
};

export default SearchCriteria;
