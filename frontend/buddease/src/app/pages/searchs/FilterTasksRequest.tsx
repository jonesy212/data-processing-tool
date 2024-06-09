import useSearchPagination from '@/app/components/hooks/commHooks/useSearchPagination';
import useFiltering from '@/app/components/hooks/useFiltering';
import { usePagination } from '@/app/components/hooks/userInterface/usePagination';
import React from 'react';
import Filter from './Filter';
import { SearchOptions, SortingOption } from './SearchOptions';

// Define the type for the filter column
type FilterType = keyof SearchOptions['additionalOptions'];

interface FilterTasksRequestProps {
  options: SearchOptions; // Change the type of options to SearchOptions
  onSubmit: (filters: any[]) => void;
}

const FilterTasksRequest: React.FC<FilterTasksRequestProps> = async ({ onSubmit, options }) => {
  const { addFilter, handleSubmit /* Other necessary values */, filters } = useFiltering(options);
  // Use both pagination and search pagination hooks
  const { currentPage, pageSize, goToPage, changePageSize, nextPage, previousPage } = useSearchPagination();
  const fetchPageData = async (page: number, perPage: number, filterCriteria?: any) => {
    // Implement your data fetching logic here
    // Use page, perPage, and filterCriteria parameters to fetch data from API
    // Return the fetched data in PaginationData format
    return { items: [], pages: 0, total: 0 }; // Example return statement, replace with actual data
  };


  const { data, totalPages, totalItems, applyFilter } = usePagination(fetchPageData, filters);
  // Define the fetchData function to be used with usePagination hook

  const handleFilterChange = (
    column: FilterType,
    selectedOption: SearchOptions["additionalOptions"][FilterType]
  ) => {
    // Check if the selected column is for sorting
    if (column === "sorting") {
      // Cast the column to the correct type
      const sortingFilters = filters?.[0] as SearchOptions["additionalOptions"]["sorting"];
      // Ensure sortingFilters is not undefined
      if (sortingFilters && "field" in sortingFilters) {
        // Check if 'field' exists in sortingFilters
        // Call addFilter with the field property of sortingFilters
        addFilter(
          sortingFilters.field as keyof SearchOptions,
          "equal",
          !selectedOption
        );
      }
    } else if (column === "filters" || column === "pagination") {
      // Handle other special types of filters
      // Here, you can add logic for other special types of filters
    } else {
      // Handle regular filters
      addFilter(column, "equal", !selectedOption);
    }
  };
  
  

  return (
    <div>
      {/* Filter component */}
      <Filter
        label="Priority"
        options={['Low', 'Medium', 'High']}
        field= "priority"
        onChange={(selectedOption: SortingOption | undefined) =>
          handleFilterChange(
            "sorting",
            selectedOption
          )}
        
      />

      {/* Pagination controls */}
      <div>
        <button onClick={previousPage}>Previous</button>
        <span>{`Page ${currentPage} of ${totalPages}`}</span>
        <button onClick={nextPage}>Next</button>
        <select value={pageSize} onChange={(e) => changePageSize(Number(e.target.value))}>
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="50">50</option>
        </select>
      </div>
      
      {/* Submit button */}
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
};

export default FilterTasksRequest;
export type { FilterTasksRequestProps };
