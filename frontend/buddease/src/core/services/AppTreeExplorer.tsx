AppTreeExplorer.ts
AppTreeExplorer.tsx
import { NotificationTypeEnum } from '@/core/features/support/UnifiedNotificationTypes';
import EnhancedTreeView from "@/core/pages/dashboards/EnhancedTreeView";
import TreeView from "@/core/pages/dashboards/TreeView";
import { useNotification } from "@/core/state/context/NotificationContext";
import { useSearch } from "@/core/state/context/SearchContext";
import { getFileCategory } from '@/utils/fileCategoryUtils';
import React, { useEffect, useState } from "react";
import IntegratedAppTreeService from "./AppTreeService";

const AppTreeExplorer: React.FC = () => {
  const [activeView, setActiveView] = useState<
    "enhanced" | "basic" | "analysis"
  >("enhanced");
  const [comprehensiveData, setComprehensiveData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userQuery, setUserQuery] = useState("");

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

      notify({
        id: "appTreeLoaded",
        message: "Project analysis completed",
        data: {
          extra: {
            operation: "Project analysis",
            analysisType: "Initial load",
            dataPoints: data?.components?.length || 0,
          },
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.INFO,
        level: "info",
      });
    } catch (error) {
      console.error("Error loading project data:", error);

      notify({
        id: "appTreeError",
        message: "Failed to load project data",
        data: {
          originalError:
            error instanceof Error ? error.message : "Unknown error",
          extra: {
            errorMessage: "Error loading project data",
            operation: "Project analysis",
          },
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.ERROR,
        level: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleComprehensiveSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    try {
      const results = await IntegratedAppTreeService.comprehensiveSearch(
        searchQuery
      );
      setComprehensiveData((prev) => ({ ...prev, searchResults: results }));

      notify({
        id: "searchCompleted",
        message: `Found ${results.fileResults?.length || 0} files, ${
          results.analysisResults?.length || 0
        } analysis matches`,
        data: {
          extra: {
            operation: "Comprehensive search",
            searchQuery,
            fileResults: results.fileResults?.length || 0,
            analysisResults: results.analysisResults?.length || 0,
          },
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.INFO,
        level: "info",
      });
    } catch (error) {
      console.error("Search error:", error);

      notify({
        id: "searchError",
        message: "Search failed",
        data: {
          originalError:
            error instanceof Error ? error.message : "Unknown error",
          extra: {
            errorMessage: "Search error",
            searchQuery,
            operation: "Comprehensive search",
          },
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.ERROR,
        level: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    if (!userQuery.trim()) return;

    setIsLoading(true);
    try {
      const report = await IntegratedAppTreeService.generateComprehensiveReport(
        userQuery
      );
      setComprehensiveData((prev) => ({ ...prev, report }));

      notify({
        id: "reportGenerated",
        message: "Comprehensive report generated",
        data: {
          extra: {
            operation: "Generate report",
            userQuery,
            recommendationsCount: report.recommendations?.length || 0,
          },
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_SUCCESS,
        level: "success",
      });
    } catch (error) {
      console.error("Report generation error:", error);

      notify({
        id: "reportGenerationError",
        message: "Failed to generate report",
        data: {
          originalError:
            error instanceof Error ? error.message : "Unknown error",
          extra: {
            errorMessage: "Report generation error",
            userQuery,
            operation: "Generate report",
          },
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.ERROR,
        level: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshData = async () => {
    setIsLoading(true);
    try {
      await IntegratedAppTreeService.refreshAllData();
      await loadInitialData();

      notify({
        id: "dataRefreshed",
        message: "All data sources refreshed",
        data: {
          extra: {
            operation: "Refresh data",
            refreshType: "Complete refresh",
          },
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_SUCCESS,
        level: "success",
      });
    } catch (error) {
      console.error("Refresh error:", error);

      notify({
        id: "refreshError",
        message: "Failed to refresh data",
        data: {
          originalError:
            error instanceof Error ? error.message : "Unknown error",
          extra: {
            errorMessage: "Refresh error",
            operation: "Refresh data",
          },
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.ERROR,
        level: "error",
      });
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
            onClick={() => setActiveView("enhanced")}
            className={activeView === "enhanced" ? "active" : ""}
          >
            🚀 Enhanced View
          </button>
          <button
            onClick={() => setActiveView("basic")}
            className={activeView === "basic" ? "active" : ""}
          >
            📁 Basic Tree
          </button>
          <button
            onClick={() => setActiveView("analysis")}
            className={activeView === "analysis" ? "active" : ""}
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
        {activeView === "enhanced" && (
          <EnhancedTreeView
            onFileSelect={(file) => {
              console.log("File selected:", file);

              // Success notification using object format
              notify({
                id: `file_selected_${file.id || file.name}_${Date.now()}`,
                message: `Selected: ${file.name}`,
                data: {
                  entityType: "file",
                  entityId: file.id || file.name,
                  action: "select",
                  fileInfo: {
                    viewType: "enhanced_tree",
                    operation: "file_upload", // or "file_selection"
                    fileCategory: getFileCategory(file.name),
                    selectionMethod: "user_upload", // or "user_click"
                    fileName: file.name,
                    fileType: file.type,
                    fileSize: file.size,
                    path: file.path,
                    extension: file.name.split(".").pop(),
                    lastModified: new Date(file.lastModified),
                  } as FileMetadata,
                  timestamp: new Date().toISOString(),
                },
                timestamp: new Date(),
                type: NotificationTypeEnum.INFO,
                level: "info" as const,
                metadata: {
                  viewType: "enhanced_tree",
                  operation: "file_selection",
                  fileCategory: getFileCategory(file.type || file.name),
                  selectionMethod: "user_click",
                },
                action: {
                  label: "Open File",
                  onClick: () => {
                    console.log(`Opening file: ${file.name}`);
                    // openFile(file);
                  },
                },
              });
            }}
            onDirectorySelect={(dir) => {
              console.log("Directory selected:", dir);

              // Directory selection notification (optional)
              notify({
                id: `directory_selected_${dir.id || dir.name}_${Date.now()}`,
                message: `Navigated to: ${dir.name}`,
                data: {
                  entityType: "directory",
                  entityId: dir.id || dir.name,
                  action: "navigate",
                  directoryInfo: {
                    name: dir.name,
                    path: dir.path,
                    itemCount: dir.itemCount,
                    isRoot: dir.isRoot || false,
                    hasSubdirectories: dir.hasSubdirectories || false,
                  },
                  timestamp: new Date().toISOString(),
                },
                timestamp: new Date(),
                type: NotificationTypeEnum.INFO,
                level: "info" as const,
                metadata: {
                  viewType: "enhanced_tree",
                  operation: "directory_navigation",
                },
              });
            }}
          />
        )}

        {activeView === "basic" && comprehensiveData && (
          <TreeView
            data={comprehensiveData.fileTree || []}
            onClick={(node) => console.log("Node clicked:", node)}
            searchQuery={searchQuery}
          />
        )}

        {activeView === "analysis" && comprehensiveData?.report && (
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
          {report.relevantFiles?.map(
            ([file, info]: [string, any], index: number) => (
              <div key={index} className="file-item">
                <span className="file-name">{file}</span>
                <span className="relevance-score">
                  Score: {info.relevanceScore}
                </span>
              </div>
            )
          )}
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
        {results.analysisResults
          .slice(0, 5)
          .map((result: any, index: number) => (
            <div key={index} className="result-item">
              {result.type}: {result.data.name || result.data.file}
            </div>
          ))}
      </div>
    </div>
  );
};

export default AppTreeExplorer;
