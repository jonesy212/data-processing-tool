// FileStructureViewer.tsx
import TreeView from "@/app/pages/dashboards/TreeView";
import React from "react";
import { useAccessControl } from '@/app/hooks/useAccessControl';
import AccessDenied from '@/app/components/AccessDenied';
import { useRoleAccess, useCurrentUser } from '@/app/hooks/useRoleAccess';

const fetchFileStructure = async (userRole: string) => {
  const response = await fetch('/api/fileStructure', {
    headers: {
      'X-User-Role': userRole,
    }
  });
  
  if (response.ok) {
    const data = await response.json();
    
    // Filter sensitive files based on role
    if (userRole !== 'admin' && userRole !== 'developer') {
      return data.filter((file: any) => !file.isSensitive);
    }
    
    return data;
  } else {
    console.error('Error fetching file structure');
    return [];
  }
};

const FileStructureViewer = () => {
  const [fileStructure, setFileStructure] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const { canViewFileStructure, userRole } = useAccessControl();

  React.useEffect(() => {
    if (!canViewFileStructure) {
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const structure = await fetchFileStructure(userRole);
        setFileStructure(structure);
      } catch (error) {
        console.error('Failed to fetch file structure:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [canViewFileStructure, userRole]);

  const handleNodeClick = (node: any) => {
    // Additional permission check for specific node actions
    if (node.isSensitive && !hasRole(['admin', 'developer'])) {
      console.warn('Access denied to sensitive file');
      return;
    }
    
    console.log("Node clicked:", node);
  };

  if (isLoading) {
    return <div className="loading">Loading file structure...</div>;
  }

  if (!canViewFileStructure) {
    return (
      <AccessDenied 
        feature="File Structure Viewer"
        requiredRole={['developer', 'ui-designer', 'project-manager', 'admin']}
      />
    );
  }

  return (
    <div className="file-structure-viewer">
      <div className="viewer-header">
        <h3>Project File Structure</h3>
        <div className="access-badge">
          Access Level: {userRole}
        </div>
      </div>
      
      <TreeView
        searchQuery=""
        data={fileStructure} 
        onClick={handleNodeClick} 
      />
    </div>
  );
};

export default FileStructureViewer;