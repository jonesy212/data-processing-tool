// FrontendDataService.ts
import { DocumentTree } from "@/core/users/User";


// Frontend data service for browser environment
// FrontendDataService.ts - Using API routes
class FrontendDataService {
  private baseUrl = '/api';

  async getTreeData(refresh: boolean = false): Promise<DocumentTree | null> {
    try {
      const url = `${this.baseUrl}/tree-data${refresh ? '?refresh=true' : ''}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const treeData = await response.json();
      return treeData;
    } catch (error) {
      console.error('Error fetching tree data from API:', error);
      return null;
    }
  }

  async saveEventResponses(eventId: string, responses: any[]): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/tree-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ eventId, responses }),
      });
      
      return response.ok;
    } catch (error) {
      console.error('Error saving event responses:', error);
      return false;
    }
  }
}

export const frontendDataService = new FrontendDataService();

