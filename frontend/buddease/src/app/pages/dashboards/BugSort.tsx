// BugSort.tsx
import React from 'react';

interface BugSortProps {
    sortOptions: {
      sortBy: string;
      sortOrder: string;
      sortContentBy: string; // Add sortContentBy property
    };
    onSortChange: (sortOptions: {
      sortBy: string;
      sortOrder: string;
      sortContentBy: string; // Add sortContentBy property
    }) => void;
}

const BugSort: React.FC<BugSortProps> = ({ sortOptions, onSortChange }) => {
  const handleSortChange = (e: any) => {
    const { name, value } = e.target;
    const newSortOptions = { ...sortOptions, [name]: value };
    onSortChange(newSortOptions);
  };

  return (
    <div>
      <h3>Sort Bugs</h3>
      <label>
        Sort By:
        <select name="sortBy" value={sortOptions.sortBy || ''} onChange={handleSortChange}>
          <option value="id">ID</option>
          <option value="title">Title</option>
          <option value="status">Status</option>
          <option value="assignedTo">Assigned To</option>
        </select>
      </label>
      <label>
        Sort Order:
        <select name="sortOrder" value={sortOptions.sortOrder || ''} onChange={handleSortChange}>
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </label>
      <label>
        Sort Content By: {/* New select for sorting content */}
        <select name="sortContentBy" value={sortOptions.sortContentBy || ''} onChange={handleSortChange}>
          <option value="severity">Severity</option>
          <option value="createdAt">Created At</option>
          {/* Add more options as needed */}
        </select>
      </label>
    </div>
  );
};

export default BugSort;
