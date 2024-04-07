// Import the TreeView component
import TreeView from "@/app/pages/dashboards/TreeView";
import React from "react";

// Fetch the file structure dynamically (replace with your actual utility function)
const fetchFileStructure = async () => {
  // Example: Fetch file structure from an API endpoint
  const response = await fetch('/api/fileStructure');
  if (response.ok) {
    return await response.json();
  } else {
    console.error('Error fetching file structure');
    return [];
  }
};

// Use a component that fetches and displays the file structure
const FileStructureViewer = () => {
  const [fileStructure, setFileStructure] = React.useState([]);

  // Fetch file structure when the component mounts
  React.useEffect(() => {
    const fetchData = async () => {
      const structure = await fetchFileStructure();
      setFileStructure(structure);
    };

    fetchData();
  }, []);

    const handleNodeClick = (node: any) => {
      
    // Handle node click event
    console.log("Node clicked:", node);
  };

  return (
    <div>
      {/* Render the TreeView component with the dynamically fetched file structure */}
      <TreeView
        searchQuery=""
        data={fileStructure} onClick={handleNodeClick} />
    </div>
  );
};

export default FileStructureViewer;
