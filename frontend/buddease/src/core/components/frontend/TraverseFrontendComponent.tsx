// components/frontend/TraverseFrontendComponent.tsx
"use client";

import { analyzeFrontendStructure } from '@/core/generators/corrections/analyzers/frontendAnalyzer';
import { TreeNode } from '@/core/models/TreeNode';
import { generateTree } from '@/core/scripts/generateTree';
import React, { useEffect, useState } from 'react';

interface TraverseFrontendComponentProps {
  basePath?: string;
  onFileSelect?: (filePath: string) => void;
  showStatistics?: boolean;
  maxDepth?: number;
}

export interface FileNode extends TreeNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
  extension?: string;
  lastModified?: Date;
  children?: FileNode[];
}

const TraverseFrontendComponent: React.FC<TraverseFrontendComponentProps> = ({
  basePath = process.cwd(),
  onFileSelect,
  showStatistics = true,
  maxDepth = 5
}) => {
  const [fileTree, setFileTree] = useState<FileNode | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'tsx' | 'ts' | 'css' | 'other'>('all');
  const [statistics, setStatistics] = useState({
    totalFiles: 0,
    totalDirectories: 0,
    totalSize: 0,
    byType: {} as Record<string, number>
  });

  useEffect(() => {
    loadFrontendStructure();
  }, [basePath]);

  const loadFrontendStructure = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/frontend-structure', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ basePath, maxDepth })
      });
      
      const data = await response.json();
      const tree = generateTree(data.structure);
      setFileTree(tree);
      setStatistics(data.statistics);
      
      // Expand root by default
      setExpandedNodes(new Set([tree?.path || '']));
    } catch (error) {
      console.error('Failed to load frontend structure:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleNode = (nodePath: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodePath)) {
      newExpanded.delete(nodePath);
    } else {
      newExpanded.add(nodePath);
    }
    setExpandedNodes(newExpanded);
  };

  const handleFileSelect = (file: FileNode) => {
    if (file.type === 'file') {
      setSelectedFile(file.path);
      onFileSelect?.(file.path);
    }
  };

  const renderTreeNode = (node: FileNode, depth = 0) => {
    if (!node) return null;

    const isExpanded = expandedNodes.has(node.path);
    const hasChildren = node.children && node.children.length > 0;
    const isSelected = selectedFile === node.path;
    
    // Apply filters
    if (searchQuery && !node.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      if (!node.children?.some(child => 
        child.name.toLowerCase().includes(searchQuery.toLowerCase())
      )) {
        return null;
      }
    }
    
    if (filterType !== 'all' && node.type === 'file') {
      const ext = node.extension?.toLowerCase();
      if (
        (filterType === 'tsx' && ext !== '.tsx') ||
        (filterType === 'ts' && ext !== '.ts') ||
        (filterType === 'css' && ext !== '.css' && ext !== '.scss') ||
        (filterType === 'other' && ['tsx', 'ts', 'css', 'scss'].includes(ext || ''))
      ) {
        return null;
      }
    }

    return (
      <div 
        key={node.path}
        className={`tree-node depth-${depth} ${isSelected ? 'selected' : ''}`}
        style={{ paddingLeft: `${depth * 20}px` }}
      >
        <div 
          className="node-content"
          onClick={() => node.type === 'directory' ? toggleNode(node.path) : handleFileSelect(node)}
        >
          <span className="node-icon">
            {node.type === 'directory' ? (
              isExpanded ? '📂' : '📁'
            ) : (
              getFileIcon(node.extension || '')
            )}
          </span>
          <span className="node-name">{node.name}</span>
          
          {node.type === 'directory' && hasChildren && (
            <span className="toggle-icon">
              {isExpanded ? '▼' : '▶'}
            </span>
          )}
          
          {node.type === 'file' && (
            <span className="file-info">
              {node.size && (
                <span className="file-size">{formatFileSize(node.size)}</span>
              )}
              {node.extension && (
                <span className="file-extension">{node.extension}</span>
              )}
            </span>
          )}
        </div>
        
        {isExpanded && hasChildren && node.children && (
          <div className="node-children">
            {node.children.map(child => renderTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const getFileIcon = (extension: string) => {
    switch (extension.toLowerCase()) {
      case '.tsx':
      case '.jsx':
        return '⚛️';
      case '.ts':
      case '.js':
        return '📜';
      case '.css':
      case '.scss':
      case '.sass':
        return '🎨';
      case '.json':
        return '📋';
      case '.md':
      case '.mdx':
        return '📝';
      case '.png':
      case '.jpg':
      case '.jpeg':
      case '.gif':
      case '.svg':
        return '🖼️';
      default:
        return '📄';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const analyzeSelectedFile = async () => {
    if (!selectedFile) return;
    
    try {
      const analysis = await analyzeFrontendStructure(selectedFile);
      console.log('File analysis:', analysis);
      alert(`Analysis complete!\nDependencies: ${analysis.dependencies.length}\nImports: ${analysis.imports.length}\nComponents: ${analysis.components.length}`);
    } catch (error) {
      console.error('Failed to analyze file:', error);
    }
  };

  const refreshStructure = () => {
    loadFrontendStructure();
  };

  return (
    <div className="traverse-frontend-component">
      <div className="traverse-header">
        <h3>Frontend Structure Explorer</h3>
        <p className="description">
          Explore and analyze your frontend application structure
        </p>
      </div>

      {/* Controls */}
      <div className="traverse-controls">
        <div className="search-filter">
          <input
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="filter-select"
          >
            <option value="all">All Files</option>
            <option value="tsx">React (.tsx)</option>
            <option value="ts">TypeScript (.ts)</option>
            <option value="css">Styles (.css/.scss)</option>
            <option value="other">Other</option>
          </select>
          <button 
            onClick={refreshStructure}
            className="btn btn-secondary"
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      <div className="traverse-content">
        {/* File Tree */}
        <div className="file-tree-container">
          <div className="tree-header">
            <h4>File Structure</h4>
            <span className="tree-info">
              {fileTree?.children?.length || 0} items
            </span>
          </div>
          
          <div className="file-tree">
            {loading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Loading file structure...</p>
              </div>
            ) : fileTree ? (
              <div className="tree-nodes">
                {fileTree.children?.map(child => renderTreeNode(child))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No files found</p>
                <button 
                  onClick={refreshStructure}
                  className="btn btn-primary"
                >
                  Load Structure
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Statistics Panel */}
        {showStatistics && (
          <div className="statistics-panel">
            <h4>Statistics</h4>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">Total Files:</span>
                <span className="stat-value">{statistics.totalFiles}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Directories:</span>
                <span className="stat-value">{statistics.totalDirectories}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Total Size:</span>
                <span className="stat-value">{formatFileSize(statistics.totalSize)}</span>
              </div>
            </div>
            
            {Object.keys(statistics.byType).length > 0 && (
              <>
                <h5>Files by Type</h5>
                <div className="type-stats">
                  {Object.entries(statistics.byType)
                    .sort(([,a], [,b]) => b - a)
                    .map(([type, count]) => (
                      <div key={type} className="type-stat">
                        <span className="type-label">{type}:</span>
                        <span className="type-count">{count}</span>
                      </div>
                    ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Selected File Actions */}
        {selectedFile && (
          <div className="selected-file-actions">
            <h4>Selected File</h4>
            <div className="selected-file-info">
              <p className="file-path">{selectedFile}</p>
              <div className="file-actions">
                <button 
                  onClick={analyzeSelectedFile}
                  className="btn btn-primary"
                >
                  Analyze File
                </button>
                <button 
                  onClick={() => window.open(`/api/file-content?path=${encodeURIComponent(selectedFile)}`, '_blank')}
                  className="btn btn-secondary"
                >
                  View Source
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TraverseFrontendComponent;