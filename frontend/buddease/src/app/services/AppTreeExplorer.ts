// AppTreeExplorer.tsx
import React, { useState, useEffect } from 'react';
import EnhancedTreeView from '@/app/pages/dashboards/EnhancedTreeView'
import TreeView from '@/app/pages/dashboards/TreeView';
import IntegratedAppTreeService from './AppTreeService';
import { useNotification } from '@/app/state/context/NotificationContext';
import { useSearch } from '@/app/state/context/SearchContext';

const AppTreeExplorer: React.FC = () => {
  const [activeView, setActiveView] = useState<'enhanced' | 'basic' | 'analysis'>('enhanced');
  const [comprehensiveData, setComprehensiveData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userQuery, setUserQuery] = useState('');
  
  const { notify } = useNotification();
  const { searchQuery, updateSearchQuery } = useSearch();

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const data = await IntegratedAppTreeService.analyzeProject();
      setComprehensiveData(data);
      notify(
        'app-tree-loaded',
        'Project analysis completed',
        data,
        new Date(),
        'info'
      );
    } catch (error) {
      console.error('Error loading project data:', error);
      notify(
        'app-tree-error',
        'Failed to load project data',
        { error },
        new Date(),
        'error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleComprehensiveSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    try {
      const results = await IntegratedAppTreeService.comprehensiveSearch(searchQuery);
      setComprehensiveData(prev => ({ ...prev, searchResults: results }));
      
      notify(
        'search-completed',
        `Found ${results.fileResults.length} files, ${results.analysisResults.length} analysis matches`,
        results,
        new Date(),
        'info'
      );
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    if (!userQuery.trim()) return;

    setIsLoading(true);
    try {
      const report = await IntegratedAppTreeService.generateComprehensiveReport(userQuery);
      setComprehensiveData(prev => ({ ...prev, report }));
      
      notify(
        'report-generated',
        'Comprehensive report generated',
        { recommendations: report.recommendations },
        new Date(),
        'success'
      );
    } catch (error) {
      console.error('Report generation error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshData = async () => {
    setIsLoading(true);
    try {
      await IntegratedAppTreeService.refreshAllData();
      await loadInitialData();
      
      notify(
        'data-refreshed',
        'All data sources refreshed',
        {},
        new Date(),
        'success'
      );
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="app-tree-explorer loading">
        <div className="loading-spinner">🔄 Analyzing project structure...</div>
      </div>
    );
  }

  return (
    <div className="app-tree-explorer">
      {/* Header Controls */}
      <div className="explorer-header">
        <div className="view-controls">
          <button 
            onClick={() => setActiveView('enhanced')}
            className={activeView === 'enhanced' ? 'active' : ''}
          >
            🚀 Enhanced View
          </button>
          <button 
            onClick={() => setActiveView('basic')}
            className={activeView === 'basic' ? 'active' : ''}
          >
            📁 Basic Tree
          </button>
          <button 
            onClick={() => setActiveView('analysis')}
            className={activeView === 'analysis' ? 'active' : ''}
          >
            📊 Analysis
          </button>
        </div>

        <div className="action-controls">
          <button onClick={handleRefreshData} className="refresh-btn">
            🔄 Refresh All
          </button>
        </div>
      </div>

      {/* Search Section */}
      <div className="search-section">
        <div className="search-group">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => updateSearchQuery(e.target.value)}
            placeholder="Search files, components, APIs..."
            className="search-input"
          />
          <button onClick={handleComprehensiveSearch} className="search-btn">
            🔍 Search All
          </button>
        </div>
        
        <div className="report-group">
          <input
            type="text"
            value={userQuery}
            onChange={(e) => setUserQuery(e.target.value)}
            placeholder="Describe your feature for analysis..."
            className="report-input"
          />
          <button onClick={handleGenerateReport} className="report-btn">
            📋 Generate Report
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="explorer-content">
        {activeView === 'enhanced' && (
          <EnhancedTreeView
            onFileSelect={(file) => {
              console.log('File selected:', file);
              notify(
                'file-selected',
                `Selected: ${file.name}`,
                file,
                new Date(),
                'info'
              );
            }}
            onDirectorySelect={(dir) => {
              console.log('Directory selected:', dir);
            }}
          />
        )}

        {activeView === 'basic' && comprehensiveData && (
          <TreeView
            data={comprehensiveData.fileTree || []}
            onClick={(node) => console.log('Node clicked:', node)}
            searchQuery={searchQuery}
          />
        )}

        {activeView === 'analysis' && comprehensiveData?.report && (
          <AnalysisView report={comprehensiveData.report} />
        )}
      </div>

      {/* Search Results Panel */}
      {comprehensiveData?.searchResults && (
        <SearchResultsPanel results={comprehensiveData.searchResults} />
      )}
    </div>
  );
};

// Analysis View Component
const AnalysisView: React.FC<{ report: any }> = ({ report }) => {
  return (
    <div className="analysis-view">
      <h3>📊 Project Analysis Report</h3>
      
      <div className="analysis-section">
        <h4>🎯 Relevant Files</h4>
        <div className="file-list">
          {report.relevantFiles?.map(([file, info]: [string, any], index: number) => (
            <div key={index} className="file-item">
              <span className="file-name">{file}</span>
              <span className="relevance-score">Score: {info.relevanceScore}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="analysis-section">
        <h4>💡 Recommendations</h4>
        <ul className="recommendations-list">
          {report.recommendations?.map((rec: string, index: number) => (
            <li key={index}>{rec}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

// Search Results Panel Component
const SearchResultsPanel: React.FC<{ results: any }> = ({ results }) => {
  return (
    <div className="search-results-panel">
      <h4>🔍 Search Results</h4>
      
      <div className="results-section">
        <h5>📁 Files ({results.fileResults.length})</h5>
        {results.fileResults.slice(0, 5).map((file: any, index: number) => (
          <div key={index} className="result-item">
            {file.name} - {file.path}
          </div>
        ))}
      </div>

      <div className="results-section">
        <h5>⚛️ Components/APIs ({results.analysisResults.length})</h5>
        {results.analysisResults.slice(0, 5).map((result: any, index: number) => (
          <div key={index} className="result-item">
            {result.type}: {result.data.name || result.data.file}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AppTreeExplorer;