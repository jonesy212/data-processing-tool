// ContentApiService.ts
// app/api/contentApiService.ts
import internalApiService from '@/core/api/ApiClient';
import {
    ContentBulkOperationResponse,
    ContentCreateRequest,
    ContentListResponseType,
    ContentResponseType,
    ContentSearchParams,
    ContentUpdateRequest
} from '@/core/models/content/fetchContent';


export interface ContentFilterParams {
  contentType?: string;
  status?: string;
  authorId?: string;
  tags?: string[];
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ContentBulkUpdateRequest {
  contentIds: string[];
  updates: Partial<ContentUpdateRequest>;
}

export interface ContentExportParams {
  format: 'json' | 'csv' | 'pdf';
  includeMetadata?: boolean;
  contentIds?: string[];
}

export class ContentApiService {
  private basePath = '/api/content';

  /**
   * Fetch content by ID
   */
  async fetchContentById(contentId: string): Promise<ContentResponseType | null> {
    try {
      const response = await internalApiService.get<ContentResponseType>(
        `${this.basePath}/${contentId}`
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch content with ID: ${contentId}`, error);
      return null;
    }
  }

  /**
   * Fetch multiple contents by IDs
   */
  async fetchContentsByIds(contentIds: string[]): Promise<ContentResponseType[]> {
    try {
      const response = await internalApiService.post<ContentResponseType[]>(
        `${this.basePath}/batch`,
        { contentIds }
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch contents with IDs: ${contentIds.join(', ')}`, error);
      return [];
    }
  }

  /**
   * Fetch all contents with filtering and pagination
   */
  async fetchAllContents(params?: ContentFilterParams): Promise<ContentListResponseType> {
    try {
      const response = await internalApiService.get<ContentListResponseType>(
        this.basePath,
        { config: { params } } 
      );
      return response.data;
    } catch (error) {
      console.error('Failed to fetch contents', error);
      return {
        contents: [],
        totalCount: 0,
        hasMore: false
      };
    }
  }


  /**
   * Create new content
   */
  async createContent(contentData: ContentCreateRequest): Promise<ContentResponseType | null> {
    try {
      // Validate required fields
      if (!contentData.title || !contentData.contentType) {
        throw new Error('Title and content type are required');
      }

      const response = await internalApiService.post<ContentResponseType>(
        this.basePath,
        contentData
      );
      return response.data;
    } catch (error) {
      console.error('Failed to create content', error);
      return null;
    }
  }

  /**
   * Update existing content
   */
  async updateContent(contentId: string, contentData: ContentUpdateRequest): Promise<ContentResponseType | null> {
    try {
      const response = await internalApiService.put<ContentResponseType>(
        `${this.basePath}/${contentId}`,
        contentData
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to update content with ID: ${contentId}`, error);
      return null;
    }
  }

  /**
   * Bulk update multiple contents
   */
  async bulkUpdateContents(bulkRequest: ContentBulkUpdateRequest): Promise<ContentBulkOperationResponse> {
    try {
      const response = await internalApiService.put<ContentBulkOperationResponse>(
        `${this.basePath}/bulk/update`,
        bulkRequest
      );
      return response.data;
    } catch (error) {
      console.error('Failed to bulk update contents', error);
      return {
        success: false,
        processed: 0,
        failed: bulkRequest.contentIds.length,
        errors: ['Bulk update operation failed']
      };
    }
  }

  /**
   * Delete content by ID
   */
  async deleteContent(contentId: string): Promise<boolean> {
    try {
      await internalApiService.delete(`${this.basePath}/${contentId}`);
      return true;
    } catch (error) {
      console.error(`Failed to delete content with ID: ${contentId}`, error);
      return false;
    }
  }

  /**
   * Bulk delete multiple contents
   */
  async bulkDeleteContents(contentIds: string[]): Promise<ContentBulkOperationResponse> {
    try {
      const response = await internalApiService.post<ContentBulkOperationResponse>(
        `${this.basePath}/bulk/delete`,
        { contentIds }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to bulk delete contents', error);
      return {
        success: false,
        processed: 0,
        failed: contentIds.length,
        errors: ['Bulk delete operation failed']
      };
    }
  }

  /**
   * Search contents with advanced filtering
   */
  async searchContents(searchParams: ContentSearchParams): Promise<ContentListResponseType> {
    try {
      const response = await internalApiService.post<ContentListResponseType>(
        `${this.basePath}/search`,
        searchParams
      );
      return response.data;
    } catch (error) {
      console.error('Failed to search contents', error);
      return {
        contents: [],
        totalCount: 0,
        hasMore: false
      };
    }
  }

  /**
   * Duplicate content
   */
  async duplicateContent(contentId: string, newTitle?: string): Promise<ContentResponseType | null> {
    try {
      const response = await internalApiService.post<ContentResponseType>(
        `${this.basePath}/${contentId}/duplicate`,
        { newTitle }
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to duplicate content with ID: ${contentId}`, error);
      return null;
    }
  }

  /**
   * Change content status
   */
  async changeContentStatus(contentId: string, status: string): Promise<ContentResponseType | null> {
    try {
      const response = await internalApiService.patch<ContentResponseType>(
        `${this.basePath}/${contentId}/status`,
        { status }
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to change status for content with ID: ${contentId}`, error);
      return null;
    }
  }

  /**
   * Add tags to content
   */
  async addContentTags(contentId: string, tags: string[]): Promise<ContentResponseType | null> {
    try {
      const response = await internalApiService.patch<ContentResponseType>(
        `${this.basePath}/${contentId}/tags`,
        { tags, operation: 'add' }
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to add tags to content with ID: ${contentId}`, error);
      return null;
    }
  }

  /**
   * Remove tags from content
   */
  async removeContentTags(contentId: string, tags: string[]): Promise<ContentResponseType | null> {
    try {
      const response = await internalApiService.patch<ContentResponseType>(
        `${this.basePath}/${contentId}/tags`,
        { tags, operation: 'remove' }
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to remove tags from content with ID: ${contentId}`, error);
      return null;
    }
  }

  /**
   * Export contents in various formats
   */
  async exportContents(exportParams: ContentExportParams): Promise<Blob | null> {
    try {
      const response = await internalApiService.post<Blob>(
        `${this.basePath}/export`,
        exportParams,
        {
          config: {
            responseType: 'blob'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to export contents', error);
      return null;
    }
  }

  /**
   * Import contents from file
   */
  async importContents(file: File, options?: { overwrite?: boolean }): Promise<ContentBulkOperationResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (options?.overwrite) {
        formData.append('overwrite', 'true');
      }

      const response = await internalApiService.post<ContentBulkOperationResponse>(
        `${this.basePath}/import`,
        formData,
        {
          config: {
            headers: { 'Content-Type': 'multipart/form-data' }
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to import contents', error);
      return {
        success: false,
        processed: 0,
        failed: 0,
        errors: ['Import operation failed']
      };
    }
  }

  /**
   * Get content statistics
   */
  async getContentStatistics(): Promise<any> {
    try {
      const response = await internalApiService.get(`${this.basePath}/statistics`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch content statistics', error);
      return null;
    }
  }

  /**
   * Get content versions/history
   */
  async getContentHistory(contentId: string): Promise<any[]> {
    try {
      const response = await internalApiService.get(`${this.basePath}/${contentId}/history`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch history for content with ID: ${contentId}`, error);
      return [];
    }
  }

  /**
   * Restore content to previous version
   */
  async restoreContentVersion(contentId: string, versionId: string): Promise<ContentResponseType | null> {
    try {
      const response = await internalApiService.post<ContentResponseType>(
        `${this.basePath}/${contentId}/restore/${versionId}`
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to restore content version for ID: ${contentId}`, error);
      return null;
    }
  }

  /**
   * Validate content data before submission
   */
  validateContentData(contentData: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!contentData.title || contentData.title.trim().length === 0) {
      errors.push('Title is required');
    }

    if (contentData.title && contentData.title.length > 255) {
      errors.push('Title must be less than 255 characters');
    }

    if (!contentData.contentType) {
      errors.push('Content type is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Generate content preview
   */
  async generateContentPreview(contentData: Partial<ContentCreateRequest>): Promise<string | null> {
    try {
      const response = await internalApiService.post<{ preview: string }>(
        `${this.basePath}/preview`,
        contentData
      );
      return response.data.preview;
    } catch (error) {
      console.error('Failed to generate content preview', error);
      return null;
    }
  }
}

// Singleton instance
export const contentApiService = new ContentApiService();
