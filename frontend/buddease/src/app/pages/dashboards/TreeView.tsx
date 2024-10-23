// TreeView.tsx
import DummyCard from "@/app/components/cards/DummyCard";
import useSearchPagination from "@/app/components/hooks/commHooks/useSearchPagination";
import React, { useState } from "react";
import { useSearch } from "../searchs/SearchContext";
// Define a TreeNode component for individual nodes
const TreeNode = ({
  node,
  onClick,
}: {
  node: any;
  onClick: (node: any) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div>
      <div style={{ cursor: "pointer" }} onClick={() => onClick(node)}>
        {node.name}
      </div>
      {node.children && isOpen && (
        <div style={{ marginLeft: 20 }}>
          {node.children.map((child: any) => (
            <TreeNode key={child.id} node={child} onClick={onClick} />
          ))}
        </div>
      )}
    </div>
  );
};


// Define the main TreeView component
const TreeView = ({
  data,
  onClick,
}: {
  data: any[];
    onClick: (node: any) => void;
    searchQuery: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { currentPage, pageSize, goToPage, nextPage, previousPage } =
    useSearchPagination();
    const { searchQuery: propSearchQuery, contextSearchQuery, updateSearchQuery } = useSearch(); // Access searchQuery and updateSearchQuery from context
  
  // Pagination logic to slice the data array based on currentPage and pageSize
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = data.slice(startIndex, endIndex);


  const handleSearchChange = (event: any) => {
    updateSearchQuery(event.target.value);
  };


  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div>
      {/* DummyCard content */}
      <DummyCard
        content={
          <>
            <div>
              {/* Example button to toggle the state */}
              <button onClick={handleToggle}>Toggle Open</button>
            </div>
            {/* Additional content or controls can be added here */}
          </>
        }
        onDragStart={() => {}}
        onDragEnd={() => {}}
      />

      {/* Additional TreeView content */}
      {isOpen && <div>{/* Content that is shown when isOpen is true */}</div>}

      {/* Search input field */}
      <input
        type="text"
        value={propSearchQuery || contextSearchQuery} 
        onChange={handleSearchChange}
        placeholder="Search..."
      />
      {/* Render tree nodes */}
      {paginatedData.map((node) => (
        <TreeNode key={node.id} node={node} onClick={onClick} />
      ))}

      {/* Render your paginated data here */}

     {/* Pagination controls */}
      <button onClick={() => goToPage(1)}>First</button>
      <button onClick={() => previousPage()}>Previous</button>
      <span>{currentPage}</span>
      <button onClick={() => nextPage()}>Next</button>
      <button onClick={() => goToPage(Math.ceil(data.length / pageSize))}>Last</button>
    </div>
  );
};

export default TreeView;
