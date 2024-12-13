// ApiSearch.ts
import { BaseData } from '@/app/components/models/data/Data';
import { StructuredMetadata } from "@/app/configs/StructuredMetadata";
import { SearchResult } from "../components/routing/SearchResult";
import { handleApiError } from "./ApiLogs";
import { Note } from "./ApiNote";
import axiosInstance from "./axiosInstance";


// Define the base URL for your search endpoint
const SEARCH_BASE_URL = "/api/search"; // Adjust the base URL according to your actual API endpoint

// Define the structure of the search response data
interface SearchResponseData<
  T extends  BaseData<any>,
  K extends T = T,
  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K> 
  > {
  results: Note<T, K>[]; // Assuming an array of Note objects in the response
  totalCount: number; // Total count of search results
  // Add other properties if necessary
}

// Define the searchAPI function
export const searchAPI = async <
  T extends  BaseData<any>,
  K extends T = T>(
  query: string
): Promise<SearchResult<T, K>[]> => {
  try {
    const searchEndpoint = `${SEARCH_BASE_URL}?query=${encodeURIComponent(
      query
    )}`;

    const response = await axiosInstance.get<SearchResponseData<T, K>>(
      searchEndpoint
    );

    const { results, totalCount } = response.data;

    const searchResults: SearchResult<T, K>[] = results.map((note) => ({
      _id: note.id,
      id: note.id,
      // name: note.name,
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
