// useFiltering.ts
import { SearchOptions } from '@/app/pages/searchs/SearchOptions';
import { useState } from 'react';

// Reusable filtering logic
function useFiltering(options: SearchOptions) {
  const [filters, setFilters] = useState<SearchOptions['additionalOptions']>({});
  const [transform, setTransform] = useState("none");

  const addFilter = (
    column: keyof SearchOptions,
    operation: 'equal' | 'notEqual' | 'contains' | 'notContains',
    value: string | number | boolean
  ) => {
    // Logic to add filter
    // Example: 
    setFilters((prevFilters) => ({ ...prevFilters, [column]: { operation, value } }));
  };

  const handleSubmit = () => {
    // Logic to handle form submission
    // Example: onSubmit(filters, transform);
  };

  // Other filtering logic...

  return { addFilter, handleSubmit, filters, transform, setTransform };
}
export default useFiltering;