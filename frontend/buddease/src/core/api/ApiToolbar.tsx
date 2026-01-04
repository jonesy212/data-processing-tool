ApiToolbar.tsx
app/api/toolbarApi.ts
import internalApiService from '@/core/api/ApiClient';

export interface ToolbarItemData {
  id: string;
  label: string;
  // Add other toolbar item properties
}

export class ToolbarApiService {
  async fetchToolbarItems(toolbarId: string): Promise<ToolbarItemData[]> {
    try {
      const response = await internalApiService.get<{ items: ToolbarItemData[] }>(
        `/api/toolbar/${toolbarId}`
      );
      return response.data.items;
    } catch (error) {
      console.error('Error fetching toolbar items:', error);
      throw error;
    }
  }

  async addToolbarItem(newItem: Omit<ToolbarItemData, 'id'>): Promise<ToolbarItemData> {
    const response = await internalApiService.post<ToolbarItemData>(
      '/api/toolbar',
      newItem
    );
    return response.data;
  }

  async removeToolbarItem(itemId: string): Promise<void> {
    await internalApiService.delete(`/api/toolbar/${itemId}`);
  }

  async updateToolbarItem(itemId: string, updates: Partial<ToolbarItemData>): Promise<ToolbarItemData> {
    const response = await internalApiService.put<ToolbarItemData>(
      `/api/toolbar/${itemId}`,
      updates
    );
    return response.data;
  }
}

export const toolbarApiService = new ToolbarApiService();