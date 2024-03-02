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

    

  
  // Add more pagination logic as needed

  return { currentPage, pageSize, goToPage, changePageSize };
};

export default useSearchPagination;
