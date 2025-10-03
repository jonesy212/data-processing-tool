import { HeadersConfig } from '@/app/api/headers/HeadersConfig';
import { headersConfig } from '@/app/components/shared/SharedHeaders';
import React from "react";

interface Header {
  key: string;
  label: string;
}

interface TableHeaders {
  headers: Header[];
  onSort: (key: string) => void;
  headersConfig: HeadersConfig
}

const SortableTableHeaders: React.FC<TableHeaders> = ({ headers, onSort }) => {
  const handleSort = (key: string) => {
    // Example of using headersConfig when making API requests
    fetch("example.com/api/data", {
      method: "GET",
      headers: headersConfig, // Pass headersConfig to the fetch request
    })
      .then((response) => response.json())
      .then((data) => console.log(data))
      .catch((error) => console.error("Error:", error));
    
    // Call onSort callback
    onSort(key);
  };

  return (
    <thead>
      <tr>
        {headers.map((header) => (
          <th key={header.key} onClick={() => handleSort(header.key)}>
            {header.label}
          </th>
        ))}
      </tr>
    </thead>
  );
};

export default SortableTableHeaders;
