import React from "react";

interface Header {
  key: string;
  label: string;
}

interface Props {
  headers: Header[];
  onSort: (key: string) => void;
  headersConfig: { [key: string]: string }; // Define headersConfig prop
}

const SortableTableHeaders: React.FC<Props> = ({ headers, onSort, headersConfig }) => {
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
