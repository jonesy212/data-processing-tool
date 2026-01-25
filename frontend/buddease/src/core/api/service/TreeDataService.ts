// TreeDataService.ts
import appTreeApiService from '@/core/api/appTreeApi';
import { DocumentTree } from "@/core/users/User";

class TreeDataService {
  // Use existing service for core operations
  async getTreeData(): Promise<DocumentTree | null> {
    try {
      return await appTreeApiService.getTree();
    } catch (error) {
      console.error('Error getting tree data:', error);
      return null;
    }
  }

  async refreshTreeData(): Promise<DocumentTree | null> {
    try {
      return await appTreeApiService.refreshAppTreeFromApi();
    } catch (error) {
      console.error('Error refreshing tree data:', error);
      return null;
    }
  }

  // Use API routes for operations that need server-side processing
  async exportTreeData(format: 'json' | 'csv' = 'json'): Promise<Blob | null> {
    try {
      const response = await fetch(`/api/tree-data/export?format=${format}`);
      if (response.ok) {
        return await response.blob();
      }
      return null;
    } catch (error) {
      console.error('Error exporting tree data:', error);
      return null;
    }
  }

  // Use existing service for event responses
  async getEventResponses(eventId: string): Promise<any[]> {
    return await appTreeApiService.fetchEventResponsesFromLocalStorage(eventId);
  }

  async saveEventResponses(eventId: string, responses: any[]): Promise<void> {
    await appTreeApiService.saveEventResponsesToLocalStorage(eventId, responses);
  }
}

export const treeDataService = new TreeDataService();