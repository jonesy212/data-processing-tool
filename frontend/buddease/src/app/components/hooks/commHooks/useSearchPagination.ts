// useSearchPagination.ts
import { useState } from 'react';

const useSearchPagination = (initialPage: number = 1, initialPageSize: number = 10) => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const changePageSize = (size: number) => {
    setPageSize(size);
  };

  const nextPage = () => {
    setCurrentPage((prevPage) => prevPage + 1);
  };

  const previousPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1)); // Ensure the page number does not go below 1
  };

    

  
  // Add more pagination logic as needed

  return { currentPage, pageSize, goToPage, changePageSize, nextPage, previousPage };
};

export default useSearchPagination;
