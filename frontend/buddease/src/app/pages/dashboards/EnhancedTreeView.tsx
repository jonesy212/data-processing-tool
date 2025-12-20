// EnhancedTreeView.tsx
import DummyCard from "@/app/cards/DummyCard";
import useSearchPagination from "@/app/hooks/commHooks/useSearchPagination";
import { useSearch } from "@/app/state/context/SearchContext";
import React, { useEffect, useMemo, useState } from "react";
import { FileTreeNode, FileTreeService } from "@/app/services/FileTreeService";

interface EnhancedTreeViewProps {
  onFileSelect?: (file: FileTreeNode) => void;
  onDirectorySelect?: (directory: FileTreeNode) => void;
  initialPath?: string;
}

const EnhancedTreeView: React.FC<EnhancedTreeViewProps> = ({
  onFileSelect,
  onDirectorySelect,
  initialPath = process.cwd()
}) => {
  const [fileTree, setFileTree] = useState<FileTreeNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<FileTreeNode | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'tree' | 'search' | 'file'>('tree');
  const [searchResults, setSearchResults] = useState<FileTreeNode[]>([]);
  const [searchInContent, setSearchInContent] = useState(false);

  const { searchQuery, updateSearchQuery } = useSearch();
  const { currentPage, pageSize, goToPage, nextPage, previousPage } = useSearchPagination();

  // Generate file tree on component mount
  useEffect(() => {
    const tree = FileTreeService.generateFileTree(initialPath);
    setFileTree(tree);
  }, [initialPath]);

  // Handle search
  useEffect(() => {
    if (searchQuery.trim()) {
      const results = FileTreeService.searchFiles(fileTree, searchQuery, searchInContent);
      setSearchResults(results);
      setViewMode('search');
    } else {
      setViewMode('tree');
    }
  }, [searchQuery, fileTree, searchInContent]);

  const displayData = useMemo(() => {
    const data = viewMode === 'search' ? searchResults : fileTree;
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return data.slice(startIndex, endIndex);
  }, [viewMode, searchResults, fileTree, currentPage, pageSize]);

  const handleNodeClick = async (node: FileTreeNode) => {
    setSelectedNode(node);
    
    if (node.type === 'file') {
      const content = FileTreeService.getFileContent(node.path);
      setFileContent(content);
      setViewMode('file');
      onFileSelect?.(node);
    } else {
      setViewMode('tree');
      onDirectorySelect?.(node);
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateSearchQuery(event.target.value);
  };

  const handleSearchInContentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInContent(event.target.checked);
  };

  const treeStats = FileTreeService.getTreeStats(fileTree);

  return (
    <div className="enhanced-tree-view">
      {/* Header with stats and controls */}
      <DummyCard
        content={
          <div className="tree-controls">
            <div className="tree-stats">
              <span>📁 {treeStats.directories} directories</span>
              <span>📄 {treeStats.files} files</span>
              <span>💾 {(treeStats.totalSize / 1024 / 1024).toFixed(2)} MB</span>
            </div>
            
            <div className="search-controls">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search files..."
                className="search-input"
              />
              
              <label className="search-option">
                <input
                  type="checkbox"
                  checked={searchInContent}
                  onChange={handleSearchInContentChange}
                />
                Search in file content
              </label>
            </div>

            <div className="view-controls">
              <button 
                onClick={() => setViewMode('tree')}
                className={viewMode === 'tree' ? 'active' : ''}
              >
                📁 Tree View
              </button>
              <button 
                onClick={() => setViewMode('search')}
                className={viewMode === 'search' ? 'active' : ''}
                disabled={!searchQuery.trim()}
              >
                🔍 Search Results
              </button>
            </div>
          </div>
        }
        onDragStart={() => {}}
        onDragEnd={() => {}}
      />

      {/* Main content area */}
      <div className="tree-content">
        {viewMode === 'file' && selectedNode ? (
          <FileContentViewer 
            file={selectedNode} 
            content={fileContent} 
          />
        ) : (
          <>
            {/* Tree/Search View */}
            <div className="tree-navigation">
              {viewMode === 'search' && (
                <div className="search-info">
                  Found {searchResults.length} results for "{searchQuery}"
                </div>
              )}
              
              <div className="tree-nodes">
                {displayData.map((node) => (
                  <EnhancedTreeNode
                    key={node.id}
                    node={node}
                    onClick={handleNodeClick}
                    isSelected={selectedNode?.id === node.id}
                  />
                ))}
              </div>
            </div>

            {/* Pagination */}
            {displayData.length > 0 && (
              <div className="pagination-controls">
                <button onClick={() => goToPage(1)} disabled={currentPage === 1}>
                  ⏮ First
                </button>
                <button onClick={previousPage} disabled={currentPage === 1}>
                  ◀ Previous
                </button>
                <span className="page-info">
                  Page {currentPage} of {Math.ceil((viewMode === 'search' ? searchResults.length : fileTree.length) / pageSize)}
                </span>
                <button onClick={nextPage} disabled={currentPage >= Math.ceil((viewMode === 'search' ? searchResults.length : fileTree.length) / pageSize)}>
                  Next ▶
                </button>
                <button onClick={() => goToPage(Math.ceil((viewMode === 'search' ? searchResults.length : fileTree.length) / pageSize))}>
                  Last ⏭
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// Enhanced TreeNode component
const EnhancedTreeNode: React.FC<{
  node: FileTreeNode;
  onClick: (node: FileTreeNode) => void;
  isSelected: boolean;
}> = ({ node, onClick, isSelected }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (node.type === 'directory') {
      setIsExpanded(!isExpanded);
    }
  };

  const handleClick = () => {
    onClick(node);
  };

  const getFileIcon = (node: FileTreeNode): string => {
    if (node.type === 'directory') {
      return isExpanded ? '📂' : '📁';
    }
    
    const iconMap: Record<string, string> = {
      '.tsx': '⚛️',
      '.ts': '📘',
      '.js': '📜',
      '.jsx': '⚛️',
      '.json': '📋',
      '.css': '🎨',
      '.scss': '🎨',
      '.html': '🌐',
      '.md': '📝',
      '.txt': '📄',
    };
    
    return iconMap[node.extension || ''] || '📄';
  };

  return (
    <div className={`tree-node ${isSelected ? 'selected' : ''}`}>
      <div 
        className="node-content"
        onClick={handleClick}
        style={{ 
          cursor: 'pointer', 
          padding: '4px 8px',
          backgroundColor: isSelected ? '#e3f2fd' : 'transparent',
          borderRadius: '4px'
        }}
      >
        <span 
          onClick={handleToggle}
          style={{ marginRight: '8px', cursor: 'pointer' }}
        >
          {node.type === 'directory' && (isExpanded ? '▼' : '►')}
        </span>
        
        <span style={{ marginRight: '8px' }}>
          {getFileIcon(node)}
        </span>
        
        <span className="node-name">{node.name}</span>
        
        {node.type === 'file' && (
          <span className="file-info">
            {node.size && ` (${(node.size / 1024).toFixed(1)} KB)`}
            {node.extension && ` [${node.extension}]`}
          </span>
        )}
      </div>

      {node.type === 'directory' && isExpanded && node.children && (
        <div className="node-children" style={{ marginLeft: '20px' }}>
          {node.children.map((child) => (
            <EnhancedTreeNode
              key={child.id}
              node={child}
              onClick={onClick}
              isSelected={isSelected}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// File Content Viewer Component
const FileContentViewer: React.FC<{
  file: FileTreeNode;
  content: string | null;
}> = ({ file, content }) => {
  const [wrapLines, setWrapLines] = useState(true);

  return (
    <div className="file-content-viewer">
      <div className="file-header">
        <h3>📄 {file.name}</h3>
        <div className="file-meta">
          <span>Path: {file.path}</span>
          {file.size && <span>Size: {(file.size / 1024).toFixed(2)} KB</span>}
          {file.modified && <span>Modified: {file.modified.toLocaleString()}</span>}
        </div>
        <div className="view-controls">
          <label>
            <input
              type="checkbox"
              checked={wrapLines}
              onChange={(e) => setWrapLines(e.target.checked)}
            />
            Wrap Lines
          </label>
        </div>
      </div>
      
      <div className="content-area">
        {content ? (
          <pre 
            style={{ 
              whiteSpace: wrapLines ? 'pre-wrap' : 'pre',
              fontFamily: 'monospace',
              fontSize: '14px',
              padding: '16px',
              backgroundColor: '#f5f5f5',
              borderRadius: '4px',
              overflow: 'auto',
              maxHeight: '500px'
            }}
          >
            {content}
          </pre>
        ) : (
          <div className="no-content">
            Unable to read file content or file is empty.
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedTreeView;