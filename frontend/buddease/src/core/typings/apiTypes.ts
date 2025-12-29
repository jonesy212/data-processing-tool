// apiTypes.ts
import { BaseDataEntity, BaseDataRoot, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import { Attachment } from '@/core/documents/attachment/Attachment';
import { ProjectPhase } from '@/core/projects/projectManagement/ProjectManager';
import { ProjectData, ProjectPriority, ProjectStatus } from '@/core/typings/projectTypes';

// -------------------- API Core Types --------------------
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  metadata?: ApiMetadata;
  pagination?: ApiPagination;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
  stackTrace?: string;
  timestamp: Date;
}

export interface ApiMetadata {
  requestId: string;
  timestamp: Date;
  version: string;
  processingTime: number;
  source: string;
}

export interface ApiPagination {
  page: number;
  pageSize: number;
  total: number;
  totalItems: number
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface ApiRequest<T = any> {
  data: T;
  metadata: {
    requestId: string;
    timestamp: Date;
    userId: string;
    source: string;
    version: string;
  };
}

// -------------------- Project API Types --------------------
export interface CreateProjectRequest<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  projectData: Partial<ProjectData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;
  templateId?: string;
  options?: {
    autoGenerateTasks?: boolean;
    notifyTeam?: boolean;
    createInitialSnapshot?: boolean;
  };
}

export interface UpdateProjectRequest<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  projectId: string;
  updates: Partial<ProjectData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;
  changeReason?: string;
  options?: {
    createSnapshot?: boolean;
    notifyStakeholders?: boolean;
    validateDependencies?: boolean;
  };
}

export interface ProjectQueryParams {
  phase?: ProjectPhase;
  status?: ProjectStatus;
  priority?: ProjectPriority;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  tags?: string[];
  teamMembers?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface ProjectListResponse<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  projects: ProjectData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  pagination: ApiPagination;
  filters: ProjectQueryParams;
  summary: {
    total: number;
    byPhase: Record<ProjectPhase, number>;
    byStatus: Record<ProjectStatus, number>;
    byPriority: Record<ProjectPriority, number>;
  };
}

// -------------------- Snapshot Integration API Types --------------------
export interface ConvertSnapshotToProjectRequest {
  snapshotId: string;
  projectTemplate?: string;
  conversionOptions?: {
    includeAttachments?: boolean;
    preserveMetadata?: boolean;
    mapFields?: Record<string, string>;
    validationStrict?: boolean;
  };
}

export interface BatchConvertSnapshotsRequest {
  snapshotIds: string[];
  projectTemplate?: string;
  conversionOptions?: {
    includeAttachments?: boolean;
    preserveMetadata?: boolean;
    batchSize?: number;
    parallelProcessing?: boolean;
  };
}

export interface BatchConvertResponse {
  successful: Array<{
    snapshotId: string;
    projectId: string;
    projectData: any;
  }>;
  failed: Array<{
    snapshotId: string;
    error: string;
  }>;
  summary: {
    total: number;
    successful: number;
    failed: number;
    processingTime: number;
  };
}

// -------------------- Project Operation API Types --------------------
export interface ProjectOperationResponse {
  operationId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: any;
  error?: ApiError;
  progress?: number;
  estimatedCompletion?: Date;
}

export interface BulkProjectOperationRequest {
  projectIds: string[];
  operation: 'archive' | 'activate' | 'cancel' | 'export';
  options?: {
    notifyUsers?: boolean;
    createBackup?: boolean;
    batchSize?: number;
  };
}

// -------------------- Analytics API Types --------------------
export interface ProjectAnalyticsRequest {
  projectIds?: string[];
  dateRange: {
    start: string;
    end: string;
  };
  metrics: string[];
  groupBy?: 'day' | 'week' | 'month' | 'phase';
  filters?: ProjectQueryParams;
}

export interface ProjectAnalyticsResponse {
  metrics: {
    [metric: string]: any;
  };
  trends: AnalyticsTrend[];
  comparisons: AnalyticsComparison[];
  recommendations: AnalyticsRecommendation[];
}

export interface AnalyticsTrend {
  metric: string;
  dataPoints: Array<{
    timestamp: Date;
    value: number;
  }>;
  trend: 'increasing' | 'decreasing' | 'stable';
  changePercentage: number;
}

export interface AnalyticsComparison {
  metric: string;
  current: number;
  previous: number;
  change: number;
  changePercentage: number;
}

export interface AnalyticsRecommendation {
  type: 'optimization' | 'risk_mitigation' | 'resource_allocation';
  priority: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  impact: string;
  effort: 'low' | 'medium' | 'high';
  actions: string[];
}

// -------------------- Export/Import API Types --------------------
export interface ProjectExportRequest {
  projectIds: string[];
  format: 'json' | 'csv' | 'pdf' | 'excel';
  include: {
    tasks?: boolean;
    attachments?: boolean;
    snapshots?: boolean;
    analytics?: boolean;
  };
  options?: {
    compress?: boolean;
    encrypt?: boolean;
    watermark?: boolean;
  };
}

export interface ProjectImportRequest {
  file: File;
  templateId?: string;
  options?: {
    overwriteExisting?: boolean;
    createSnapshots?: boolean;
    validateData?: boolean;
    notifyOnComplete?: boolean;
  };
}

export interface ProjectTemplateRequest {
  name: string;
  description: string;
  basedOnProjectId?: string;
  industry: string;
  complexity: 'simple' | 'moderate' | 'complex';
  options?: {
    includeTasks?: boolean;
    includeWorkflows?: boolean;
    includeResources?: boolean;
  };
}

// -------------------- Real-time API Types --------------------
export interface RealTimeUpdate<T = any> {
  type: 'create' | 'update' | 'delete' | 'sync';
  entity: string;
  id: string;
  data: T;
  timestamp: Date;
  source: string;
  version: number;
}

export interface SubscriptionRequest {
  channels: string[];
  filters?: any;
  options?: {
    batchUpdates?: boolean;
    includeHistory?: boolean;
    compression?: boolean;
  };
}

export interface WebSocketMessage<T = any> {
  type: 'subscribe' | 'unsubscribe' | 'update' | 'error' | 'heartbeat';
  channel: string;
  data?: T;
  timestamp: Date;
  requestId?: string;
}

// -------------------- Error Response Types --------------------
export interface ValidationError {
  field: string;
  message: string;
  code: string;
  details?: any;
}

export interface BusinessError {
  code: string;
  message: string;
  context: any;
  recoverable: boolean;
  suggestedActions: string[];
}

export interface SystemError {
  code: string;
  message: string;
  component: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  stackTrace?: string;
}

// -------------------- Authentication & Authorization Types --------------------
export interface ApiAuthHeaders {
  authorization: string;
  'x-api-key'?: string;
  'x-request-id': string;
  'x-user-id': string;
  'x-client-version': string;
  'x-timestamp': string;
}

export interface PermissionCheck {
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'execute';
  context?: any;
}

export interface AuthResponse {
  authenticated: boolean;
  user: {
    id: string;
    email: string;
    roles: string[];
    permissions: string[];
  };
  token?: string;
  expiresAt?: Date;
}

// -------------------- File Upload API Types --------------------
export interface FileUploadRequest {
  file: File;
  projectId?: string;
  category: 'document' | 'image' | 'video' | 'other';
  metadata?: {
    title?: string;
    description?: string;
    tags?: string[];
    confidentiality?: 'public' | 'internal' | 'confidential';
  };
}

export interface FileUploadResponse {
  fileId: string;
  url: string;
  size: number;
  mimeType: string;
  uploadDate: Date;
  metadata: any;
}

// -------------------- Search API Types --------------------
export interface ProjectSearchRequest {
  query: string;
  filters?: ProjectQueryParams;
  options?: {
    includeTasks?: boolean;
    includeDocuments?: boolean;
    fuzzySearch?: boolean;
    highlightMatches?: boolean;
  };
}

export interface SearchResult<T = any> {
  score: number;
  data: T;
  highlights?: {
    [field: string]: string[];
  };
  matchedFields: string[];
}

// -------------------- Batch Operation Types --------------------
export interface BatchOperation<T = any> {
  operation: string;
  items: T[];
  options?: {
    stopOnError?: boolean;
    parallelProcessing?: boolean;
    batchSize?: number;
    timeout?: number;
  };
}

export interface BatchOperationResult<T = any> {
  operationId: string;
  status: 'completed' | 'partial' | 'failed';
  processed: number;
  successful: number;
  failed: number;
  results: Array<{
    item: T;
    success: boolean;
    result?: any;
    error?: ApiError;
  }>;
  summary: {
    totalTime: number;
    averageTime: number;
    memoryUsage: number;
  };
}

// -------------------- Type Guards --------------------
export function isApiResponse<T>(response: any): response is ApiResponse<T> {
  return (
    response &&
    typeof response === 'object' &&
    'success' in response &&
    typeof response.success === 'boolean'
  );
}

export function isApiError(error: any): error is ApiError {
  return (
    error &&
    typeof error === 'object' &&
    'code' in error &&
    'message' in error
  );
}

export function isRealTimeUpdate<T>(update: any): update is RealTimeUpdate<T> {
  return (
    update &&
    typeof update === 'object' &&
    'type' in update &&
    'entity' in update &&
    'id' in update &&
    'timestamp' in update
  );
}

// -------------------- Utility Types --------------------
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

export type ApiEndpoint = {
  path: string;
  method: HttpMethod;
  version: string;
  requiresAuth: boolean;
  rateLimit?: number;
};

export type ApiConfig = {
  baseURL: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
  enableLogging: boolean;
  enableCaching: boolean;
};

// -------------------- Default API Types --------------------
export type DefaultApiResponse = ApiResponse<any>;
export type DefaultProjectApiRequest = CreateProjectRequest<
  BaseDataEntity,
  BaseDataEntity,
  DefaultMeta<BaseDataRoot, BaseDataRoot>,
  Attachment,
  never,
  keyof BaseDataEntity
>;