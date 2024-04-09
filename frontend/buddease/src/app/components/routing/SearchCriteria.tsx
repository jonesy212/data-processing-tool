// SearchCriteria.tsx
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import DynamicComponent from "@/app/components/styling/DynamicComponents";
import { RootState } from '../state/redux/slices/RootSlice';
import { debounce } from '@/app/pages/searchs/Debounce';
import { fuzzyMatchEntities } from './FuzzyMatch';

const SearchCriteria: React.FC<{ onUpdateCriteria: (criteria: string) => void }> = ({ onUpdateCriteria }) => {
  const [criteria, setCriteria] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<typeof DynamicComponent[]>([]);
  const dispatch = useDispatch();



   // Retrieve entities from Redux store
   const entities = useSelector((state: RootState) => state.entitiesManager);

   // Function to perform fuzzy search with debounce
   const debouncedSearch = debounce(async (term: string) => {
     const matchedEntities = await fuzzyMatchEntities(term, entities);
     setSearchResults(matchedEntities);
   }, 300); // Adjust debounce delay as needed
 
   // Handle search term changes
   const handleSearchTermChange = (event: React.ChangeEvent<HTMLInputElement>) => {
     const { value } = event.target;
     setSearchTerm(value);
     debouncedSearch(value);
   };
  
  
  const handleCriteriaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCriteria(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateCriteria(criteria);
  };

  return (
    <div>
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
      </div>
    </div>
  );
};

export default SearchCriteria;
