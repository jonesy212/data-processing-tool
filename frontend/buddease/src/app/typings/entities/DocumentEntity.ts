// DocumentEntity.ts
// DocumentEntity.types.ts
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/config/BaseConfig';
import { Attachment } from "@/app/documents/Attachment/attachment";
import { DocumentObject } from '@/app/documents/DocumentObject';

// Core Document type definitions
interface DocumentEntity extends BaseDataEntity {
  id: string;
  title: string;
  content: string;
  filePath?: string;
  fileType?: string;
  size?: number;
  version?: string;
  author?: string;
  lastModified?: Date;
  isPublished?: boolean;
}

type DocumentK = DocumentEntity;
type DocumentMeta = DefaultMeta<DocumentEntity, DocumentK>;
type DocumentAttachment = Attachment;
type DocumentExcludedFields = DefaultExcludedFields<DocumentEntity>;
type DocumentIncludedFields = keyof DocumentEntity;

// Main parameters container
type DocumentBaseParams = {
  T: DocumentEntity;
  K: DocumentK;
  Meta: DocumentMeta;
  AttachmentType: DocumentAttachment;
  ExcludedFields: DocumentExcludedFields;
  IncludedFields: DocumentIncludedFields;
};





// App-specific Document types (following the same pattern as User and Phase)
type AppDocument = DocumentObject<
  DocumentEntity, DocumentK, DocumentMeta, DocumentAttachment, DocumentExcludedFields, DocumentIncludedFields
>;

type AppDocumentData = DocumentData<
  DocumentEntity, DocumentK, DocumentMeta, DocumentAttachment, DocumentExcludedFields, DocumentIncludedFields
>;

// Document snapshot types
type AppDocumentSnapshot = Snapshot<
  DocumentEntity, DocumentK, DocumentMeta, DocumentAttachment, DocumentExcludedFields, DocumentIncludedFields
>;

type AppDocumentSnapshotData = SnapshotData<
  DocumentEntity, DocumentK, DocumentMeta, DocumentAttachment, DocumentExcludedFields, DocumentIncludedFields
>;

type AppDocumentSnapshotStore = SnapshotStore<
  DocumentEntity, DocumentK, DocumentMeta, DocumentAttachment, DocumentExcludedFields, DocumentIncludedFields
>;

// Document metadata types
type AppDocumentUnifiedMetadata = UnifiedMetadata<
  DocumentEntity, DocumentK, DocumentMeta, DocumentAttachment, DocumentExcludedFields, DocumentIncludedFields
>;

type AppDocumentStructuredMetadata = StructuredMetadata<
  DocumentEntity, DocumentK, DocumentMeta, DocumentAttachment, DocumentExcludedFields, DocumentIncludedFields
>;

// Document realtime types
type AppDocumentRealtimeDataItem = RealtimeDataItem<
  DocumentEntity, DocumentK, DocumentMeta, DocumentAttachment, DocumentExcludedFields, DocumentIncludedFields
>;

// Document configuration types
type DocumentSnapshotStoreConfig = SnapshotStoreConfig<
  DocumentEntity, DocumentK, DocumentMeta, DocumentAttachment, DocumentExcludedFields, DocumentIncludedFields
>;

type DocumentSnapshotsArray = SnapshotsArray<
  DocumentEntity, DocumentK, DocumentMeta, DocumentAttachment, DocumentExcludedFields, DocumentIncludedFields
>;

type DocumentParams = SnapshotConfigParams<
  DocumentEntity, DocumentK, DocumentMeta, DocumentAttachment, DocumentExcludedFields, DocumentIncludedFields
>;

// Document frontend structure
type DocumentFrontendStructure = FrontendStructure<
  DocumentEntity, DocumentK, DocumentMeta, DocumentAttachment, DocumentExcludedFields, DocumentIncludedFields
>;

// Document variations and utility types
type PublicDocument = Pick<AppDocument, "id" | "title" | "content" | "author" | "lastModified" | "isPublished">;
type PrivateDocument = AppDocument; // Full document for authorized users
type DocumentSummary = Pick<AppDocument, "id" | "title" | "author" | "lastModified" | "fileType" | "size">;


// Helper for creating document instances
const createDefaultDocument = (options: Partial<DocumentFull> = {}): DocumentFull => ({
  id: options.id || generateId(),
  title: options.title || '',
  content: options.content || '',
  filePath: options.filePath,
  fileType: options.fileType,
  size: options.size || 0,
  version: options.version || '1.0.0',
  author: options.author,
  lastModified: options.lastModified || new Date(),
  isPublished: options.isPublished ?? false,
  ...options
} as DocumentFull);

// Empty/default document
const emptyDocument: DocumentFull = createDefaultDocument();

// Document state types
type DocumentSession = {
  document: AppDocument;
  permissions: DocumentPermissions;
  lastAccessed: Date;
  collaborators: string[];
};

type DocumentContext = {
  currentDocument: AppDocument | null;
  isLoading: boolean;
  hasUnsavedChanges: boolean;
  saveDocument: (content: string) => Promise<void>;
  updateDocument: (updates: Partial<AppDocument>) => Promise<void>;
  shareDocument: (users: string[]) => Promise<void>;
};

// Document utility types
type DocumentFilterOptions = {
  fileType?: string;
  author?: string;
  isPublished?: boolean;
  dateRange?: { start: Date; end: Date };
  search?: string;
  tags?: string[];
};

type DocumentSortOptions = {
  field: keyof AppDocument;
  direction: 'asc' | 'desc';
};

type DocumentPermissions = {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canShare: boolean;
  canDownload: boolean;
};

// Document versioning types
type DocumentVersion = {
  id: string;
  version: string;
  content: string;
  author: string;
  timestamp: Date;
  changes: string[];
  snapshot?: AppDocumentSnapshot;
};

type DocumentVersionHistory = {
  current: DocumentVersion;
  previous: DocumentVersion[];
};

// Document collaboration types
type DocumentCollaborator = {
  userId: string;
  permissions: DocumentPermissions;
  joinedAt: Date;
  lastActive: Date;
};

type DocumentComment = {
  id: string;
  author: string;
  content: string;
  timestamp: Date;
  resolved: boolean;
  range?: { start: number; end: number };
};




// Helper for creating document data
const createDefaultDocumentData = (options: Partial<AppDocumentData> = {}): AppDocumentData => ({
  ...createDefaultDocument(options),
  // Add any DocumentData specific fields here
  ...options
} as AppDocumentData);

// Helper for creating document versions
const createDocumentVersion = (document: AppDocument, author: string, changes: string[] = []): DocumentVersion => ({
  id: `version-${Date.now()}`,
  version: incrementVersion(document.version || '1.0.0'),
  content: document.content,
  author,
  timestamp: new Date(),
  changes
});

// Helper for version increment
const incrementVersion = (currentVersion: string): string => {
  const parts = currentVersion.split('.').map(Number);
  parts[2] += 1; // Increment patch version
  return parts.join('.');
};

// Empty/default document data
const emptyDocumentData: AppDocumentData = createDefaultDocumentData();



export type {
  // Core App types
  AppDocument,
  AppDocumentData,
  AppDocumentSnapshot,
  AppDocumentSnapshotData,
  AppDocumentSnapshotStore,
  AppDocumentRealtimeDataItem,
  AppDocumentUnifiedMetadata,
  AppDocumentStructuredMetadata,
  
  // Configuration types
  DocumentSnapshotStoreConfig,
  DocumentSnapshotsArray,
  DocumentParams,
  DocumentFrontendStructure,
  
  // Document variations
  PublicDocument,
  PrivateDocument,
  DocumentSummary,
  
  // State types
  DocumentSession,
  DocumentContext,
  
  // Utility types
  DocumentFilterOptions,
  DocumentSortOptions,
  DocumentPermissions,
  
  // Versioning types
  DocumentVersion,
  DocumentVersionHistory,
  
  // Collaboration types
  DocumentCollaborator,
  DocumentComment
};




export {
  createDefaultDocument,
  emptyDocument,
createDefaultDocumentData,
  createDocumentVersion,
  incrementVersion,
  emptyDocumentData
};