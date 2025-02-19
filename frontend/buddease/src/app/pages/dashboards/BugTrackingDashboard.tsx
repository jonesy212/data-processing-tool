// BugTrackingDashboard.tsx

import { useEffect } from 'react';
import React from'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBugData } from '../../api/api'; // Function to fetch bug data from API
import BugFilter from './BugFilter';
import BugSort from './BugSort';
import BugTable from './BugTable';
import useErrorHandling from '@/app/components/hooks/useErrorHandling';
import { usePagination } from '@/app/components/hooks/userInterface/usePagination';
import useSearchPagination from '@/app/components/hooks/commHooks/useSearchPagination';
import { RootState } from '@/app/components/state/redux/slices/RootSlice';



const BugTrackingDashboard = () => {
  const { data, currentPage, totalPages, totalItems, goToPage, setItemsPerPage, applyFilter } = usePagination(fetchBugData);
  const { currentPage: searchCurrentPage, pageSize, goToPage: searchGoToPage, changePageSize } = useSearchPagination();
  const { error, handleError, clearError } = useErrorHandling();

  const dispatch = useDispatch();
  const filteredEvents = useSelector((state: RootState) => state.filterManager.filteredEvents); // Get filtered events from Redux store

  // Fetch bug data when component mounts
  useEffect(() => {
    fetchData(currentPage);
  }, [currentPage]);

  // Function to fetch bug data
  const fetchData = async (page) => {
    try {
      const bugData = await fetchBugData(page);
      // Update bug data
      setBugs(bugData);
    } catch (error: any) {
      handleError('Error fetching bug data: ' + error.message);
    }
  };

  // Function to handle filter changes
  const handleFilterChange = (newFilters) => {
    applyFilter(newFilters);
    // Optionally, you can fetch filtered bug data here
  };




// Function to handle sort changes
const handleSortChange = (newSortOptions) => {
  // Implement robust sort logic here

  const { sortBy, sortOrder } = newSortOptions;

  // Copy the bugs array to avoid mutating the original data
  const sortedBugs = [...bugs];

  // Define a custom sorting function based on the data type of the sortBy property
  const customSortFunction = (a, b) => {
    let comparison = 0;

    // Handle sorting for different data types
    if (typeof a[sortBy] === 'string') {
      comparison = a[sortBy].localeCompare(b[sortBy]);
    } else if (typeof a[sortBy] === 'number') {
      comparison = a[sortBy] - b[sortBy];
    } else if (typeof a[sortBy] === 'boolean') {
      comparison = a[sortBy] === b[sortBy] ? 0 : a[sortBy] ? 1 : -1;
    } else if (Array.isArray(a[sortBy])) {
      // Handle sorting for arrays (e.g., sorting by array length)
      comparison = a[sortBy].length - b[sortBy].length;
    } else if (a[sortBy] instanceof Date) {
      // Handle sorting for dates
      comparison = a[sortBy] - b[sortBy];
    }
    
    // Adjust comparison based on sort order
    return sortOrder === 'asc' ? comparison : -comparison;
  };

  // Perform sorting using the custom sorting function
  sortedBugs.sort(customSortFunction);

  // Update the bugs state with the sorted array
  setBugs(sortedBugs);
};


  // Render error message if error exists
  const renderError = () => {
    if (error) {
      return <div>Error: {error}</div>;
    }
    return null;
  };

  return (
    <div>
      <h1>Bug Tracking Dashboard</h1>
      {renderError()}
      <BugFilter
        filters={filters}
        onChange={handleFilterChange}
      />
      <BugSort
        sortOptions={sortOptions}
        onChange={handleSortChange} 
        />
      <BugTable
        bugs={bugs}
        onBugClick={handleBugClick}
      />
    </div>
  );
};

export default BugTrackingDashboard;
