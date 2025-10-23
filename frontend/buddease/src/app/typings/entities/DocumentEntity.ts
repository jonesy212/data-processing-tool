// DocumentEntity.ts
import { Attachment } from "@/app/documents/attachment/Attachment";
import { DocumentData } from '@/app/documents/editing/DocumentBuilder';
import { DocumentObject } from '@/app/state/redux/slices/DocumentSlice';
import { RealtimeDataItem } from '@/app/typings/realtimeTypes';
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/config/BaseConfig';

import { SnapshotsArray } from '@/app/snapshots/LocalStorageSnapshotStore';
import { Snapshot } from '@/app/snapshots/Snapshot';
import { SnapshotConfigParams } from '@/app/snapshots/SnapshotConfigBuilder';
import { SnapshotData } from '@/app/snapshots/SnapshotData';
import SnapshotStore from '@/app/snapshots/SnapshotStore';
import { SnapshotStoreConfig } from '@/app/snapshots/SnapshotStoreConfig';
import FrontendStructure from "@/config/appStructure/FrontendStructureComponent";
import { UnifiedMetadata } from '@/config/MetaDataOptions';
import { StructuredMetadata } from '@/config/StructuredMetadata';


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

const generateId = UniqueIDGenerator.generateTeamID()

// Helper for creating document instances
const createDefaultDocument = (options: Partial<AppDocument> = {}): AppDocument => ({
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
  content: string | Content<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
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
  // ========== CORE DOCUMENT ENTITY TYPES ==========
  DocumentEntity,
  DocumentK, 
  DocumentMeta,
  DocumentAttachment,
  DocumentExcludedFields,
  DocumentIncludedFields,
  
  // ========== CORE APP TYPES ==========
  AppDocument,
  AppDocumentData,
  AppDocumentSnapshot,
  AppDocumentSnapshotData,
  AppDocumentSnapshotStore,
  AppDocumentStructuredMetadata,
  AppDocumentUnifiedMetadata,
  AppDocumentRealtimeDataItem,
  
  // ========== DOCUMENT CONFIGURATION & PARAMS ==========
  DocumentParams,
  DocumentSnapshotStoreConfig,
  DocumentSnapshotsArray,
  DocumentFrontendStructure,
  
  // ========== DOCUMENT CONTENT & STYLING ==========
  DocumentStyles,
  DocumentContext,
  DocumentSummary,
  DocumentTemplate,
  TemplateField,
  
  // ========== DOCUMENT VERSIONS & HISTORY ==========
  DocumentVersion,
  DocumentVersionHistory,
  DocumentBackup,
  BackupSchedule,
  
  // ========== DOCUMENT PERMISSIONS & ACCESS ==========
  DocumentPermissions,
  DocumentAccessLog,
  PrivateDocument,
  PublicDocument,
  DocumentShareLink,
  
  // ========== DOCUMENT COLLABORATION ==========
  DocumentCollaborator,
  DocumentComment,
  DocumentSession,
  
  // ========== DOCUMENT WORKFLOW ==========
  DocumentWorkflow,
  WorkflowStep,
  WorkflowParticipant,
  
  // ========== DOCUMENT SEARCH & FILTERING ==========
  DocumentSearchResult,
  DocumentFilterOptions,
  DocumentSortOptions,
  DocumentIndex,
  
  // ========== DOCUMENT EXPORT & FORMATTING ==========
  DocumentExportOptions,
  ExportFormat,
  ExportResult,
  HeaderStyle,
  
  // ========== DOCUMENT ANALYTICS & USAGE ==========
  DocumentAnalytics,
  DocumentUsageStats,
  
  // ========== DOCUMENT VALIDATION ==========
  DocumentValidationRule,
  ValidationResult,
  
  // ========== DOCUMENT AI/ML FEATURES ==========
  AISuggestion,
  DocumentAIAnalysis,
  
  // ========== BATCH OPERATIONS ==========
  BatchDocumentOperation,
  BatchOperationResult
};




  export {
    createDefaultDocument, createDefaultDocumentData,
    createDocumentVersion, emptyDocument, emptyDocumentData, incrementVersion
  };
