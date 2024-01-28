// usePagination.ts
import { useEffect, useState } from 'react';

interface PaginationData {
    items: any[]; // Change 'any' to the type of items returned by fetchData
    pages: number; // Change 'any' to the type of totalPages returned by fetchData
    total: number; // Change 'any' to the type of totalItems returned by fetchData
}
export const usePagination = (fetchData: (page: number, perPage: number, initialFilterCriteria?: any) => Promise<PaginationData>,
initialFilterCriteria?: any
) => {
    const [data, setData] = useState<any[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [totalItems, setTotalItems] = useState<number>(0);
    const [perPage, setPerPage] = useState<number>(10); // Default items per page
    const [filterCriteria, setFilterCriteria] = useState<any>(initialFilterCriteria);

    const fetchDataWithPagination = async (page: number) => {
        const fetchedData = await fetchData(page, perPage,filterCriteria);
        setData(fetchedData.items);
        setCurrentPage(page);
        setTotalPages(fetchedData.pages);
        setTotalItems(fetchedData.total);
    };

    useEffect(() => {
        fetchDataWithPagination(currentPage);
    }, [perPage, filterCriteria]); // Update data when perPage changes

    const goToPage = (page: number) => {
        if (page > 0 && page <= totalPages) {
            fetchDataWithPagination(page);
        }
    };

    const setItemsPerPage = (itemsPerPage: number) => {
        setPerPage(itemsPerPage);
    };


    const applyFilter = (newFilterCriteria: any) => {
        setFilterCriteria(newFilterCriteria);
        // Reset to the first page when applying a new filter
        goToPage(1);
    };


    return { data, currentPage, totalPages, totalItems, goToPage, setItemsPerPage, applyFilter };
};
