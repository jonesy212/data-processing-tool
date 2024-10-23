// ApiSearch.ts
 import axiosInstance from "./axiosInstance";
import { handleApiError } from "./ApiLogs";
import { Note } from "./ApiNote";
import { SearchResult } from "../components/routing/SearchResult";

// Define the base URL for your search endpoint
const SEARCH_BASE_URL = "/api/search"; // Adjust the base URL according to your actual API endpoint

// Define the structure of the search response data
interface SearchResponseData {
  results: Note[]; // Assuming an array of Note objects in the response
  totalCount: number; // Total count of search results
  // Add other properties if necessary
}

// Define the searchAPI function
export const searchAPI = async (
  query: string
): Promise<SearchResult<any>[]> => {
  try {
    const searchEndpoint = `${SEARCH_BASE_URL}?query=${encodeURIComponent(
      query
    )}`;

    const response = await axiosInstance.get<SearchResponseData>(
      searchEndpoint
    );

    const { results, totalCount } = response.data;

    const searchResults: SearchResult<any>[] = results.map((note) => ({
      id: note.id,
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
      results: searchResults,
    }));

    return searchResults;
  } catch (error: any) {
    handleApiError(error, "Failed to perform search");
    throw error;
  }
};
export type { SearchResponseData };
