// ApiNotes.ts
import { handleApiError } from '@/app/api/ApiLogs';
import axiosInstance from '@/app/api/csrfToken';
import { NotificationOptions } from '@/app/context/NotificationContext'
import { NotificationPosition } from '@/app/models/data/StatusType';
import { endpoints } from '@/app/api/endpointConfigurations';
import headersConfig from '@/app/api/headers/HeadersConfig';
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { StructuredMetadata } from '@/app/config/StructuredMetadata';
import {
  NotificationType,
  useNotification
} from '@/app/context/NotificationContext';
import { Attachment } from '@/app/documents/attachment/Attachment';
import { ModifiedDate } from '@/app/documents/DocType';
import { NoteData } from '@/app/documents/NoteData';
import { BaseData } from '@/app/models/data/Data';
import FolderData from '@/app/models/data/FolderData';
import { Tag } from '@/app/models/tracker/Tag';
import { Encryption } from '@/app/server/security/Encryption';
import {
  NoteAttachment,
  NoteEntity,
  NoteExcludedFields,
  NoteIncludedFields,
  NoteK,
  NoteMeta
} from '@/app/typings/entities/NoteEntity';
import { YourResponseType } from '@/app/typings/responseTypes';
import AccessHistory from '@/app/versions/AccessHistory';
import SearchHistory from '@/app/versions/SearchHistory';
import { Version } from '@/app/versions/Version';
import { AxiosError } from 'axios';
import { SearchResponseData } from './ApiSearch';

// Define the API base URL
const API_BASE_URL = endpoints.notes;

interface NoteNotificationMessages {
  // Core CRUD operations
  FETCH_NOTE_SUCCESS: string;
  FETCH_NOTE_ERROR: string;
  ADD_NOTE_SUCCESS: string;
  ADD_NOTE_ERROR: string;
  UPDATE_NOTE_SUCCESS: string;
  UPDATE_NOTE_ERROR: string;
  DELETE_NOTE_SUCCESS: string;
  DELETE_NOTE_ERROR: string;

  // State management
  ARCHIVE_NOTE_ERROR: string;
  RESTORE_NOTE_ERROR: string;
  MOVE_NOTE_ERROR: string;
  PIN_NOTE_SUCCESS: string;
  PIN_NOTE_ERROR: string;
  UNPIN_NOTE_SUCCESS: string;
  UNPIN_NOTE_ERROR: string;
  DUPLICATE_NOTE_SUCCESS: string;
  DUPLICATE_NOTE_ERROR: string;

  // Content operations
  MERGE_NOTES_ERROR: string;
  SPLIT_NOTE_ERROR: string;

  // Search and filter
  SEARCH_NOTE_ERROR: string;
  FILTER_NOTE_ERROR: string;
  SEARCH_NOTES_ERROR: string;

  // Bulk operations
  BULK_UPDATE_NOTE_SUCCESS: string;
  BULK_UPDATE_NOTE_ERROR: string;
  BULK_DELETE_NOTE_SUCCESS: string;
  BULK_DELETE_NOTE_ERROR: string;

  // Import/Export
  EXPORT_NOTE_SUCCESS: string;
  EXPORT_NOTE_ERROR: string;
  IMPORT_NOTE_SUCCESS: string;
  IMPORT_NOTE_ERROR: string;

  // Tag management
  ADD_TAG_SUCCESS: string;
  ADD_TAG_ERROR: string;
  REMOVE_TAG_SUCCESS: string;
  REMOVE_TAG_ERROR: string;
  FETCH_TAGS_ERROR: string;

  // Attachment management
  ADD_ATTACHMENT_SUCCESS: string;
  ADD_ATTACHMENT_ERROR: string;
  REMOVE_ATTACHMENT_SUCCESS: string;
  REMOVE_ATTACHMENT_ERROR: string;
  FETCH_ATTACHMENTS_ERROR: string;

  // Version management
  FETCH_VERSIONS_ERROR: string;
  RESTORE_VERSION_SUCCESS: string;
  RESTORE_VERSION_ERROR: string;

  // Collaboration
  SHARE_NOTE_SUCCESS: string;
  SHARE_NOTE_ERROR: string;
  UNSHARE_NOTE_SUCCESS: string;
  UNSHARE_NOTE_ERROR: string;
  ADD_COLLABORATOR_SUCCESS: string;
  ADD_COLLABORATOR_ERROR: string;
  REMOVE_COLLABORATOR_SUCCESS: string;
  REMOVE_COLLABORATOR_ERROR: string;
  FETCH_COLLABORATORS_ERROR: string;

  // Comments
  ADD_COMMENT_SUCCESS: string;
  ADD_COMMENT_ERROR: string;
  UPDATE_COMMENT_SUCCESS: string;
  UPDATE_COMMENT_ERROR: string;
  DELETE_COMMENT_SUCCESS: string;
  DELETE_COMMENT_ERROR: string;
  FETCH_COMMENTS_ERROR: string;

  // Analytics
  FETCH_ANALYTICS_ERROR: string;

  // Templates
  FETCH_TEMPLATES_ERROR: string;
  CREATE_FROM_TEMPLATE_SUCCESS: string;
  CREATE_FROM_TEMPLATE_ERROR: string;
}

// Define API notification messages
// Define API notification messages
const apiNotificationMessages: NoteNotificationMessages = {
  // Core CRUD operations
  FETCH_NOTE_SUCCESS: "Note fetched successfully",
  FETCH_NOTE_ERROR: "Failed to fetch note",
  ADD_NOTE_SUCCESS: "Note added successfully",
  ADD_NOTE_ERROR: "Failed to add note",
  UPDATE_NOTE_SUCCESS: "Note updated successfully",
  UPDATE_NOTE_ERROR: "Failed to update note",
  DELETE_NOTE_SUCCESS: "Note deleted successfully",
  DELETE_NOTE_ERROR: "Failed to delete note",

  // State management
  ARCHIVE_NOTE_ERROR: "Failed to archive note",
  RESTORE_NOTE_ERROR: "Failed to restore note",
  MOVE_NOTE_ERROR: "Failed to move note",
  PIN_NOTE_SUCCESS: "Note pinned successfully",
  PIN_NOTE_ERROR: "Failed to pin note",
  UNPIN_NOTE_SUCCESS: "Note unpinned successfully",
  UNPIN_NOTE_ERROR: "Failed to unpin note",
  DUPLICATE_NOTE_SUCCESS: "Note duplicated successfully",
  DUPLICATE_NOTE_ERROR: "Failed to duplicate note",

  // Content operations
  MERGE_NOTES_ERROR: "Failed to merge notes",
  SPLIT_NOTE_ERROR: "Failed to split note",

  // Search and filter
  SEARCH_NOTE_ERROR: "Failed to search note",
  FILTER_NOTE_ERROR: "Failed to filter notes",
  SEARCH_NOTES_ERROR: "Failed to search notes",

  // Bulk operations
  BULK_UPDATE_NOTE_SUCCESS: "Notes updated successfully",
  BULK_UPDATE_NOTE_ERROR: "Failed to update notes",
  BULK_DELETE_NOTE_SUCCESS: "Notes deleted successfully", 
  BULK_DELETE_NOTE_ERROR: "Failed to delete notes",

  // Import/Export
  EXPORT_NOTE_SUCCESS: "Notes exported successfully",
  EXPORT_NOTE_ERROR: "Failed to export notes",
  IMPORT_NOTE_SUCCESS: "Notes imported successfully",
  IMPORT_NOTE_ERROR: "Failed to import notes",

  // Tag management
  ADD_TAG_SUCCESS: "Tag added successfully",
  ADD_TAG_ERROR: "Failed to add tag",
  REMOVE_TAG_SUCCESS: "Tag removed successfully", 
  REMOVE_TAG_ERROR: "Failed to remove tag",
  FETCH_TAGS_ERROR: "Failed to fetch tags",

  // Attachment management
  ADD_ATTACHMENT_SUCCESS: "Attachment added successfully",
  ADD_ATTACHMENT_ERROR: "Failed to add attachment",
  REMOVE_ATTACHMENT_SUCCESS: "Attachment removed successfully",
  REMOVE_ATTACHMENT_ERROR: "Failed to remove attachment",
  FETCH_ATTACHMENTS_ERROR: "Failed to fetch attachments",

  // Version management
  FETCH_VERSIONS_ERROR: "Failed to fetch versions",
  RESTORE_VERSION_SUCCESS: "Version restored successfully",
  RESTORE_VERSION_ERROR: "Failed to restore version",

  // Collaboration
  SHARE_NOTE_SUCCESS: "Note shared successfully",
  SHARE_NOTE_ERROR: "Failed to share note",
  UNSHARE_NOTE_SUCCESS: "Note unshared successfully",
  UNSHARE_NOTE_ERROR: "Failed to unshare note",
  ADD_COLLABORATOR_SUCCESS: "Collaborator added successfully",
  ADD_COLLABORATOR_ERROR: "Failed to add collaborator",
  REMOVE_COLLABORATOR_SUCCESS: "Collaborator removed successfully",
  REMOVE_COLLABORATOR_ERROR: "Failed to remove collaborator",
  FETCH_COLLABORATORS_ERROR: "Failed to fetch collaborators",

  // Comments
  ADD_COMMENT_SUCCESS: "Comment added successfully",
  ADD_COMMENT_ERROR: "Failed to add comment",
  UPDATE_COMMENT_SUCCESS: "Comment updated successfully",
  UPDATE_COMMENT_ERROR: "Failed to update comment",
  DELETE_COMMENT_SUCCESS: "Comment deleted successfully",
  DELETE_COMMENT_ERROR: "Failed to delete comment",
  FETCH_COMMENTS_ERROR: "Failed to fetch comments",

  // Analytics
  FETCH_ANALYTICS_ERROR: "Failed to fetch analytics",

  // Templates
  FETCH_TEMPLATES_ERROR: "Failed to fetch templates",
  CREATE_FROM_TEMPLATE_SUCCESS: "Note created from template successfully",
  CREATE_FROM_TEMPLATE_ERROR: "Failed to create note from template",
};

// Extend SearchNotesResponse with attributes from YourResponseType
type SearchNotesResponse<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> = {
  // Add specific attributes related to search notes if needed
  results: Note<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]; // Assuming an array of Note objects in the response
  totalCount: number; // Total count of search results
  searchData: SearchResponseData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
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
  tags: Tag<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> [];
  previousMetadata: string;
  currentMetadat: string;
  accessHistory: AccessHistory[];
  lastModifiedDate: ModifiedDate;

  permissions: string;

  encryption: Encryption;
  currentMetadata: StructuredMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
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
    
     // Create notification options
    const notificationOptions: NotificationOptions = {
      dataId: errorMessageId,
      type: 'error',
      position: 'top-right',
      persistent: false,
      duration: 5000 // 5 seconds
    };

    // Notify using the extracted message
    useNotification().notify(
      errorMessageId,
      errorMessageText,
      notificationOptions,
      new Date(),
      "NoteError" as NotificationType,
    );
  }
};

// Fetch note by ID API
export const fetchNoteByIdAPI = async (
  noteId: number,
  dataCallback: (data: NoteData<NoteEntity, NoteK, NoteMeta, NoteAttachment, NoteExcludedFields, NoteIncludedFields>) => void
): Promise<any> => {
  try {
    const fetchNoteEndpoint = `${API_BASE_URL}/notes/${noteId}`;
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
export const searchNotesAPI = async <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  searchQuery: string
): Promise<SearchNotesResponse<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined> => {
  try {
    const searchNotesEndpoint = `/notes/search?query=${encodeURIComponent(
      searchQuery
    )}`;
    const response = await axiosInstance.get<YourResponseType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>(searchNotesEndpoint);

    // Ensure that response data matches SearchNotesResponse type
    const responseData: SearchNotesResponse<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = response.data;

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
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
    keyword: string
  ): Promise<Note<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> []> => {
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



export const bulkUpdateNotesAPI = async (
  noteIds: number[],
  updateData: Partial<NoteData<NoteEntity, NoteK, NoteMeta, NoteAttachment, NoteExcludedFields, NoteIncludedFields>>
): Promise<any> => {
  try {
    const response = await axiosInstance.put(
      `${API_BASE_URL}/notes/bulk`,
      { noteIds, updateData },
      { headers: headersConfig }
    );
    return response.data;
  } catch (error) {
    console.error("Error bulk updating notes:", error);
    handleNoteApiErrorAndNotify(
      error as AxiosError<unknown>,
      "Failed to bulk update notes",
      "UPDATE_NOTE_ERROR"
    );
    throw error;
  }
};

export const bulkDeleteNotesAPI = async (noteIds: number[]): Promise<void> => {
  try {
    await axiosInstance.delete(
      `${API_BASE_URL}/notes/bulk`,
      { 
        data: { noteIds },
        headers: headersConfig 
      }
    );
  } catch (error) {
    console.error("Error bulk deleting notes:", error);
    handleNoteApiErrorAndNotify(
      error as AxiosError<unknown>,
      "Failed to bulk delete notes",
      "DELETE_NOTE_ERROR"
    );
    throw error;
  }
};

// Export/Import
export const exportNotesAPI = async (format: 'json' | 'csv' | 'pdf' = 'json'): Promise<any> => {
  try {
    const response = await axiosInstance.get(
      `${API_BASE_URL}/notes/export?format=${format}`,
      { headers: headersConfig }
    );
    return response.data;
  } catch (error) {
    console.error("Error exporting notes:", error);
    handleNoteApiErrorAndNotify(
      error as AxiosError<unknown>,
      "Failed to export notes",
      "FETCH_NOTE_ERROR"
    );
    throw error;
  }
};

export const importNotesAPI = async (importData: any, format: 'json' | 'csv' = 'json'): Promise<any> => {
  try {
    const response = await axiosInstance.post(
      `${API_BASE_URL}/notes/import?format=${format}`,
      importData,
      { headers: headersConfig }
    );
    return response.data;
  } catch (error) {
    console.error("Error importing notes:", error);
    handleNoteApiErrorAndNotify(
      error as AxiosError<unknown>,
      "Failed to import notes",
      "ADD_NOTE_ERROR"
    );
    throw error;
  }
};

// Tag management
export const getNoteTagsAPI = async (noteId: number): Promise<Tag<any, any>[]> => {
  try {
    const response = await axiosInstance.get(
      `${API_BASE_URL}/notes/${noteId}/tags`,
      { headers: headersConfig }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching note tags:", error);
    handleNoteApiErrorAndNotify(
      error as AxiosError<unknown>,
      "Failed to fetch note tags",
      "FETCH_NOTE_ERROR"
    );
    throw error;
  }
};

export const addNoteTagAPI = async (noteId: number, tagData: Partial<Tag<any, any>>): Promise<any> => {
  try {
    const response = await axiosInstance.post(
      `${API_BASE_URL}/notes/${noteId}/tags`,
      tagData,
      { headers: headersConfig }
    );
    return response.data;
  } catch (error) {
    console.error("Error adding note tag:", error);
    handleNoteApiErrorAndNotify(
      error as AxiosError<unknown>,
      "Failed to add note tag",
      "UPDATE_NOTE_ERROR"
    );
    throw error;
  }
};

// Version management
export const getNoteVersionsAPI = async (noteId: number): Promise<Version<any, any, any, any, any, any>[]> => {
  try {
    const response = await axiosInstance.get(
      `${API_BASE_URL}/notes/${noteId}/versions`,
      { headers: headersConfig }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching note versions:", error);
    handleNoteApiErrorAndNotify(
      error as AxiosError<unknown>,
      "Failed to fetch note versions",
      "FETCH_NOTE_ERROR"
    );
    throw error;
  }
};

export const restoreNoteVersionAPI = async (noteId: number, versionId: number): Promise<any> => {
  try {
    const response = await axiosInstance.post(
      `${API_BASE_URL}/notes/${noteId}/versions/${versionId}/restore`,
      null,
      { headers: headersConfig }
    );
    return response.data;
  } catch (error) {
    console.error("Error restoring note version:", error);
    handleNoteApiErrorAndNotify(
      error as AxiosError<unknown>,
      "Failed to restore note version",
      "UPDATE_NOTE_ERROR"
    );
    throw error;
  }
};

// Collaboration
export const getNoteCollaboratorsAPI = async (noteId: number): Promise<any[]> => {
  try {
    const response = await axiosInstance.get(
      `${API_BASE_URL}/notes/${noteId}/collaborators`,
      { headers: headersConfig }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching note collaborators:", error);
    handleNoteApiErrorAndNotify(
      error as AxiosError<unknown>,
      "Failed to fetch note collaborators",
      "FETCH_NOTE_ERROR"
    );
    throw error;
  }
};

export const shareNoteAPI = async (noteId: number, shareSettings: any): Promise<any> => {
  try {
    const response = await axiosInstance.post(
      `${API_BASE_URL}/notes/${noteId}/share`,
      shareSettings,
      { headers: headersConfig }
    );
    return response.data;
  } catch (error) {
    console.error("Error sharing note:", error);
    handleNoteApiErrorAndNotify(
      error as AxiosError<unknown>,
      "Failed to share note",
      "UPDATE_NOTE_ERROR"
    );
    throw error;
  }
};

// Analytics
export const getNoteAnalyticsAPI = async (noteId: number): Promise<any> => {
  try {
    const response = await axiosInstance.get(
      `${API_BASE_URL}/notes/${noteId}/analytics`,
      { headers: headersConfig }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching note analytics:", error);
    handleNoteApiErrorAndNotify(
      error as AxiosError<unknown>,
      "Failed to fetch note analytics",
      "FETCH_NOTE_ERROR"
    );
    throw error;
  }
};

export type { Note, SearchNotesResponse };
