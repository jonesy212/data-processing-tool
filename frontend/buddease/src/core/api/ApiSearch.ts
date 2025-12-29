// ApiSearch.ts
import { handleApiError } from '@/core/api/ApiLogs';
import { Note } from "@/core/api/ApiNote";
import axiosInstance from "@/core/api/csrfToken";
import { SearchResult } from "@/core/components/routing/SearchResult";
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import { Attachment } from '@/core/documents/attachment/Attachment';

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

    const response = await axiosInstance.get<SearchResponseData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>(
      searchEndpoint
    );

    const { results, totalCount } = response.data;

    const searchResults: SearchResult<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] = results.map((note) => ({
      _id: note.id,
      id: note.id,
      date: note.date,
      uploadedBy: note.uploadedBy,
      tagsOrCategories: note.tagsOrCategories,
      format: note.format,
      uploadedByTeamId: note.uploadedByTeamId,
      uploadedByTeam: note.uploadedByTeam,
      selectedDocument: note.selectedDocument,
    
      lastModifiedBy: note.lastModifiedBy,
      createdByRenamed: note.createdByRenamed,
      createdDate: note.createdDate,
      documentType: note.documentType,
     
      documents: note.documents,
      previousMeta: note.previousMeta,
      currentMeta: note.currentMeta,
      documentPhase: note.documentPhase,
      versionData: note.versionData,
      visibility: note.visibility,
      documentSize: note.documentSize,
      document: note.document,
      _rev: note._rev,
      phaseType: note.phaseType,
      label: note.label,
     
      createdBy: note.createdBy ? note.createdBy : undefined,
      title: note.title,
      content: note.content,
      description: note.description,
      source: note.source,
      topics: note.topics,
      highlights: note.highlights,
      keywords: note.keywords,
      folders: note.folders,
      options: note.options,
      folderPath: note.folderPath,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
      tags: note.tags,
      previousMetadata: note.previousMetadata,
      currentMetadata: note.currentMetadata,
      accessHistory: note.accessHistory,
      lastModifiedDate: note.lastModifiedDate,
      permissions: note.permissions,
      encryption: note.encryption,
      searchHistory: note.searchHistory,
      version: note.version,
      items: [],
      totalCount,
      load: () => Promise.resolve(),
      query,
      results: [],
    })
  );

    return searchResults;
  } catch (error: any) {
    handleApiError(error, "Failed to perform search");
    throw error;
  }
};


export type { SearchResponseData };
