// ApiSearch.ts
import { handleApiError } from '@/core/api/ApiLogs';
import type { Note } from "@/core/api/ApiNote";
import internalApiService from "@/core/api/ApiClient";
import type { SearchResult } from "@/core/components/routing/SearchResult";
import type { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import type { Attachment } from '@/core/documents/attachment/Attachment';

// Define the base URL for your search endpoint
const SEARCH_BASE_URL = "/api/search"; // Adjust the base URL according to your actual API endpoint

// Define the structure of the search response data
interface SearchResponseData<
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  > {
  results: Note<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]; // Assuming an array of Note objects in the response
  totalCount: number; // Total count of search results
  // Add other properties if necessary
}

// Define the searchAPI function
export const searchAPI = async <
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
>(
  query: string
): Promise<SearchResult<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> => {
  try {
    const searchEndpoint = `${SEARCH_BASE_URL}?query=${encodeURIComponent(
      query
    )}`;

    const response = await internalApiService.get<SearchResponseData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>(
      searchEndpoint
    );

    const { results, totalCount } = response.data;

    const searchResults = results.map((note, index) => {
      // Create a partial search result with all available data
      const result: Partial<SearchResult<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> = {
        _id: note.id || `search-result-${index}`,
        id: note.id || `search-result-${index}`,
        date: note.date || new Date(),
        appMetadata: note.appMetadata || {},
        userId: note.userId || '',
        path: note.path || '',
        draft: note.draft || false,
        uploadedBy: note.uploadedBy || '',
        tagsOrCategories: note.tagsOrCategories || [],
        format: note.format || 'text',
        uploadedByTeamId: note.uploadedByTeamId || '',
        uploadedByTeam: note.uploadedByTeam || '',
        selectedDocument: note.selectedDocument || null,
        lastModifiedBy: note.lastModifiedBy || '',
        createdByRenamed: note.createdByRenamed || '',
        createdDate: note.createdDate || new Date(),
        documentType: note.documentType || 'search_result',
        documents: note.documents || [],
        previousMeta: note.previousMeta || null,
        currentMeta: note.currentMeta || null,
        documentPhase: note.documentPhase || 'active',
        versionData: note.versionData || null,
        visibility: note.visibility || 'private',
        documentSize: note.documentSize || 0,
        document: note.document || null,
        _rev: note._rev || '',
        phaseType: note.phaseType || 'search',
        label: note.label || '',
        createdBy: note.createdBy || undefined,
        title: note.title || '',
        content: note.content || '',
        description: note.description || '',
        source: note.source || '',
        topics: note.topics || [],
        highlights: note.highlights || [],
        keywords: note.keywords || [],
        folders: note.folders || [],
        options: note.options || {},
        folderPath: note.folderPath || null,
        createdAt: note.createdAt || new Date(),
        updatedAt: note.updatedAt || new Date(),
        tags: note.tags || [],
        previousMetadata: note.previousMetadata || null,
        currentMetadata: note.currentMetadata || null,
        accessHistory: note.accessHistory || [],
        lastModifiedDate: note.lastModifiedDate || new Date(),
        permissions: note.permissions || {},
        encryption: note.encryption || null,
        searchHistory: note.searchHistory || [],
        version: note.version || undefined,
        items: [],
        totalCount: totalCount || 0,
        load: (content: any) => {
          console.log('Loading content:', content);
        },
        query,
        results: [],
      };

      // Type assertion to bypass strict type checking
      // This assumes the partial object contains all required properties
      return result as SearchResult<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
    });

    return searchResults;
  } catch (error: any) {
    handleApiError(error, "Failed to perform search");
    throw error;
  }
};

export type { SearchResponseData };
