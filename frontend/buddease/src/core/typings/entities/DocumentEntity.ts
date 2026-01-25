// DocumentEntity.ts
import type { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import type { Attachment } from '@/core/documents/attachment/Attachment';
import { DocumentData } from '@/core/documents/editing/DocumentBuilder';
import UniqueIDGenerator from '@/core/generators/GenerateUniqueIds';
import { Content } from "@/core/models/content/AddContent";
import { DocumentObject } from '@/core/state/redux/slices/DocumentSlice';
import { RealtimeDataItem } from '@/core/typings/realtimeTypes';
import { Version } from '@/core/versions/Version';

import FrontendStructure from "@/core/config/appStructure/FrontendStructureComponent";
import type { UnifiedMetadata } from '@/core/config/MetaDataOptions';
import type { StructuredMetadata } from '@/core/config/StructuredMetadata';
import { SnapshotsArray } from '@/core/snapshots/LocalStorageSnapshotStore';
import type { Snapshot } from '@/core/snapshots/Snapshot';
import type { SnapshotConfigParams } from '@/core/snapshots/SnapshotConfigBuilder';
import { SnapshotData } from '@/core/snapshots/SnapshotData';
import SnapshotStore from '@/core/snapshots/SnapshotStore';
import type { SnapshotStoreConfig } from '@/core/snapshots/SnapshotStoreConfig';


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


type DocumentSearchResult = {
  document: AppDocument;
  relevance: number;
  matchedFields: (keyof AppDocument)[];
  highlights: {
    field: keyof AppDocument;
    snippets: string[];
  }[];
};

type DocumentIndex = {
  documentId: string;
  title: string;
  content: string;
  tags: string[];
  author: string;
  metadata: Record<string, any>;
  lastModified: Date;
};

// Document template types
type DocumentTemplate = {
  id: string;
  name: string;
  category: string;
  content: string;
  fields: TemplateField[];
  styles: DocumentStyles;
  isSystem: boolean;
  createdBy: string;
  createdAt: Date;
};

type TemplateField = {
  name: string;
  type: 'text' | 'number' | 'date' | 'select' | 'rich-text';
  required: boolean;
  defaultValue?: any;
  options?: string[];
  placeholder?: string;
};

// Document workflow types
type DocumentWorkflow = {
  id: string;
  name: string;
  steps: WorkflowStep[];
  currentStep: number;
  status: 'draft' | 'review' | 'approved' | 'rejected' | 'published';
  participants: WorkflowParticipant[];
  dueDate?: Date;
};

type WorkflowStep = {
  id: string;
  order: number;
  name: string;
  action: 'review' | 'approve' | 'sign' | 'publish';
  required: boolean;
  assignees: string[];
  completed: boolean;
  completedBy?: string;
  completedAt?: Date;
  comments: string[];
};

type WorkflowParticipant = {
  userId: string;
  role: 'author' | 'reviewer' | 'approver' | 'viewer';
  assignedAt: Date;
  completedSteps: number[];
};

// Document styling and formatting types
type DocumentStyles = {
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  headers: {
    h1: HeaderStyle;
    h2: HeaderStyle;
    h3: HeaderStyle;
  };
};

type HeaderStyle = {
  fontSize: number;
  bold: boolean;
  spacing: number;
};

// Document export types
type ExportFormat = 'pdf' | 'docx' | 'html' | 'markdown' | 'text';

type DocumentExportOptions = {
  format: ExportFormat;
  includeComments: boolean;
  includeVersionHistory: boolean;
  includeMetadata: boolean;
  watermark?: string;
  pageNumbers: boolean;
  header?: string;
  footer?: string;
};

type ExportResult = {
  success: boolean;
  fileUrl?: string;
  fileSize?: number;
  error?: string;
  format: ExportFormat;
};

// Document analytics types
type DocumentAnalytics = {
  views: number;
  uniqueViewers: number;
  averageTimeSpent: number;
  downloads: number;
  shares: number;
  lastAccessed: Date;
  accessHeatmap: {
    section: string;
    views: number;
    timeSpent: number;
  }[];
};

type DocumentUsageStats = {
  period: 'day' | 'week' | 'month' | 'year';
  totalViews: number;
  totalDownloads: number;
  totalShares: number;
  topViewers: string[];
  popularSections: string[];
};

// Document backup and recovery types
type DocumentBackup = {
  id: string;
  documentId: string;
  timestamp: Date;
  content: string;
  version: string;
  backupType: 'auto' | 'manual' | 'pre-update';
  size: number;
  checksum: string;
};

type BackupSchedule = {
  enabled: boolean;
  frequency: 'hourly' | 'daily' | 'weekly';
  retentionDays: number;
  maxBackups: number;
};

// Document sharing and access control types
type DocumentShareLink = {
  id: string;
  documentId: string;
  token: string;
  expiresAt: Date;
  maxUses?: number;
  usedCount: number;
  permissions: DocumentPermissions;
  createdBy: string;
  createdAt: Date;
  password?: string;
};

type DocumentAccessLog = {
  id: string;
  documentId: string;
  userId: string;
  action: 'view' | 'edit' | 'download' | 'share' | 'comment';
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
  duration?: number;
};

// Document batch operations types
type BatchDocumentOperation = {
  documents: string[];
  operation: 'archive' | 'publish' | 'delete' | 'move' | 'change-owner';
  parameters: Record<string, any>;
};

type BatchOperationResult = {
  operationId: string;
  total: number;
  successful: number;
  failed: number;
  errors: Array<{
    documentId: string;
    error: string;
  }>;
  startedAt: Date;
  completedAt: Date;
};

// Document validation types
type DocumentValidationRule = {
  field: keyof AppDocument;
  rule: 'required' | 'minLength' | 'maxLength' | 'format' | 'custom';
  value?: any;
  message: string;
};


// Document AI/ML enhancement types
type DocumentAIAnalysis = {
  summary: string;
  keywords: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
  entities: Array<{
    type: 'person' | 'organization' | 'location' | 'date' | 'concept';
    value: string;
    confidence: number;
  }>;
  readability: {
    score: number;
    level: string;
  };
  suggestions: AISuggestion[];
};

type AISuggestion = {
  type: 'grammar' | 'style' | 'structure' | 'content';
  original: string;
  suggestion: string;
  confidence: number;
  reason: string;
};

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

const generateId = UniqueIDGenerator.generateTeamID(name)

// Helper for creating document instances
const createDefaultDocument = (options: Partial<AppDocument> = {}): AppDocument => ({
  id: options.id || generateId,
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
} as AppDocument);

// Empty/default document
const emptyDocument: AppDocument = createDefaultDocument();

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
  content: string | Content<DocumentEntity, DocumentK, DocumentMeta, DocumentAttachment, DocumentExcludedFields, DocumentIncludedFields>;
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



// Assume createDefaultDocument returns AppDocument
const createDefaultDocumentData = (
  options: Partial<AppDocumentData> = {}
): AppDocumentData => {
  const base: AppDocument = createDefaultDocument({ ...options } as Partial<AppDocument>);

  return {
    ...base,
    ...options,
    // You can initialize AppDocumentData-specific fields here
  };
};

// Helper to extract version string from Version object
const extractVersionString = (version: Version<DocumentEntity, DocumentK, DocumentMeta, DocumentAttachment, DocumentExcludedFields, DocumentIncludedFields> | string): string => {
  if (typeof version === 'string') {
    return version;
  }
  
  // Assuming your Version type has a 'version' or 'number' property
  // Adjust based on your actual Version type structure
  return (version as any).version || (version as any).number || '1.0.0';
};

// Helper for version increment
const incrementVersion = (currentVersion: string): string => {
  const parts = currentVersion.split('.').map(Number);
  parts[2] += 1; // Increment patch version
  return parts.join('.');
};

// Helper for creating document versions
const createDocumentVersion = (document: AppDocument, author: string, changes: string[] = []): DocumentVersion => ({
  id: `version-${Date.now()}`,
  version: incrementVersion(extractVersionString(document.version || '1.0.0')),
  content: document.content,
  author,
  timestamp: new Date(),
  changes
});


// Empty/default document data
const emptyDocumentData: AppDocumentData = createDefaultDocumentData();



export type {

    // ========== DOCUMENT AI/ML FEATURES ==========
    AISuggestion,
    // ========== CORE APP TYPES ==========
    AppDocument,
    AppDocumentData, AppDocumentRealtimeDataItem, AppDocumentSnapshot,
    AppDocumentSnapshotData,
    AppDocumentSnapshotStore,
    AppDocumentStructuredMetadata,
    AppDocumentUnifiedMetadata, BackupSchedule,
    // ========== BATCH OPERATIONS ==========
    BatchDocumentOperation,
    BatchOperationResult, DocumentAccessLog, DocumentAIAnalysis,
    // ========== DOCUMENT ANALYTICS & USAGE ==========
    DocumentAnalytics, DocumentAttachment, DocumentBackup,
    // ========== DOCUMENT COLLABORATION ==========
    DocumentCollaborator,
    DocumentComment, DocumentContext,
    // ========== CORE DOCUMENT ENTITY TYPES ==========
    DocumentEntity, DocumentExcludedFields,
    // ========== DOCUMENT EXPORT & FORMATTING ==========
    DocumentExportOptions, DocumentFilterOptions, DocumentFrontendStructure, DocumentIncludedFields, DocumentIndex, DocumentK,
    DocumentMeta,
    // ========== DOCUMENT CONFIGURATION & PARAMS ==========
    DocumentParams,
    // ========== DOCUMENT PERMISSIONS & ACCESS ==========
    DocumentPermissions,
    // ========== DOCUMENT SEARCH & FILTERING ==========
    DocumentSearchResult, DocumentSession, DocumentShareLink, DocumentSnapshotsArray, DocumentSnapshotStoreConfig, DocumentSortOptions,
    // ========== DOCUMENT CONTENT & STYLING ==========
    DocumentStyles, DocumentSummary,
    DocumentTemplate, DocumentUsageStats,

    // ========== DOCUMENT VALIDATION ==========
    DocumentValidationRule,
    // ========== DOCUMENT VERSIONS & HISTORY ==========
    DocumentVersion,
    DocumentVersionHistory,
    // ========== DOCUMENT WORKFLOW ==========
    DocumentWorkflow, ExportFormat,
    ExportResult,
    HeaderStyle, PrivateDocument,
    PublicDocument, TemplateField, WorkflowParticipant, WorkflowStep
};




  export {
        createDefaultDocument, createDefaultDocumentData,
        createDocumentVersion, emptyDocument, emptyDocumentData, incrementVersion
    };

