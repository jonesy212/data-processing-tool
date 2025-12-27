// MetaDataOptions.ts
import { dynamicMeetingMetadata, MeetingMetadata } from '@/app/calendar/ScheduledData';
import { LanguageEnum } from '@/app/communications/LanguageEnum';
import { Task } from '@/app/components/models/tasks/Task';
import { AppStructurePermissions } from '@/app/config/appStructure/AppStructure';
import { baseConfig, BaseDataEntity, BaseDataRoot, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { SchemaField } from '@/app/config/metadata/SchemaField';
import { CoreMetadata } from '@/app/config/MetadataStateManager';
import { MetadataEntriesType, MetadataEntry, projectMetadata, ProjectMetadata, StructuredMetadata, VideoMetadata } from '@/app/config/StructuredMetadata';
import { useMeta } from '@/app/config/useMeta';
import { Attachment } from '@/app/documents/attachment/Attachment';
import { BaseEntityProperties } from "@/app/documents/RelatedProps";
import UniqueIDGenerator from "@/app/generators/GenerateUniqueIds";
import { Category } from '@/app/libraries/categories/generateCategoryProperties';
import { ChangeLogEntry } from '@/app/logging/ChangeLogEntry';
import { Data, SharedRelationshipData } from '@/app/models/data/Data';
import { StatusType } from '@/app/models/data/StatusType';
import { taskMetadata } from '@/app/models/data/TaskMetadata';
import { PhaseMeta } from '@/app/models/phases/Phase';
import { TagsRecord } from '@/app/models/tracker/Tag';
import { PriorityValue } from '@/app/pages/searches/CriteriaType';
import { TransactionData } from '@/app/payment/Transaction';
import { Permission } from '@/app/permissions/Permission';
import { SharedMetadata } from '@/app/shared/SharedMetadata';
import { SimulatedDataSource } from '@/app/snapshots/createSnapshotOptions';
import type {  Snapshot } from '@/app/snapshots/Snapshot';
import { SnapshotStoreConfig } from '@/app/snapshots/SnapshotStoreConfig';
import { data } from '@/app/snapshots/SnapshotWithCriteria';

import { InitializedState } from "@/app/state/stores/DataStore";
import { AllStatus } from '@/app/state/stores/DetailsListStore';
import { AnalysisTypeEnum } from '@/app/typings/AnalysisType';
import { AppAttachment, AppEntity, AppExcludedFields, AppIncludedFields, AppK, AppMeta } from '@/app/typings/entities/AppEntity';
import { MetaAttachment, MetaEntity, MetaExcludedFields, MetaIncludedFields, MetaK, MetaMeta } from "@/app/typings/entities/MetaEntity";
import { TaskAttachment, TaskEntity, TaskExcludedFields, TaskIncludedFields, TaskK, TaskMeta } from "@/app/typings/entities/TaskEntity";
import { VersionAttachment, VersionEntity, VersionExcludedFields, VersionIncludedFields, VersionK, VersionMeta } from '@/app/typings/entities/VersionEntity';
import { FileMetadata } from '@/app/typings/file/fileTypes';
import { User } from '@/app/users/User';
import { createLastUpdatedWithVersion, createLatestVersion } from '@/app/versions/createLatestVersion';
import { Version, version, versionData, default as VersionImpl } from '@/app/versions/Version';
import { SharedVersioning, VersionData, VersionHistory } from "@/app/versions/VersionData";
import { getCurrentAppInfo } from "@/app/versions/VersionGenerator";
import { category } from '@/utils/snapshotUtils';


export type BaseAudit = AuditEntry<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>

export interface AuditEntry<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  id: string;

  // Core information about the change
  action: 'create' | 'update' | 'delete' | 'assign' | 'comment' | 'complete' | string;
  entityType: string; // e.g., "Task", "User", "Snapshot"
  entityId: string;
  entityKey?: keyof T;
  changes?: Partial<Record<keyof T, { from: any; to: any }>>;

  // Metadata and contextual info
  metadata?: Meta;
  version?: Version<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  category?: Category;

  // Who and when
  performedBy: User<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | { id: string; name?: string }; // partial user or full User
  timestamp: Date;
  ipAddress?: string;
  location?: string;

  // Optional linkage to the snapshot or task
  snapshotId?: string;
  taskId?: string;
  previousVersionId?: string;

  // Custom payload or notes
  notes?: string;
  context?: Record<string, any>;
}


// Version-related properties
interface VersionMetadata<
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>  extends SharedVersioning {
  // General version information
  version?: string | number | Version<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;
  versionData?: string | VersionData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;

  // Metadata descriptors
  timestamp?: string | number | Date;
  author?: string;
  description?: string;
  tags?: TagsRecord<T> | string[]
  commitHash?: string;
  date: string | Date;
  // Extended version tracking
  latestVersion?: Pick<
    VersionData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    "id" | "versionNumber" | "timestamp" | "author" | "schema"
  >;
  // Historical tracking
  lastUpdated?: Date | VersionHistory<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
}

// Status/access control properties
interface StatusMetadata {
  isActive: boolean;
  appPermissions?: AppStructurePermissions[];
  permissions?: string[] | Permission[]
  maxAge?: string | number;
}

// Descriptive properties
interface DescriptiveMetadata<  
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  title?: string;
  description?: string;
  category?: Category;
  tags?: string[] | TagsRecord<T>; // Adjusted for flexibility
}

// Author/ownership properties
interface AuthorMetadata {
  author?: string;
  createdBy?: string | undefined;
  updatedBy?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  source?: string;
}

// Config/customization properties
interface ConfigMetadata<  
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  baseUrl?: string;
  customFields?: Record<string, any>;
  config?: SharedConfigType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  encryptedConfig?: string;
}

// Structural properties
interface StructuralMetadata<T extends BaseDataEntity, K extends T> {
  metadataEntries: MetadataEntriesType<T, K>;
  keywords: string[];
  childIds?: K[];
  relatedData?: K[];
}

// Current state properties
interface CurrentStateMetadata<
    T extends BaseDataEntity, 
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  currentMetadata?: UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  currentMeta?: StructuredMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined;
}


interface BaseMetadata<  
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends SharedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  DescriptiveMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  AuthorMetadata {
}

interface BaseMetaDataOptions<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends
  StatusMetadata,
  StructuralMetadata<T, K>,
  CoreMetadata<T, K>,
  VersionMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  ConfigMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
}

// Project-specific metadata
interface ProjectMetaDataOptions<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends
  Omit<BaseMetaDataOptions<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, 'versionData'> {
  simulatedDataSource?: SimulatedDataSource<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  versionData: string | VersionData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;
}

// Snapshot-specific metadata
interface SnapshotMetaDataOptions<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends
  Omit<BaseMetaDataOptions<T, K>, 'tags' | 'version' | 'customFields'> {
  structuredMetadata: StructuredMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  simulatedDataSource?: SimulatedDataSource<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  tags?: string[] | TagsRecord<T>
  version: VersionImpl<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
}

// Define the task metadata options interface
interface TaskMetaDataOptions<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends BaseMetaDataOptions<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  priority: PriorityValue | undefined; // Specific to tasks
  assignedTo: User<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | User<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] | null;
  status?: AllStatus; // Status specific to tasks
  // Additional task-specific metadata fields can be added here
}

// Task metadata extending base metadata
// Extend the task metadata to include other relevant interfaces if needed
interface TaskMetadata<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends TaskMetaDataOptions<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, 
    SharedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  taskId: string;
  taskName: string;
  _id?: string;
  analysisType?: AnalysisTypeEnum;
  assignee?: User<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;
  scheduleType?: "one-time" | "recurring";
  scheduledDate?: Date;
  
  /** Recursive subtasks metadata */
  subtasks?: TaskMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] | null;
}

interface MediaMetadata<
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
> extends BaseMetaDataOptions<T, K> {
  title?: string;
  artist?: string;
  album?: string;
  artwork?: MediaImage[]; // Assuming MediaImage is defined elsewhere
}

interface CustomMediaSession {
  sessionId: string;
  status: string;
}

interface AdditionalMetaDataOptions {
  enableSnapshot?: boolean;
  maxRetries?: number;
  retryDelay?: number;
  maxAge?: number;
  staleWhileRevalidate?: number;
  eventRecords?: any[];
}

type UnifiedMetadata<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> = UnifiedMetaDataOptions<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> & {
  fileMetadata?: FileMetadata;
  customMetadata?: Record<string, any>;
  schema?: Record<string, SchemaField>;
  latestVersion?: Pick<VersionData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, "id" | "versionNumber" | "author" | "schema">;
  author?: string;
  timestamp?: string | number | Date;
  revisionNotes?: string;
  transformed?: boolean;
  count?: number;
  generatedAt?: Date;
  dataSource?: string;
  isArchived?: boolean
  initialState?: InitializedState<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  
  area?: string;
  overrides?: Partial<StructuredMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;
  apiKey?: string;
  apiEndpoint?: string;
  baseUrl?: string;
  config?: Promise<SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null>;
  createdBy?: string;
};

interface UnifiedMetaDataOptions<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends
  BaseEntityProperties,
  SharedRelationshipData<K>,
  BaseMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  SharedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
{
  setOptions?: (
    options: Partial<UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>
  ) => this;
  timestamp?: string | number | Date;
  revisionNotes?: string;
  area: string | undefined;
  projectId?: number;
  initialState?: InitializedState<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  overrides?: Partial<Omit<Meta, ExcludedFields>>;
  relatedKeys?: Array<keyof K>;
  metadataEntries: Record<string, MetadataEntry<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;
  videoMetadata?: VideoMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  mediaMetadata?: MediaMetadata;
  projectMetadata?: ProjectMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  taskMetadata?: TaskMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  meetingMetadata?: MeetingMetadata
  customMediaSession?: CustomMediaSession;
  phaseMetadata?: PhaseMeta
  structuredMetadata?: StructuredMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  mappedSnapshot?: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;
}


function transformProjectToUnifiedMetadata<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(projectMetadata: ProjectMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  const { versionNumber, appVersion } = getCurrentAppInfo();

  // Get version data from project metadata
  const versionData = projectMetadata.versionData;

  // Enhanced type guard
  const isVersionData = (data: unknown): data is VersionData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> => {
    if (!data || typeof data !== 'object') return false;
    const requiredProps = [
      'id', 'versionNumber', 'createdAt', 'notes',
      'timestamp', 'user', 'changes'
    ];
    return requiredProps.every(prop => prop in (data as Record<string, unknown>));
  };

  // Process version data with proper typing
  const processedVersionData: VersionData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null = (() => {
    if (!versionData) return null;

    // Already valid VersionData
    if (isVersionData(versionData)) {
      return versionData;
    }

    // Handle string case
    if (typeof versionData === 'string') {
      return new VersionImpl({
        id: UniqueIDGenerator.generateVersionID(versionNumber), // Use the new generator
        versionNumber: versionNumber,
        parentVersion: versionData,
        // Required numeric fields
        major: 1,
        minor: 0,
        patch: 0,
        // Required string fields
        structureData: '',
        appVersion: appVersion,
        description: 'Auto-generated version',
        content: '',
        name: 'Version ' + versionNumber,
        url: '',
        checksum: UniqueIDGenerator.generateSnapshotID(), // Reuse existing generator
        userId: UniqueIDGenerator.generateUserID('system').next().value,
        documentId: UniqueIDGenerator.generateSnapshotID(),
        // Version history structures
        versions: {
          backend: createEmptyBackendStructure(),
          frontend: createEmptyFrontendStructure(),
          history: []
        },
        versionHistory: {
          versionData: {},
          latestVersion: createLatestVersion<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(),
          history: [],
          timestamp: Date.now()
        },
        // Other required fields
        createdAt: new Date(),
        notes: [],
        timestamp: new Date(),
        user: 'system',
        changes: [],
        parentId: null,
        parentType: undefined,
        parentTitle: '',
        parentContent: '',
        parentName: '',
        parentUrl: '',
        parentChecksum: UniqueIDGenerator.generateSnapshotID(),
        parentMetadata: {},
        parentAppVersion: appVersion,
        parentVersionNumber: versionNumber,
      });
    }

    // Handle object case
    if (typeof versionData === 'object' && versionData !== null) {
      const versionObj = versionData as Record<string, unknown>;
      return new VersionImpl({
        versionNumber: (versionObj.versionNumber as string) || versionNumber,
        ...(versionObj as Partial<VersionData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>),
        createdAt: new Date(),
        notes: (versionObj.notes as string[]) || [],
        // Ensure all required fields are set
        id: (versionObj.id as string) || UniqueIDGenerator.generateSnapshotID(),
        timestamp: new Date(),
        user: (versionObj.user as string) || 'system',
        changes: (versionObj.changes as ChangeLogEntry<T, K>[]) || []
      });
    }

    return null;
  })();


  // Generate a project ID if it is undefined
  if (!projectMetadata.projectId) {
    projectMetadata.projectId = UniqueIDGenerator.generateProjectID("defaultProjectName");
  }

  // Create metadata entries based on project metadata
  const metadataEntries: Record<string, MetadataEntry<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> = {};

  // Assuming `projectMetadata` has the necessary properties to fill in the metadata entries
  // Example: Adding a single entry for demonstration purposes
  const entryId = projectMetadata.projectId.toString(); // or any unique identifier
  metadataEntries[entryId] = {
    originalPath: `/projects/${projectMetadata.projectId}`, // Replace with actual logic to derive paths
    alternatePaths: [`/projects/alt/${projectMetadata.projectId}`],
    author: projectMetadata.teamMembers.length > 0 ? projectMetadata.teamMembers[0] : "Unknown", // Assuming teamMembers are authors
    timestamp: new Date(), // Or use an appropriate date from projectMetadata
    fileType: "project", // Example file type, adjust as necessary
    title: projectMetadata.description || "Untitled Project", // Replace with the appropriate title
    description: projectMetadata.description || "",
    keywords: projectMetadata.tasks.map(task => task.taskName), // Assuming tasks contain titles as keywords
    authors: projectMetadata.teamMembers, // Assuming teamMembers are the authors
    contributors: [], // Populate this based on your logic or additional data
    publisher: "Your Organization", // Adjust as necessary
    copyright: "© Your Organization", // Adjust as necessary
    license: "MIT", // Example license, adjust based on your needs
    links: [], // Populate with relevant links if available
    tags: [], // Populate tags as needed
  };


  const structuredMetadata: StructuredMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
    ...baseConfig,
    description: projectMetadata.description || "A project to manage structured metadata.",
    versionData: processedVersionData,
    latestVersion: createLatestVersion({
      id: "1",
      name: "Initial Release",
      versionNumber: "1.0.0",
      userId: "user123",
      content: "Initial version of the content.",
      metadata: {
        author: "Author Name",
        timestamp: new Date(),
         area: 'structure-metadata-area', 
         metadataEntries: []
      },
      releaseDate: "2024-11-24",
      major: 1,
      minor: 0,
      patch: 0,
      isPublished: true,
      publishedAt: new Date(),
      source: "Generated",
      status: StatusType.Active,
      comments: [{ id: "1", text: "First comment", timestamp: new Date(), author: "author", content: [] }], // Assuming a Comment type
      workspaceName: "Main Workspace",
    }),
    metadataEntries: {
      "entry1": {
        originalPath: "/documents/report.docx",
        alternatePaths: ["/backup/report_backup.docx", "/shared/report_shared.docx"],
        author: "John Doe",
        timestamp: new Date("2024-11-24T10:00:00Z"), // Replace with a valid date
        fileType: "docx",
        title: "Quarterly Report",
        description: "A detailed report covering the quarterly performance of the organization.",
        keywords: ["quarterly", "report", "performance", "organization"],
        authors: ["John Doe", "Jane Smith"],
        contributors: [],
        publisher: "ABC Publishing",
        copyright: "© 2024 ABC Corporation",
        license: "Creative Commons Attribution 4.0 International",
        links: ["https://example.com/report"],
        tags: ["finance", "quarterly", "reporting"],
      },
    },
    version: {

      structureData, 
      getVersionNumber, calculateHash, generateChecksum,
      
      major: 1, minor: 0, patch: 0,
      id: 0,
      isActive: false,
      releaseDate: "",
      name: '',
      url: '',
      versionNumber: '',
      documentId: '',
      draft: false,
      userId: '',
      content: '',
      description: '',
      buildNumber: '',
      versions: null,
      appVersion: '',
      checksum: '',
      parentId: null,
      parentType: '',
      parentVersion: '',
      parentTitle: '',
      parentContent: '',
      parentName: '',
      parentUrl: '',
      parentChecksum: '',
      parentAppVersion: '',
      parentVersionNumber: '',
      isLatest: false,
      isPublished: false,
      publishedAt: null,
      source: '',
      status: '',
      workspaceId: '',
      workspaceName: '',
      workspaceType: '',
      workspaceUrl: '',
      workspaceViewers: [],
      workspaceAdmins: [],
      workspaceMembers: [],
      data: data as Data<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      _structure: {},
      versionHistory: {
        versionData: {},
        latestVersion: createLatestVersion<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(),
        history: [],
        timestamp: new Date(),
        versions: [], 
        currentVersionIndex: 0
      },
      getVersionNumber: () => "",
      updateStructureHash: function (): Promise<void> {
        throw new Error('Function not implemented.');
      },
      setStructureData: function (newData: string): void {
        throw new Error('Function not implemented.');
      },
      hash: function (value: string): string {
        throw new Error('Function not implemented.');
      },
      currentHash: '',
      structureData: '',
      calculateHash: function (): string {
        throw new Error('Function not implemented.');
      }
    }, // Example version
    lastUpdated: {
      versionData: [{ major: 1, minor: 0, patch: 1 }],
      timestamp: new Date("2024-11-24T12:00:00Z"),
      lastUpdated: new Date("2024-11-24T12:00:00Z"),
      history: [],
      latestVersion: {
        id: "0",
        parentId: null,
        parentType: undefined,
        parentVersion: '',
        parentTitle: '',
        parentContent: '',
        parentName: '',
        parentUrl: '',
        parentChecksum: '',
        parentAppVersion: '',
        parentVersionNumber: '',
        createdBy: "",
        lastUpdated: createLastUpdatedWithVersion(),
        isLatest: false,
        isActive: false,
        isPublished: false,
        publishedAt: null,
        source: '',
        status: '',
        version: (version instanceof VersionImpl) 
          ? version 
          : new VersionImpl({
          major: 1,
          minor: 0,
          patch: 0,
          id: 0,
          isActive: false,
          releaseDate: "",
          name: '',
          url: ''
        }),
        timestamp: undefined,
        user: '',
        changes: [],
        comments: [],
        workspaceId: '',
        workspaceName: '',
        workspaceType: '',
        workspaceUrl: '',
        workspaceViewers: [],
        workspaceAdmins: [],
        workspaceMembers: [],
        history: [],
        data: undefined,
        backend: undefined,
        frontend: undefined,
        name: '',
        url: '',
        versionNumber: '',
        documentId: '',
        draft: false,
        userId: '',
        content: '',
        metadata: {
          author: '',
          timestamp: undefined,
          revisionNotes: undefined,
           area: '', 
           metadataEntries: {}
        },
        releaseDate: '',
        major: 0,
        minor: 0,
        patch: 0,
        checksum: ''
      },

    },
    isActive: true,
    config: {
      theme: "dark",
      permissions: "read-write",
    },
    permissions: [],
    customFields: {
      projectType: "Documentation",
      priority: "High",
    },
    baseUrl: "https://example.com/metadata",
    childIds: [] as K[],
    relatedData: [] as K[],
    meta: {} as StructuredMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  };


  // Return as UnifiedMetaDataOptions
  return {
    area: "project", // Add this line
    tags: [],
    projectMetadata: projectMetadata,
    videoMetadata: undefined,
    mediaMetadata: undefined,
    taskMetadata: undefined,
    meetingMetadata: undefined,
    metadataEntries: metadataEntries, // Add this line
    latestVersion: latestVersion,
    schema: {}
  };
}


interface MyDataType extends BaseDataEntity {
  transactionHistory: TransactionData[];
  recentActivity?: { action: string; timestamp: Date }[];
  metadata?: Omit<UnifiedMetaDataOptions<MyDataType>, 'metadata'>;
}




const fetchUserAreaDimensions = (): Promise<{ width: number; height: number }> => {
  return new Promise((resolve) => {
    window.addEventListener('load', () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      resolve({ width, height });
    });
  });
};


// Convert the dimensions into a string format: "width x height"
const dimensions = await fetchUserAreaDimensions();
const area = `${dimensions.width}x${dimensions.height}`;
console.log(area);


const currentMeta: StructuredMetadata<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields> = useMeta<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedField>(area)
// console.log(area);  // Output: "1920x1080"

// const currentMeta = useMeta<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>(area)
const transformedMetadataEntries: Record<string, any> = {};
const metadataEntries: Record<string, MetadataEntry<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>> = {};

// Example media data
const mediaData: UnifiedMetadata<MyDataType> = {
  area: "",
  tags: [],
  structuredMetadata: currentMeta,
  currentMeta: currentMeta,
  metadataEntries: {},
  videoMetadata: {

    duration: 120, // 2 minutes
    resolution: '1920x1080',
    title: "",
    url: "",
    sizeInBytes: 0,
    format: "",
    aspectRatio: "16:9",
    subtitles: ["English", "Spanish"], // Array of subtitle languages
    closedCaptions: ["English"],
    license: "Creative Commons",
    isLicensedContent: true,
    isFamilyFriendly: true,
    isEmbeddable: true,
    isDownloadable: true,
    baseData: {},
    metadata: {
      area,
      currentMeta: currentMeta,
      metadataEntries: metadataEntries,
      latestVersion: latestVersion,

    },
    data: {
      // Example `Data` structure
      id: "123",
      name: "Video Data",
      createdAt: new Date(),
      updatedAt: new Date(),
      childIds: [],
      relatedData: [],
      transactionHistory: []
    },
    uploadDate: new Date(),
    uploader: "",
    language: LanguageEnum.English,

    location: "",
    categories: [],
    views: 0,
    likes: 0,
    comments: 0,
    tags: [],
    frameRate: 30,

    bitrate: 3000, // Default bitrate in kbps
    codec: "H.264", // Default codec
    colorSpace: "sRGB", // Default color space
    audioCodec: "AAC", // Default audio codec
    audioChannels: 2, // Default to stereo
    audioSampleRate: 44100, // Default sample rate in Hz
    chapters: [], // Empty array if not provided
    thumbnailUrl: "", // Default empty string
    metadataSource: "user-generated", // Default metadata source
    childIds: [],
    relatedData: []
  },
  mediaMetadata: {
    id: "user",
    createdBy: '',
    timestamp: "",
    title: 'My Awesome Video',
    artist: 'John Doe',
    album: 'Greatest Hits',
    metadataEntries: {},
    artwork: [{ /* MediaImage data */
      src: "",
    }],
    keywords: [],
    isActive: true,
    permissions: [],
    customFields: [],

  },
  customMediaSession: {
    sessionId: 'session-001',
    status: 'active' // Currently playing
  },
  childIds: [],
  relatedData: []
};


// `VideoMetadata` is a type, not just an object type
function createVideoMetadata<
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  title: string,
  url: string,
  options?: Partial<Omit<VideoMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, "title" | "url">>
): VideoMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
 
  return {
    bitrate: options?.bitrate ?? 3000,
    codec: options?.codec ?? "H.264",
    colorSpace: options?.colorSpace ?? "sRGB",
    baseData: options?.baseData ?? {} as Omit<BaseData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, ExcludedFields>,
    metadata: options?.metadata ?? undefined,
    audioCodec: options?.audioCodec ?? "AAC",
    audioChannels: options?.audioChannels ?? 2,
    meta: options?.meta ?? {} as StructuredMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    audioSampleRate: options?.audioSampleRate ?? 44100,
    chapters: options?.chapters ?? [],
    thumbnailUrl: options?.thumbnailUrl ?? "",
    metadataSource: options?.metadataSource ?? "user-generated",
    duration: options?.duration ?? 120,
    resolution: options?.resolution ?? "1920x1080",
    title,
    url,
    sizeInBytes: options?.sizeInBytes ?? 0,
    format: options?.format ?? "",
    aspectRatio: options?.aspectRatio ?? "16:9",
    subtitles: options?.subtitles ?? [],
    closedCaptions: options?.closedCaptions ?? [],
    license: options?.license ?? "Creative Commons",
    isLicensedContent: options?.isLicensedContent ?? true,
    isFamilyFriendly: options?.isFamilyFriendly ?? true,
    isEmbeddable: options?.isEmbeddable ?? true,
    isDownloadable: options?.isDownloadable ?? true,
    data: options?.data ?? {
      id: "default-id",
      name: "Default Video Data",
      createdAt: new Date(),
      updatedAt: new Date(),
      latestVersion: latestVersion
    },
    uploadDate: options?.uploadDate ?? new Date(),
    uploader: options?.uploader ?? "default uploader",
    language: options?.language ?? LanguageEnum.English,
    location: options?.location ?? "",
    categories: options?.categories ?? [],
    views: options?.views ?? 0,
    likes: options?.likes ?? 0,
    comments: options?.comments ?? 0,
    tags: options?.tags ?? [],
    frameRate: options?.frameRate ?? 30,
    childIds: options?.childIds ?? [],
    relatedData: options?.relatedData ?? []
  };
}



for (const key in metadataEntries) {
  transformedMetadataEntries[key] = {
    ...metadataEntries[key],
    tags: Array.isArray(metadataEntries[key].tags)
      ? metadataEntries[key].tags
      : metadataEntries[key].tags ? Object.values(metadataEntries[key].tags) : [], // Convert TagsRecord to string[]
  };
}

function createMediaMetadata(
  title: string,
  artist: string,
  album: string,
  artworkSrc: string = "",
  metadataOptions: {
    id: string;
    createdBy: string;
    timestamp: Date;
    keywords: string[];
    version: string;
    isActive: boolean;
    metadataEntries: Record<string, MetadataEntry<MetaEntity, MetaK, MetaMeta, MetaAttachment, MetaExcludedFields, MetaIncludedFields>>;
    config: Promise<SnapshotStoreConfig<MetaEntity, MetaK, MetaMeta, MetaAttachment, MetaExcludedFields, MetaIncludedFields> | null>;
  } 
): UnifiedMetadata<MetaEntity, MetaK, MetaMeta, MetaAttachment, MetaExcludedFields, MetaIncludedFields>["mediaMetadata"] {
  const {
    id,
    createdBy,
    timestamp,
    metadataEntries,
    keywords,
    version,
    isActive,
    config,

    customFields,
    initialState,
    meta,
    permissions,
    metadata,
  } = metadataOptions;

  return {
    id,
    title,
    artist,
    album,
    createdBy,
    timestamp,
    metadataEntries: transformedMetadataEntries,
    keywords,
    version: typeof version === "string" ? new VersionImpl(version) : version, // Convert if necessary
    isActive,
    config,
    customFields,
    initialState,
    category,
    meta,
    permissions, 
    name: '', 
    metadata, 
    versionData,
    artwork: [
      {
        src: artworkSrc,
      },
    ],
  };
}



// Generate dynamic video metadata
const dynamicVideoMetadata = createVideoMetadata("Sample Video", "https://example.com/video", {
  bitrate: 4500,
  codec: "VP9",
  duration: 300,
  subtitles: ["English", "French"],
});

// Generate dynamic media metadata
const dynamicMediaMetadata = createMediaMetadata(
  "Dynamic Title",
  "Dynamic Artist",
  "Dynamic Album",
  "https://example.com/artwork.jpg", // Provide artworkSrc
  {
    id: "media123",
    createdBy: "user456",
    timestamp: new Date(),
    metadataEntries: {},
    keywords: ["music", "album"],
    version: "1.0",
    isActive: true,
    config: {} as Promise<SnapshotStoreConfig<VersionEntity, VersionK, VersionMeta, VersionAttachment, VersionExcludedFields, VersionIncludedFields> | null>,
  }
);


const task: Task<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields> = {
  id: "task123",
  title: "Sample Task",
  description: "This is a sample task.",
  _id: "",
  
  phaseName: '', 
  isCompleted: '', 
  label: {},
  timestamp: new Date(),
  category: "",
  assigneeId: "user456",
  dueDate: new Date(),
  priority: undefined,
  type: "general",
  status: "open",
  isComplete: false,
  estimatedHours: null,
  actualHours: null,
  completionDate: null,
  dependencies: [],
  previouslyAssignedTo: [],
  done: false,
  data: undefined,
  source: "user",
  some: () => false,
  startDate: new Date(),
  endDate: new Date(),
  isActive: true,
  tags: undefined,
  analysisType: undefined,
  analysisResults: [],
  videoThumbnail: "",
  videoDuration: 0,
  videoUrl: "",
  userId: undefined,
  query: "",
  getData: async () => task,
  
  scheduled: {
    startDate: new Date(),
    scheduledDate: new Date(),
    createdBy: "system",
  },
  progress: {
    id: '',
    name: '',
    color: '',
    description: '',
  },
  participants: [],
  uploadedAt: new Date(),
  phase: {
    id: "",
    name: "",
    description: "",
    projectId: "",
    date: "",
  },
  
  config: {} as Promise<SnapshotStoreConfig<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>>,
  permissions: [],
  customFields: {},
  
  meta: {} as StructuredMetadata<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>,
  
  
  assignedTo: null,
  
  // Optional properties
  details: undefined,
};


const { latestVersion = createLatestVersion<VersionEntity, VersionK, VersionMeta, VersionAttachment, VersionExcludedFields, VersionIncludedFields>(), ...rest } = data;

// console.log(area);  // Output: "1920x1080"
// const currentMeta = useMeta<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>(area)
const myMetaData: UnifiedMetadata<MetaEntity, MetaK, MetaMeta, MetaAttachment, MetaExcludedFields,MetaIncludedFields> = {
  area: '',
  tags: [],
  videoMetadata: dynamicVideoMetadata,
  mediaMetadata: dynamicMediaMetadata,
  projectMetadata: projectMetadata,
  taskMetadata: taskMetadata<MetaEntity, MetaK, MetaMeta, MetaAttachment, MetaExcludedFields,MetaIncludedFields>(task), // Invoke the function with `task`
  meetingMetadata: dynamicMeetingMetadata,
  structuredMetadata: currentMeta,
  latestVersion,
  schema: {},
  metadataEntries: {},
  customMediaSession: {
    sessionId: 'session123',
    status: 'active'
  },
  fileMetadata: {
    fileName: 'example.txt',
    fileSize: 1024,
    size: 1024,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  customMetadata: { customField: 'customValue' }
};

export { fetchUserAreaDimensions, transformProjectToUnifiedMetadata };

  export type {
        AdditionalMetaDataOptions, BaseMetadata, BaseMetaDataOptions, ConfigMetadata, MediaMetadata, MyDataType, ProjectMetaDataOptions,
        SnapshotMetaDataOptions, StatusMetadata, TaskMetadata, UnifiedMetadata, UnifiedMetaDataOptions, VersionMetadata
    };

