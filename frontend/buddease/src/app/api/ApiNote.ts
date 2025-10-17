// ApiNotes.ts
import { handleApiError } from '@/app/api/ApiLogs';
import { Attachment } from '@/app/documents/attachment/Attachment';
import { BaseDataEntity, BaseDataRoot, DefaultExcludedFields, DefaultMeta } from '@/config/BaseConfig';
import axiosInstance from "@/app/api/csrfToken";
import { endpoints } from "@/app/api/endpointConfigurations";
import headersConfig from "@/app/api/headers/HeadersConfig";
import {
  NotificationType,
  useNotification
} from "@/app/context/NotificationContext";
import { ModifiedDate } from "@/app/documents/DocType";
import { NoteData } from "@/app/documents/NoteData";
import { BaseData } from '@/app/models/data/Data';
import FolderData from "@/app/models/data/FolderData";
import { NotificationPosition } from "@/app/models/data/StatusType";
import { Tag } from '@/app/models/tracker/Tag';
import { YourResponseType } from '@/app/typings/responseTypes';
import AccessHistory from "@/app/versions/AccessHistory";
import SearchHistory from "@/app/versions/SearchHistory";
import { Version } from "@/app/versions/Version";
import { StructuredMetadata } from "@/config/StructuredMetadata";
import { Encryption } from "@/server/security/Encryption";
import { AxiosError } from "axios";
import { SearchResponseData } from "./ApiSearch";
import { NoteEntity,
NoteK,
NoteMeta,
NoteAttachment,
NoteExcludedFields,
NoteIncludedFields
} from '@/app/typings/entities/NoteEntity'

// Define the API base URL
const API_BASE_URL = endpoints.notes;

interface NoteNotificationMessages {
  FETCH_NOTE_SUCCESS: string;
  FETCH_NOTE_ERROR: string;
  ADD_NOTE_SUCCESS: string;
  ADD_NOTE_ERROR: string;
  UPDATE_NOTE_SUCCESS: string;
  UPDATE_NOTE_ERROR: string;
  DELETE_NOTE_SUCCESS: string;
  DELETE_NOTE_ERROR: string;

  ARCHIVE_NOTE_ERROR: string;
  RESTORE_NOTE_ERROR: string;
  MOVE_NOTE_ERROR: string;
  MERGE_NOTES_ERROR: string;
  SPLIT_NOTE_ERROR: string;
  SEARCH_NOTE_ERROR: string;
  FILTER_NOTE_ERROR: string;
  SEARCH_NOTES_ERROR: string;
  // Add more keys as needed
}

// Define API notification messages
const apiNotificationMessages: NoteNotificationMessages = {
  FETCH_NOTE_SUCCESS: "Note fetched successfully",
  FETCH_NOTE_ERROR: "Failed to fetch note",
  ADD_NOTE_SUCCESS: "Note added successfully",
  ADD_NOTE_ERROR: "Failed to add note",
  UPDATE_NOTE_SUCCESS: "Note updated successfully",
  UPDATE_NOTE_ERROR: "Failed to update note",
  DELETE_NOTE_SUCCESS: "Note deleted successfully",
  DELETE_NOTE_ERROR: "Failed to delete note",
  ARCHIVE_NOTE_ERROR: "Failed to archive note",
  RESTORE_NOTE_ERROR: "Failed to restore note",
  MOVE_NOTE_ERROR: "Failed to move note",
  MERGE_NOTES_ERROR: "Failed to merge notes",
  SPLIT_NOTE_ERROR: "Failed to split note",
  SEARCH_NOTE_ERROR: "Failed to search note",
  FILTER_NOTE_ERROR: "Failed to filter notes",
  SEARCH_NOTES_ERROR: "Failed to search notes",
  // Add more properties as needed
};

// Extend SearchNotesResponse with attributes from YourResponseType
type SearchNotesResponse = {
  // Add specific attributes related to search notes if needed
  results: Note<T, K>[]; // Assuming an array of Note objects in the response
  totalCount: number; // Total count of search results
  searchData: SearchResponseData<T, K>;
};

interface Note<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  id: number;
  title: string;
  content: string;
  description: string;
  source: string;
  topics: string[];
  highlights: Highlight[];
  keywords: string[];
  folders: FolderData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  options: any;
  folderPath: string;
  createdAt: Date | undefined;
  createdBy: string
  updatedAt: Date | undefined;
  tags: Tag<T, K>[];
  previousMetadata: string;
  currentMetadat: string;
  accessHistory: AccessHistory[];
  lastModifiedDate: ModifiedDate;

  permissions: string;

  encryption: Encryption;
  currentMetadata: StructuredMetadata<any, any, any, any, any, any>;
  searchHistory: SearchHistory[];
  version: Version<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  // Add more properties as needed
}

// Function to handle API errors and notify
export const handleNoteApiErrorAndNotify = (
  error: AxiosError<unknown>,
  errorMessage: string,
  errorMessageId: keyof NoteNotificationMessages
) => {
  handleApiError(error, errorMessage);
  
  if (errorMessageId) {
    // Access the error message directly using standard property access
    const errorMessageText = apiNotificationMessages[errorMessageId];
    
    // Notify using the extracted message
    useNotification().notify(
      errorMessageId,
      errorMessageText,
      new Date(),
      "NoteError" as NotificationType,
      "top-right" as NotificationPosition
    );
  }
};

// Fetch note by ID API
export const fetchNoteByIdAPI = async (
  noteId: number,
  dataCallback: (data: NoteData<NoteEntity, NoteK, NoteMeta, NoteAttachment, NoteExcludedFields, NoteIncludedFields>) => void
): Promise<any> => {
  try {
    const fetchNot ndpoint = `${API_BASE_URL}/notes/${noteId}`;
    const response = await axiosInstance.get(fetchNoteEndpoint, {
      headers: headersConfig,
    });

    // Call the provided data callback with the fetched note data
    dataCallback(response.data);

    // Return the fetched note data if needed
    return response.data;
  } catch (error) {
    console.error("Error fetching note:", error);
    const errorMessage = "Failed to fetch note";
    handleNoteApiErrorAndNotify(
      error as AxiosError<unknown>,
      errorMessage,
      "FETCH_NOTE_ERROR"
    );
    throw error;
  }
};

export const addNote = async (
  newNote: NoteData<NoteEntity, NoteK, NoteMeta, NoteAttachment, NoteExcludedFields, NoteIncludedFields>
): Promise<NoteData<NoteEntity, NoteK, NoteMeta, NoteAttachment, NoteExcludedFields, NoteIncludedFields>
> => {
  try {
    const response = await axiosInstance.post(
      `${API_BASE_URL}/api/notes`,
      newNote,
      {
        headers: headersConfig,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error adding note:", error);
    const errorMessage = "Failed to add note";
    handleNoteApiErrorAndNotify(
      error as AxiosError<unknown>,
      errorMessage,
      "ADD_NOTE_ERROR"
    );
    throw error;
  }
};

export const updateNote = async (
  noteId: string,
  updatedNote: NoteData<NoteEntity, NoteK, NoteMeta, NoteAttachment, NoteExcludedFields, NoteIncludedFields>
): Promise<NoteData<NoteEntity, NoteK, NoteMeta, NoteAttachment, NoteExcludedFields, NoteIncludedFields>> => {
  try {
    const response = await axiosInstance.put(
      `${API_BASE_URL}/api/notes/${noteId}`,
      updatedNote,
      {
        headers: headersConfig,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating note:", error);
    const errorMessage = "Failed to update note";
    handleNoteApiErrorAndNotify(
      error as AxiosError<unknown>,
      errorMessage,
      "UPDATE_NOTE_ERROR"
    );
    throw error;
  }
};

export const archiveNote = async (noteId: string): Promise<any> => {
  try {
    const response = await axiosInstance.post(
      `${API_BASE_URL}/api/notes/archive/${noteId}`,
      null,
      {
        headers: headersConfig,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error archiving note:", error);
    const errorMessage = "Failed to archive note";
    handleNoteApiErrorAndNotify(
      error as AxiosError<unknown>,
      errorMessage,
      "ARCHIVE_NOTE_ERROR"
    );
    throw error;
  }
};

export const restoreNote = async (noteId: string): Promise<any> => {
  try {
    const response = await axiosInstance.post(
      `${API_BASE_URL}/api/notes/restore/${noteId}`,
      null,
      {
        headers: headersConfig,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error restoring note:", error);
    const errorMessage = "Failed to restore note";
    handleNoteApiErrorAndNotify(
      error as AxiosError<unknown>,
      errorMessage,
      "RESTORE_NOTE_ERROR"
    );
    throw error;
  }
};

export const moveNote = async (
  noteId: string,
  destination: string
): Promise<any> => {
  try {
    const response = await axiosInstance.post(
      `${API_BASE_URL}/api/notes/move/${noteId}`,
      { destination },
      {
        headers: headersConfig,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error moving note:", error);
    const errorMessage = "Failed to move note";
    handleNoteApiErrorAndNotify(
      error as AxiosError<unknown>,
      errorMessage,
      "MOVE_NOTE_ERROR"
    );
    throw error;
  }
};

export const mergeNotes = async (noteIds: string[]): Promise<any> => {
  try {
    const response = await axiosInstance.post(
      `${API_BASE_URL}/api/notes/merge`,
      { noteIds },
      {
        headers: headersConfig,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error merging notes:", error);
    const errorMessage = "Failed to merge notes";
    handleNoteApiErrorAndNotify(
      error as AxiosError<unknown>,
      errorMessage,
      "MERGE_NOTES_ERROR"
    );
    throw error;
  }
};

export const splitNote = async (noteId: string): Promise<any> => {
  try {
    const response = await axiosInstance.post(
      `${API_BASE_URL}/api/notes/split`,
      { noteId },
      {
        headers: headersConfig,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error splitting note:", error);
    const errorMessage = "Failed to split note";
    handleNoteApiErrorAndNotify(
      error as AxiosError<unknown>,
      errorMessage,
      "SPLIT_NOTE_ERROR"
    );
    throw error;
  }
};
// Add note API
export const addNoteAPI = async (noteData: any): Promise<any> => {
  try {
    const addNoteEndpoint = `${API_BASE_URL}/notes`;
    const response = await axiosInstance.post(addNoteEndpoint, noteData, {
      headers: headersConfig,
    });
    return response.data;
  } catch (error) {
    console.error("Error adding note:", error);
    const errorMessage = "Failed to add note";
    handleNoteApiErrorAndNotify(
      error as AxiosError<unknown>,
      errorMessage,
      "ADD_NOTE_ERROR"
    );
    throw error;
  }
};

// Update note API
export const updateNoteAPI = async (
  noteId: number,
  updatedData: any
): Promise<any> => {
  try {
    const updateNoteEndpoint = `${API_BASE_URL}/notes/${noteId}`;
    const response = await axiosInstance.put(updateNoteEndpoint, updatedData, {
      headers: headersConfig,
    });
    return response.data;
  } catch (error) {
    console.error("Error updating note:", error);
    const errorMessage = "Failed to update note";
    handleNoteApiErrorAndNotify(
      error as AxiosError<unknown>,
      errorMessage,
      "UPDATE_NOTE_ERROR"
    );
    throw error;
  }
};

// Delete note API
export const deleteNoteAPI = async (noteId: number): Promise<void> => {
  try {
    const deleteNoteEndpoint = `${API_BASE_URL}/notes/${noteId}`;
    await axiosInstance.delete(deleteNoteEndpoint, {
      headers: headersConfig,
    });
  } catch (error) {
    console.error("Error deleting note:", error);
    const errorMessage = "Failed to delete note";
    handleNoteApiErrorAndNotify(
      error as AxiosError<unknown>,
      errorMessage,
      "DELETE_NOTE_ERROR"
    );
    throw error;
  }
};

// List all notes API
export const listAllNotesAPI = async (): Promise<any[]> => {
  try {
    const fetchAllNotesEndpoint = `${API_BASE_URL}/notes`;
    const response = await axiosInstance.get(fetchAllNotesEndpoint, {
      headers: headersConfig,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching all notes:", error);
    const errorMessage = "Failed to fetch all notes";
    handleNoteApiErrorAndNotify(
      error as AxiosError<unknown>,
      errorMessage,
      "FETCH_NOTE_ERROR"
    );
    throw error;
  }
};

// Search notes API

// function with type annotations and centralized error handling
export const searchNotesAPI = async (
  searchQuery: string
): Promise<SearchNotesResponse | undefined> => {
  try {
    const searchNotesEndpoint = `/notes/search?query=${encodeURIComponent(
      searchQuery
    )}`;
    const response = await axiosInstance.get<YourResponseType<
      NoteEntity,
      NoteK,
      NoteMeta,
      NoteAttachment,
      NoteExcludedFields,
      NoteIncludedFields
    >>(searchNotesEndpoint);

    // Ensure that response data matches SearchNotesResponse type
    const responseData: SearchNotesResponse = response.data;

    // Access the properties directly from responseData
    return {
      results: responseData.results || [], // Access 'results' property
      totalCount: responseData.totalCount || 0, // Access 'totalCount' property
      searchData: responseData.searchData || {}, // Access 'searchData' property
    };
  } catch (error) {
    console.error("Error searching notes:", error);
    const errorMessage = "Failed to search notes";
    handleNoteApiErrorAndNotify(
      error as AxiosError<unknown>,
      errorMessage,
      "SEARCH_NOTE_ERROR"
    );
    throw error;
  }
};

// Filter notes API
export const filterNotesAPI = async (
  filters: Record<string, any>
): Promise<any> => {
  try {
    // Construct the filter query based on the provided filters
    const filterQuery = Object.entries(filters)
      .map(
        ([key, value]) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
      )
      .join("&");
    const filterNotesEndpoint = `${API_BASE_URL}/notes/filter?${filterQuery}`;
    const response = await axiosInstance.get(filterNotesEndpoint, {
      headers: headersConfig,
    });
    return response.data;
  } catch (error) {
    console.error("Error filtering notes:", error);
    const errorMessage = "Failed to filter notes";
    handleNoteApiErrorAndNotify(
      error as AxiosError<unknown>,
      errorMessage,
      "FILTER_NOTE_ERROR"
    );
    throw error;
  }
};

export const searchNotes = async <
  T extends  BaseData<any>,
  K extends T = T>(
    keyword: string
  ): Promise<Note<T, K>[]> => {
  try {
    const response = await axiosInstance.get(
      `${API_BASE_URL}/api/notes/search`,
      {
        params: { keyword },
        headers: headersConfig,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error searching notes:", error);
    const errorMessage = "Failed to search notes";
    handleNoteApiErrorAndNotify(
      error as AxiosError<unknown>,
      errorMessage,
      "SEARCH_NOTES_ERROR"
    );
    throw error;
  }
};

export type { Note, SearchNotesResponse };
