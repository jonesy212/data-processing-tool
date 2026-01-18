// ApiNote.ts
import internalApiService from '@/core/api/ApiClient';
import type { SearchResponseData } from '@/core/api/ApiSearch';
import { endpoints } from '@/core/api/endpointConfigurations';
import { headersConfig } from '@/core/components/shared/SharedHeaders';
import type { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import type { StructuredMetadata } from '@/core/config/StructuredMetadata';
import type { Attachment } from '@/core/documents/attachment/Attachment';
import type { ModifiedDate } from '@/core/documents/DocType';
import type { NoteData } from '@/core/documents/NoteData';
import { NotificationTypeEnum } from '@/core/features/support/UnifiedNotificationTypes';
import FolderData from '@/core/models/data/FolderData';
import type { Tag } from '@/core/models/tracker/Tag';
import { Encryption } from '@/core/server/security/Encryption';
import { useNotification } from '@/core/state/context/NotificationContext';
import type { NoteEntity, NoteK } from '@/core/typings/entities/NoteEntity';
import type {
    NoteAttachment,
    NoteExcludedFields,
    NoteIncludedFields,
    NoteMeta
} from '@/core/typings/entities/NoteEntity';
import type { YourResponseType } from '@/core/typings/responseTypes';
import AccessHistory from '@/core/versions/AccessHistory';
import SearchHistory from '@/core/versions/SearchHistory';
import type { Version } from '@/core/versions/Version';
import { AxiosError } from 'axios';

// Define the API base URL
const API_BASE_URL = endpoints.notes;
const { notify } = useNotification();

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

  ARCHIVE_NOTE_SUCCESS: string;
  RESTORE_NOTE_SUCCESS: string;
  MOVE_NOTE_SUCCESS: string;
  MERGE_NOTES_SUCCESS: string;
  SPLIT_NOTE_SUCCESS: string;
  

  FETCH_TAGS_SUCCESS: string;
  FETCH_ATTACHMENTS_SUCCESS: string;
  FETCH_VERSIONS_SUCCESS: string;
  FETCH_COLLABORATORS_SUCCESS: string;
  FETCH_COMMENTS_SUCCESS: string;
  FETCH_ANALYTICS_SUCCESS: string;
  FETCH_TEMPLATES_SUCCESS: string;
}

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

  ARCHIVE_NOTE_SUCCESS: "Note archived successfully",
  RESTORE_NOTE_SUCCESS: "Note restored successfully", 
  MOVE_NOTE_SUCCESS: "Note moved successfully",
  MERGE_NOTES_SUCCESS: "Notes merged successfully",
  SPLIT_NOTE_SUCCESS: "Note split successfully",
  
  // Add success messages for fetch operations
  FETCH_TAGS_SUCCESS: "Tags fetched successfully",
  FETCH_ATTACHMENTS_SUCCESS: "Attachments fetched successfully",
  FETCH_VERSIONS_SUCCESS: "Versions fetched successfully",
  FETCH_COLLABORATORS_SUCCESS: "Collaborators fetched successfully",
  FETCH_COMMENTS_SUCCESS: "Comments fetched successfully",
  FETCH_ANALYTICS_SUCCESS: "Analytics fetched successfully",
  FETCH_TEMPLATES_SUCCESS: "Templates fetched successfully",

};

// Success notification for note-related actions
const notifyNoteSuccess = (
  id: string,
  messageKey: keyof NoteNotificationMessages,
  data: any = null
) => {
  const messageText = apiNotificationMessages[messageKey];
  useNotification().notify({
    id,
    message: messageText,
    data,
    timestamp: new Date(),
    type: NotificationTypeEnum.SUCCESS
  });
};

// Error handler with notification for notes
export const handleNoteApiErrorAndNotify = (
  error: AxiosError<unknown>,
  defaultMessage: string,
  errorType: string,
  additionalData?: any
) => {
  const axiosError = error as AxiosError;
  
  // Determine the appropriate message
  let message = defaultMessage;
  if (axiosError.response?.status === 404) {
    message = "Note not found";
  } else if (axiosError.response?.status === 401 || axiosError.response?.status === 403) {
    message = "Authentication required";
  } else if (axiosError.response?.status === 400) {
    message = "Invalid data";
  }
  
  notify({
    id: `note_${errorType}_${Date.now()}`,
    message,
    data: {
      originalError: axiosError.message || 'Unknown error',
      entityType: 'note',
      extra: {
        ...additionalData,
        errorCode: axiosError.response?.status,
        errorType,
        timestamp: new Date().toISOString()
      }
    },
    timestamp: new Date(),
    type: NotificationTypeEnum.OPERATION_ERROR,
    level: 'error' as const
  });
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
  results: Note<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  totalCount: number;
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
  tags: Tag<T>[];
  previousMetadata: string;
  currentMetadat: string;
  accessHistory: AccessHistory[];
  lastModifiedDate: ModifiedDate;
  permissions: string;
  encryption: Encryption;
  currentMetadata: StructuredMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  searchHistory: SearchHistory[];
  version: Version<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
}

export const fetchNoteByIdAPI = async (
  noteId: number,
  dataCallback: (data: NoteData<NoteEntity, NoteK, NoteMeta, NoteAttachment, NoteExcludedFields, NoteIncludedFields>) => void
): Promise<any> => {
  try {
    const response = await internalApiService.get(
      `${API_BASE_URL}/notes/${noteId}`,
      { config: { headers: headersConfig } },
      "FETCH_NOTE_SUCCESS" as any,
      "FETCH_NOTE_ERROR" as any,
      { noteId }
    );

    dataCallback(response.data);
    
    // Success notification
    notify({
      id: `fetch_note_success_${noteId}_${Date.now()}`,
      message: "Note fetched successfully",
      data: {
        entityId: noteId.toString(),
        entityType: 'note',
        extra: { noteId, action: 'fetch' }
      },
      timestamp: new Date(),
      type: NotificationTypeEnum.OPERATION_SUCCESS,
      level: 'success' as const
    });
    
    return response.data;
  } catch (error) {
    handleNoteApiErrorAndNotify(
      error as AxiosError<unknown>,
      "Failed to fetch note",
      "FETCH_NOTE_ERROR",
      { noteId, action: 'fetch' }
    );
    throw error;
  }
};


export const addNote = async (
  newNote: NoteData<NoteEntity, NoteK, NoteMeta, NoteAttachment, NoteExcludedFields, NoteIncludedFields>
): Promise<NoteData<NoteEntity, NoteK, NoteMeta, NoteAttachment, NoteExcludedFields, NoteIncludedFields>> => {
  try {
    const response = await internalApiService.post(
      `${API_BASE_URL}/api/notes`,
      newNote,
      { config: { headers: headersConfig } },
      "ADD_NOTE_SUCCESS" as any,
      "ADD_NOTE_ERROR" as any,
      { newNote }
    );
    return response.data;
  } catch (error) {
    handleNoteApiErrorAndNotify(
      error as AxiosError<unknown>,
      "Failed to add note",
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
    const response = await internalApiService.put(
      `${API_BASE_URL}/api/notes/${noteId}`,
      updatedNote,
      {
        config: {headers: headersConfig},
        successMessageId: "UPDATE_NOTE_SUCCESS",  // Might need to be in config
        errorMessageId: "UPDATE_NOTE_ERROR",      // Might need to be in config
        notificationData: { noteId, updatedNote } // Might need to be in config
      }
    );
    return response.data;
  } catch (error) {
    handleNoteApiErrorAndNotify(
      error as AxiosError<unknown>,
      "Failed to update note",
      "UPDATE_NOTE_ERROR"
    );
    throw error;
  }
};

export const archiveNote = async (noteId: string): Promise<any> => {
  try {
    const response = await internalApiService.post(
      `${API_BASE_URL}/api/notes/archive/${noteId}`,
      null,
      { config: { headers: headersConfig } }
    );
    
    notifyNoteSuccess(
      `archive-note-${noteId}`,
      "Note archived successfully",
      { noteId }
    );
    
    return response.data;
  } catch (error) {
    handleNoteApiErrorAndNotify(
      error as AxiosError<unknown>,
      "Failed to archive note",
      "ARCHIVE_NOTE_ERROR"
    );
    throw error;
  }
};

export const restoreNote = async (noteId: string): Promise<any> => {
  try {
    const response = await internalApiService.post(
      `${API_BASE_URL}/api/notes/restore/${noteId}`,
      null,
      { config: { headers: headersConfig } }
    );
    
    notifyNoteSuccess(
      `restore-note-${noteId}`,
      "Note restored successfully",
      { noteId }
    );
    
    return response.data;
  } catch (error) {
    handleNoteApiErrorAndNotify(
      error as AxiosError<unknown>,
      "Failed to restore note",
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
    const response = await internalApiService.post(
      `${API_BASE_URL}/api/notes/move/${noteId}`,
      { destination },
      { config: { headers: headersConfig } }
    );
    
    notifyNoteSuccess(
      `move-note-${noteId}`,
      "Note moved successfully",
      { noteId, destination }
    );
    
    return response.data;
  } catch (error) {
    handleNoteApiErrorAndNotify(
      error as AxiosError<unknown>,
      "Failed to move note",
      "MOVE_NOTE_ERROR"
    );
    throw error;
  }
};

export const mergeNotes = async (noteIds: string[]): Promise<any> => {
  try {
    const response = await internalApiService.post(
      `${API_BASE_URL}/api/notes/merge`,
      { noteIds },
      { config: { headers: headersConfig } }
    );
    
    notifyNoteSuccess(
      `merge-notes-${noteIds.join('-')}`,
      "Notes merged successfully",
      { noteIds }
    );
    
    return response.data;
  } catch (error) {
    handleNoteApiErrorAndNotify(
      error as AxiosError<unknown>,
      "Failed to merge notes",
      "MERGE_NOTES_ERROR"
    );
    throw error;
  }
};

export const splitNote = async (noteId: string): Promise<any> => {
  try {
    const response = await internalApiService.post(
      `${API_BASE_URL}/api/notes/split`,
      { noteId },
      { config: { headers: headersConfig } }
    );
    
    notifyNoteSuccess(
      `split-note-${noteId}`,
      "Note split successfully",
      { noteId }
    );
    
    return response.data;
  } catch (error) {
    handleNoteApiErrorAndNotify(
      error as AxiosError<unknown>,
      "Failed to split note",
      "SPLIT_NOTE_ERROR"
    );
    throw error;
  }
};

export const addNoteAPI = async (noteData: any): Promise<any> => {
  try {
    const response = await internalApiService.post(
      `${API_BASE_URL}/notes`,
      noteData,
      { config: { headers: headersConfig } },
      "ADD_NOTE_SUCCESS" as any,
      "ADD_NOTE_ERROR" as any,
      { noteData }
    );
    return response.data;
  } catch (error) {
    handleNoteApiErrorAndNotify(
      error as AxiosError<unknown>,
      "Failed to add note",
      "ADD_NOTE_ERROR"
    );
    throw error;
  }
};

export const updateNoteAPI = async (
  noteId: number,
  updatedData: any
): Promise<any> => {
  try {
    const response = await internalApiService.put(
      `${API_BASE_URL}/notes/${noteId}`,
      updatedData,
      { config: { headers: headersConfig } },
      "UPDATE_NOTE_SUCCESS" as any,
      "UPDATE_NOTE_ERROR" as any,
      { noteId, updatedData }
    );
    return response.data;
  } catch (error) {
    handleNoteApiErrorAndNotify(
      error as AxiosError<unknown>,
      "Failed to update note",
      "UPDATE_NOTE_ERROR"
    );
    throw error;
  }
};

export const deleteNoteAPI = async (noteId: number): Promise<void> => {
  try {
    await internalApiService.delete(
      `${API_BASE_URL}/notes/${noteId}`,
      { config: { headers: headersConfig } },
      "DELETE_NOTE_SUCCESS" as any,
      "DELETE_NOTE_ERROR" as any,
      { noteId }
    );
  } catch (error) {
    handleNoteApiErrorAndNotify(
      error as AxiosError<unknown>,
      "Failed to delete note",
      "DELETE_NOTE_ERROR"
    );
    throw error;
  }
};

export const listAllNotesAPI = async (): Promise<any[]> => {
  try {
    const response = await internalApiService.get(
      `${API_BASE_URL}/notes`,
      { config: { headers: headersConfig } },
      "FETCH_NOTE_SUCCESS" as any,
      "FETCH_NOTE_ERROR" as any
    );
    return response.data;
  } catch (error) {
    handleNoteApiErrorAndNotify(
      error as AxiosError<unknown>,
      "Failed to fetch all notes",
      "FETCH_NOTE_ERROR"
    );
    throw error;
  }
};

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
    const searchNotesEndpoint = `/notes/search?query=${encodeURIComponent(searchQuery)}`;
    const response = await internalApiService.get<YourResponseType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>(searchNotesEndpoint);

    const responseData: SearchNotesResponse<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = response.data;

    return {
      results: responseData.results || [],
      totalCount: responseData.totalCount || 0,
      searchData: responseData.searchData || {},
    };
  } catch (error) {
    handleNoteApiErrorAndNotify(
      error as AxiosError<unknown>,
      "Failed to search notes",
      "SEARCH_NOTE_ERROR"
    );
    throw error;
  }
};

// Continue updating remaining functions with the same pattern...

export const filterNotesAPI = async (
  filters: Record<string, any>
): Promise<any> => {
  try {
    const filterQuery = Object.entries(filters)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join("&");
    
    const response = await internalApiService.get(
      `${API_BASE_URL}/notes/filter?${filterQuery}`,
      { config: { headers: headersConfig } }
    );
    
    return response.data;
  } catch (error) {
    handleNoteApiErrorAndNotify(
      error as AxiosError<unknown>,
      "Failed to filter notes",
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
): Promise<Note<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> => {
  try {
    const response = await internalApiService.get(
      `${API_BASE_URL}/api/notes/search`,
      {
        params: { keyword },
        headers: headersConfig,
      }
    );
    return response.data;
  } catch (error) {
    handleNoteApiErrorAndNotify(
      error as AxiosError<unknown>,
      "Failed to search notes",
      "SEARCH_NOTES_ERROR"
    );
    throw error;
  }
};

// Continue with the remaining functions using the same pattern...

export const bulkUpdateNotesAPI = async (
  noteIds: number[],
  updateData: Partial<NoteData<NoteEntity, NoteK, NoteMeta, NoteAttachment, NoteExcludedFields, NoteIncludedFields>>
): Promise<any> => {
  try {
    const response = await internalApiService.put(
      `${API_BASE_URL}/notes/bulk`,
      { noteIds, updateData },
      { config: { headers: headersConfig } },
      "BULK_UPDATE_NOTE_SUCCESS" as any,
      "BULK_UPDATE_NOTE_ERROR" as any,
      { noteIds, updateData }
    );
    return response.data;
  } catch (error) {
    handleNoteApiErrorAndNotify(
      error as AxiosError<unknown>,
      "Failed to bulk update notes",
      "BULK_UPDATE_NOTE_ERROR"
    );
    throw error;
  }
};

export const bulkDeleteNotesAPI = async (noteIds: number[]): Promise<void> => {
  try {
    await internalApiService.delete(
      `${API_BASE_URL}/notes/bulk`,
      { 
        data: { noteIds },
        headers: headersConfig 
      },
      "BULK_DELETE_NOTE_SUCCESS" as any,
      "BULK_DELETE_NOTE_ERROR" as any,
      { noteIds }
    );
  } catch (error) {
    handleNoteApiErrorAndNotify(
      error as AxiosError<unknown>,
      "Failed to bulk delete notes",
      "BULK_DELETE_NOTE_ERROR"
    );
    throw error;
  }
};
// Export/Import
export const exportNotesAPI = async (format: 'json' | 'csv' | 'pdf' = 'json'): Promise<any> => {
  try {
    const response = await internalApiService.get(
      `${API_BASE_URL}/notes/export?format=${format}`,
      { config: { headers: headersConfig } },
      "EXPORT_NOTE_SUCCESS" as any,
      "EXPORT_NOTE_ERROR" as any,
      { format }
    );
    return response.data;
  } catch (error) {
    handleNoteApiErrorAndNotify(
      error as AxiosError<unknown>,
      "Failed to export notes",
      "EXPORT_NOTE_ERROR"
    );
    throw error;
  }
};

export const importNotesAPI = async (importData: any, format: 'json' | 'csv' = 'json'): Promise<any> => {
  try {
    const response = await internalApiService.post(
      `${API_BASE_URL}/notes/import?format=${format}`,
      importData,
      { config: { headers: headersConfig } },
      "IMPORT_NOTE_SUCCESS" as any,
      "IMPORT_NOTE_ERROR" as any,
      { format, importData }
    );
    return response.data;
  } catch (error) {
    handleNoteApiErrorAndNotify(
      error as AxiosError<unknown>,
      "Failed to import notes",
      "IMPORT_NOTE_ERROR"
    );
    throw error;
  }
};

// Tag management
export const getNoteTagsAPI = async (noteId: number): Promise<Tag<any>[]> => {
  try {
    const response = await internalApiService.get(
      `${API_BASE_URL}/notes/${noteId}/tags`,
      { config: { headers: headersConfig } }
    );
    return response.data;
  } catch (error) {
    handleNoteApiErrorAndNotify(
      error as AxiosError<unknown>,
      "Failed to fetch note tags",
      "FETCH_TAGS_ERROR"
    );
    throw error;
  }
};

export const addNoteTagAPI = async (noteId: number, tagData: Partial<Tag<any>>): Promise<any> => {
  try {
    const response = await internalApiService.post(
      `${API_BASE_URL}/notes/${noteId}/tags`,
      tagData,
      { config: { headers: headersConfig } },
      "ADD_TAG_SUCCESS" as any,
      "ADD_TAG_ERROR" as any,
      { noteId, tagData }
    );
    
    notifyNoteSuccess(
      `add-tag-${noteId}`,
      "Tag added successfully",
      { noteId, tagData }
    );
    
    return response.data;
  } catch (error) {
    handleNoteApiErrorAndNotify(
      error as AxiosError<unknown>,
      "Failed to add note tag",
      "ADD_TAG_ERROR"
    );
    throw error;
  }
};

export const removeNoteTagAPI = async (noteId: number, tagId: number): Promise<void> => {
  try {
    await internalApiService.delete(
      `${API_BASE_URL}/notes/${noteId}/tags/${tagId}`,
      { config: { headers: headersConfig } },
      "REMOVE_TAG_SUCCESS" as any,
      "REMOVE_TAG_ERROR" as any,
      { noteId, tagId }
    );
    
    notifyNoteSuccess(
      `remove-tag-${noteId}-${tagId}`,
      "Tag removed successfully",
      { noteId, tagId }
    );
  } catch (error) {
    handleNoteApiErrorAndNotify(
      error as AxiosError<unknown>,
      "Failed to remove note tag",
      "REMOVE_TAG_ERROR"
    );
    throw error;
  }
};

// Version management
export const getNoteVersionsAPI = async (noteId: number): Promise<Version<any, any, any, any, any, any>[]> => {
  try {
    const response = await internalApiService.get(
      `${API_BASE_URL}/notes/${noteId}/versions`,
      { config: { headers: headersConfig } }
    );
    return response.data;
  } catch (error) {
    handleNoteApiErrorAndNotify(
      error as AxiosError<unknown>,
      "Failed to fetch note versions",
      "FETCH_VERSIONS_ERROR"
    );
    throw error;
  }
};

export const restoreNoteVersionAPI = async (noteId: number, versionId: number): Promise<any> => {
  try {
    const response = await internalApiService.post(
      `${API_BASE_URL}/notes/${noteId}/versions/${versionId}/restore`,
      null,
      { config: { headers: headersConfig } },
      "RESTORE_VERSION_SUCCESS" as any,
      "RESTORE_VERSION_ERROR" as any,
      { noteId, versionId }
    );
    
    notifyNoteSuccess(
      `restore-version-${noteId}-${versionId}`,
      "Version restored successfully",
      { noteId, versionId }
    );
    
    return response.data;
  } catch (error) {
    handleNoteApiErrorAndNotify(
      error as AxiosError<unknown>,
      "Failed to restore note version",
      "RESTORE_VERSION_ERROR"
    );
    throw error;
  }
};

// Collaboration
export const getNoteCollaboratorsAPI = async (noteId: number): Promise<any[]> => {
  try {
    const response = await internalApiService.get(
      `${API_BASE_URL}/notes/${noteId}/collaborators`,
      { config: { headers: headersConfig } }
    );
    return response.data;
  } catch (error) {
    handleNoteApiErrorAndNotify(
      error as AxiosError<unknown>,
      "Failed to fetch note collaborators",
      "FETCH_COLLABORATORS_ERROR"
    );
    throw error;
  }
};

export const shareNoteAPI = async (noteId: number, shareSettings: any): Promise<any> => {
  try {
    const response = await internalApiService.post(
      `${API_BASE_URL}/notes/${noteId}/share`,
      shareSettings,
      { config: { headers: headersConfig } },
      "SHARE_NOTE_SUCCESS" as any,
      "SHARE_NOTE_ERROR" as any,
      { noteId, shareSettings }
    );
    
    notifyNoteSuccess(
      `share-note-${noteId}`,
      "Note shared successfully",
      { noteId, shareSettings }
    );
    
    return response.data;
  } catch (error) {
    handleNoteApiErrorAndNotify(
      error as AxiosError<unknown>,
      "Failed to share note",
      "SHARE_NOTE_ERROR"
    );
    throw error;
  }
};

export const unshareNoteAPI = async (noteId: number): Promise<any> => {
  try {
    const response = await internalApiService.post(
      `${API_BASE_URL}/notes/${noteId}/unshare`,
      null,
      { config: { headers: headersConfig } },
      "UNSHARE_NOTE_SUCCESS" as any,
      "UNSHARE_NOTE_ERROR" as any,
      { noteId }
    );
    
    notifyNoteSuccess(
      `unshare-note-${noteId}`,
      "Note unshared successfully",
      { noteId }
    );
    
    return response.data;
  } catch (error) {
    handleNoteApiErrorAndNotify(
      error as AxiosError<unknown>,
      "Failed to unshare note",
      "UNSHARE_NOTE_ERROR"
    );
    throw error;
  }
};

export const addNoteCollaboratorAPI = async (noteId: number, collaboratorData: any): Promise<any> => {
  try {
    const response = await internalApiService.post(
      `${API_BASE_URL}/notes/${noteId}/collaborators`,
      collaboratorData,
      { config: { headers: headersConfig } },
      "ADD_COLLABORATOR_SUCCESS" as any,
      "ADD_COLLABORATOR_ERROR" as any,
      { noteId, collaboratorData }
    );
    
    notifyNoteSuccess(
      `add-collaborator-${noteId}`,
      "Collaborator added successfully",
      { noteId, collaboratorData }
    );
    
    return response.data;
  } catch (error) {
    handleNoteApiErrorAndNotify(
      error as AxiosError<unknown>,
      "Failed to add collaborator",
      "ADD_COLLABORATOR_ERROR"
    );
    throw error;
  }
};

export const removeNoteCollaboratorAPI = async (noteId: number, collaboratorId: number): Promise<void> => {
  try {
    await internalApiService.delete(
      `${API_BASE_URL}/notes/${noteId}/collaborators/${collaboratorId}`,
      { config: { headers: headersConfig } },
      "REMOVE_COLLABORATOR_SUCCESS" as any,
      "REMOVE_COLLABORATOR_ERROR" as any,
      { noteId, collaboratorId }
    );
    
    notifyNoteSuccess(
      `remove-collaborator-${noteId}-${collaboratorId}`,
      "Collaborator removed successfully",
      { noteId, collaboratorId }
    );
  } catch (error) {
    handleNoteApiErrorAndNotify(
      error as AxiosError<unknown>,
      "Failed to remove collaborator",
      "REMOVE_COLLABORATOR_ERROR"
    );
    throw error;
  }
};

// Comments
export const getNoteCommentsAPI = async (noteId: number): Promise<any[]> => {
  try {
    const response = await internalApiService.get(
      `${API_BASE_URL}/notes/${noteId}/comments`,
      { config: { headers: headersConfig } }
    );
    return response.data;
  } catch (error) {
    handleNoteApiErrorAndNotify(
      error as AxiosError<unknown>,
      "Failed to fetch note comments",
      "FETCH_COMMENTS_ERROR"
    );
    throw error;
  }
};

export const addNoteCommentAPI = async (noteId: number, commentData: any): Promise<any> => {
  try {
    const response = await internalApiService.post(
      `${API_BASE_URL}/notes/${noteId}/comments`,
      commentData,
      { config: { headers: headersConfig } },
      "ADD_COMMENT_SUCCESS" as any,
      "ADD_COMMENT_ERROR" as any,
      { noteId, commentData }
    );
    
    notifyNoteSuccess(
      `add-comment-${noteId}`,
      "Comment added successfully",
      { noteId, commentData }
    );
    
    return response.data;
  } catch (error) {
    handleNoteApiErrorAndNotify(
      error as AxiosError<unknown>,
      "Failed to add comment",
      "ADD_COMMENT_ERROR"
    );
    throw error;
  }
};

export const updateNoteCommentAPI = async (noteId: number, commentId: number, commentData: any): Promise<any> => {
  try {
    const response = await internalApiService.put(
      `${API_BASE_URL}/notes/${noteId}/comments/${commentId}`,
      commentData,
      { config: { headers: headersConfig } },
      "UPDATE_COMMENT_SUCCESS" as any,
      "UPDATE_COMMENT_ERROR" as any,
      { noteId, commentId, commentData }
    );
    
    notifyNoteSuccess(
      `update-comment-${noteId}-${commentId}`,
      "Comment updated successfully",
      { noteId, commentId, commentData }
    );
    
    return response.data;
  } catch (error) {
    handleNoteApiErrorAndNotify(
      error as AxiosError<unknown>,
      "Failed to update comment",
      "UPDATE_COMMENT_ERROR"
    );
    throw error;
  }
};

export const deleteNoteCommentAPI = async (noteId: number, commentId: number): Promise<void> => {
  try {
    await internalApiService.delete(
      `${API_BASE_URL}/notes/${noteId}/comments/${commentId}`,
      { config: { headers: headersConfig } },
      "DELETE_COMMENT_SUCCESS" as any,
      "DELETE_COMMENT_ERROR" as any,
      { noteId, commentId }
    );
    
    notifyNoteSuccess(
      `delete-comment-${noteId}-${commentId}`,
      "Comment deleted successfully",
      { noteId, commentId }
    );
  } catch (error) {
    handleNoteApiErrorAndNotify(
      error as AxiosError<unknown>,
      "Failed to delete comment",
      "DELETE_COMMENT_ERROR"
    );
    throw error;
  }
};

// Analytics
export const getNoteAnalyticsAPI = async (noteId: number): Promise<any> => {
  try {
    const response = await internalApiService.get(
      `${API_BASE_URL}/notes/${noteId}/analytics`,
      { config: { headers: headersConfig } }
    );
    return response.data;
  } catch (error) {
    handleNoteApiErrorAndNotify(
      error as AxiosError<unknown>,
      "Failed to fetch note analytics",
      "FETCH_ANALYTICS_ERROR"
    );
    throw error;
  }
};

// Templates
export const getNoteTemplatesAPI = async (): Promise<any[]> => {
  try {
    const response = await internalApiService.get(
      `${API_BASE_URL}/notes/templates`,
      { config: { headers: headersConfig } }
    );
    return response.data;
  } catch (error) {
    handleNoteApiErrorAndNotify(
      error as AxiosError<unknown>,
      "Failed to fetch note templates",
      "FETCH_TEMPLATES_ERROR"
    );
    throw error;
  }
};

export const createNoteFromTemplateAPI = async (templateId: number, noteData: any): Promise<any> => {
  try {
    const response = await internalApiService.post(
      `${API_BASE_URL}/notes/templates/${templateId}/create`,
      noteData,
      { config: { headers: headersConfig } },
      "CREATE_FROM_TEMPLATE_SUCCESS" as any,
      "CREATE_FROM_TEMPLATE_ERROR" as any,
      { templateId, noteData }
    );
    
    notifyNoteSuccess(
      `create-from-template-${templateId}`,
      "Note created from template successfully",
      { templateId, noteData }
    );
    
    return response.data;
  } catch (error) {
    handleNoteApiErrorAndNotify(
      error as AxiosError<unknown>,
      "Failed to create note from template",
      "CREATE_FROM_TEMPLATE_ERROR"
    );
    throw error;
  }
};

export { apiNotificationMessages };
export type { Note, SearchNotesResponse };

