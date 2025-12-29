// ProjectExplorer.tsx

// Example usage in your app
import { FileTreeNode } from '@/core/services/FileTreeService';
import EnhancedTreeView from "@/pages/dashboards/EnhancedTreeView";
const ProjectExplorer: React.FC = () => {
  const handleFileSelect = (file: FileTreeNode) => {
    console.log('Selected file:', file);
    // You can open the file in an editor, show preview, etc.
  };

  const handleDirectorySelect = (directory: FileTreeNode) => {
    console.log('Selected directory:', directory);
    // You can navigate into the directory, show contents, etc.
  };

  return (
    <div className="project-explorer">
      <h2>Project File Explorer</h2>
      <EnhancedTreeView
        onFileSelect={handleFileSelect}
        onDirectorySelect={handleDirectorySelect}
        initialPath={process.cwd()} // Or any specific path
      />
    </div>
  );
};

export default ProjectExplorer;