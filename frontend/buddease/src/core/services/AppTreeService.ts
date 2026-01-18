// AppTreeService.ts

import appTreeApiService from '@/core/api/appTreeApi';
import DirectoryExplorer from '@/core/pages/dashboards/DirectoryExplorer';
import { ProjectTreeAnalyzer } from '@/core/scripts/generateTree';
import { FileTreeNode, FileTreeService } from '@/core/services/FileTreeService';
import { DocumentTree } from "@/core/users/User";

export class AppTreeService {
  private projectAnalyzer: ProjectTreeAnalyzer;
  private directoryExplorer: DirectoryExplorer;
  private fileTreeService: FileTreeService;

  constructor(rootPath: string = process.cwd()) {
    this.projectAnalyzer = new ProjectTreeAnalyzer(rootPath);
    this.fileTreeService = new FileTreeService();
    // Initialize with current directory structure
    const initialTree = FileTreeService.generateFileTree(rootPath); 
    this.directoryExplorer = new DirectoryExplorer(JSON.stringify(initialTree));
  }


  // Add the getTree method to the class
  async getTree(): Promise<DocumentTree | null> {
    try {
      // Use the hybrid service
      const treeData = await appTreeApiService.getTreeData();
      
      if (!treeData) {
        // Return sample data if no data available
        return {
          documents: {
            category1: {
              document1: {
                title: "Document Title 1",
                content: "Document Content 1",
                createdAt: new Date(),
                updatedAt: new Date(),
              },
              document2: {
                title: "Document Title 2", 
                content: "Document Content 2",
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            },
          },
        };
      }
      
      return treeData;
    } catch (error) {
      console.error('Error while fetching tree data:', error);
      return null;
    }
  }


  // Comprehensive project analysis
  async analyzeProject(userQuery?: string): Promise<any> {
    const analysis = await this.projectAnalyzer.analyzeProjectTree();
    const treeStructure = this.fileTreeService.generateFileTree(process.cwd());
    
    
    let contextResponse = '';
    if (userQuery) {
      contextResponse = this.directoryExplorer.exploreDirectory(userQuery);
    }

    // Get app tree data from API service
    const appTreeData = await appTreeApiService.getTree();

    return {
      projectAnalysis: analysis,
      fileTree: treeStructure,
      contextResponse,
      appTreeData,
      timestamp: new Date().toISOString()
    };
  }

  // Search across multiple data sources
  async comprehensiveSearch(query: string): Promise<{
    fileResults: FileTreeNode[];
    analysisResults: any[];
    apiResults: any[];
  }> {
    const fileTree = this.fileTreeService.generateFileTree(process.cwd());
    
    // Search in file names and content
    const fileResults = this.fileTreeService.searchFiles(fileTree, query, true);
    
    // Search in project analysis
    const analysis = await this.projectAnalyzer.analyzeProjectTree();
    const analysisResults = this.searchInAnalysis(analysis, query);
    
    // Search in app tree data
    const appTreeData = await appTreeApiService.getTree();
    const apiResults = this.searchInAppTree(appTreeData, query);

    return {
      fileResults,
      analysisResults,
      apiResults
    };
  }

  private searchInAnalysis(analysis: any, query: string): any[] {
      const results: any[] = []; // Add explicit type
      const searchTerm = query.toLowerCase();

      // Search in interfaces
      analysis.interfaces.forEach(([name, interfaceInfo]: [string, any]) => {
          if (name.toLowerCase().includes(searchTerm) || 
              interfaceInfo.file.toLowerCase().includes(searchTerm)) {
              results.push({ type: 'interface', data: interfaceInfo });
          }
      });

      // Search in components
      analysis.components.forEach(([name, component]: [string, any]) => {
          if (name.toLowerCase().includes(searchTerm) || 
              component.file.toLowerCase().includes(searchTerm)) {
              results.push({ type: 'component', data: component });
          }
      });

      // Search in APIs
      analysis.apis.forEach(([filePath, apiInfo]: [string, any]) => {
          if (filePath.toLowerCase().includes(searchTerm) || 
              apiInfo.methods.some((method: any) => 
                  method.name.toLowerCase().includes(searchTerm))) {
              results.push({ type: 'api', data: apiInfo });
          }
      });

      return results;
  }

  private searchInAppTree(appTreeData: any, query: string): any[] {
      const results: any[] = []; // Add explicit type
      const searchTerm = query.toLowerCase();

      // Recursive search function
      const searchRecursive = (obj: any, path: string = '') => {
          if (typeof obj === 'object' && obj !== null) {
              Object.entries(obj).forEach(([key, value]) => {
                  const currentPath = path ? `${path}.${key}` : key;
                  
                  if (key.toLowerCase().includes(searchTerm)) {
                      results.push({ path: currentPath, value });
                  }
                  
                  if (typeof value === 'object' && value !== null) {
                      searchRecursive(value, currentPath);
                  } else if (typeof value === 'string' && value.toLowerCase().includes(searchTerm)) {
                      results.push({ path: currentPath, value });
                  }
              });
          }
      };

      searchRecursive(appTreeData);
      return results;
  }

  // Generate reports combining all data sources
  async generateComprehensiveReport(userPrompt: string): Promise<any> {
    const analysisReport = await this.projectAnalyzer.generateReport(userPrompt);
    const comprehensiveAnalysis = await this.analyzeProject(userPrompt);
    const searchResults = await this.comprehensiveSearch(userPrompt);

    return {
      ...analysisReport,
      comprehensiveAnalysis,
      searchResults,
      recommendations: this.generateRecommendations(analysisReport, searchResults)
    };
  }

  private generateRecommendations(analysisReport: any, searchResults: any): string[] {
    const recommendations: string[] = [];

    // Component recommendations
    if (analysisReport.suggestedComponents.length > 0) {
      recommendations.push(`Found ${analysisReport.suggestedComponents.length} relevant components for your project`);
    }

    // API recommendations
    if (analysisReport.suggestedApis.length > 0) {
      recommendations.push(`Found ${analysisReport.suggestedApis.length} API services that match your requirements`);
    }

    // File structure recommendations
    if (searchResults.fileResults.length > 0) {
      recommendations.push(`Found ${searchResults.fileResults.length} files matching your search criteria`);
    }

    // Performance recommendations based on analysis
    if (analysisReport.projectStructure.totalFiles > 100) {
      recommendations.push('Consider implementing code splitting for better performance');
    }

    return recommendations;
  }

  // Refresh all data sources
  async refreshAllData(): Promise<void> {
    try {
      // Refresh app tree from API
      await appTreeApiService.refreshAppTreeFromApi();
      
      // Clear analyzer cache
      this.projectAnalyzer.clearCache();
      
      // Regenerate file tree
      FileTreeService.generateFileTree(process.cwd());
      
      console.log('✅ All data sources refreshed successfully');
    } catch (error) {
      console.error('❌ Error refreshing data sources:', error);
      throw error;
    }
  }


  async getTreeData(): Promise<DocumentTree | null> {
    try {
      // Your implementation to fetch tree data
      // This could be from an API, database, or file system
      const response = await fetch('/api/tree-data'); // or your API endpoint
      if (!response.ok) {
        throw new Error('Failed to fetch tree data');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching tree data:', error);
      return null;
    }
  }

}

export default new AppTreeService();