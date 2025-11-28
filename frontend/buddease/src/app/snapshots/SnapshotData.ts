// SnapshotData.ts
import { SnapshotCategory } from "@/app/api/getSnapshotEndpoint";
import { Order } from "@/app/components/crypto/Orders";
import { BaseDataEntity, BaseDataRoot, BaseEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { SchemaField } from '@/app/config/metadata/SchemaField';
import { StructuredMetadata } from "@/app/config/StructuredMetadata";
import { Attachment } from '@/app/documents/attachment/Attachment';
import { BaseEntityProperties, SharedIdentifiers, SharedSnapshotProperties } from "@/app/documents/RelatedProps";
import { SnapshotManager } from '@/app/hooks/useSnapshotManager';
import { Category, SnapshotCategoryMethods } from '@/app/libraries/categories/generateCategoryProperties';
import { ChildRelationship, Data, SharedRelationshipData } from '@/app/models/data/Data';
import { PriorityTypeEnum, StatusType } from "@/app/models/data/StatusType";
import { CategoryProperties } from "@/app/pages/personas/ScenarioBuilder";
import { DataStoreMethods } from "@/app/projects/DataAnalysisPhase/DataProcessing/DataStoreMethods";
import { UpdateSnapshotPayload } from '@/app/interfaces/payload';
import { SharedMetadata } from '@/app/shared/SharedMetadata';
import { CoreSnapshot } from "@/app/snapshots/CoreSnapshot";
import { Snapshots, SnapshotUnion } from '@/app/snapshots/LocalStorageSnapshotStore';
import { Snapshot } from '@/app/snapshots/Snapshot';
import { SnapshotDataParams } from '@/app/snapshots/SnapshotDataParams';
import { SnapshotOperations } from '@/app/snapshots/snapshotOperations';
import { SnapshotStoreConfig } from '@/app/snapshots/SnapshotStoreConfig';
import CalendarManagerStoreClass from '@/app/state/stores/CalendarManagerStore';
import { DataStore, InitializedState } from '@/app/state/stores/DataStore';
import { AuditRecord } from "@/app/subscribers/Subscriber";
import { SubscriberCollection } from '@/app/subscribers/SubscriberCollection';
import { Subscription } from "@/app/subscriptions/Subscription";
import { RealtimeDataItem } from '@/app/typings/realtimeTypes';
import { VersionHistory } from "@/app/versions/VersionData";
import { SnapshotStorage } from "@/utils/storage/SnapshotStorage";
import { SnapshotConfig } from "./SnapshotConfig";
import { SnapshotMethods } from "./SnapshotMethods";
import { SnapshotSecurity } from "./SnapshotSecurity";
import SnapshotStore from "./SnapshotStore";
import { SnapshotWithCriteria } from "./SnapshotWithCriteria";
import { TagsRecord } from '@/app/models/tracker/Tag';
import { SharedConfigType } from '@/app/models/data/Data'

interface SnapshotBaseProperties<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends SnapshotCategoryMethods {
  // Common properties that exist across all snapshot types
  storeId?: string | number
  timestamp: Date | string | number;
  snapshotIds?: string[];
  subscribers?: SubscriberCollection<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  auditTrail: AuditRecord[];
    // Snapshot-specific properties
  dataObject?: Record<string, unknown>;
  deleted: boolean;
  initialState: InitializedState<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | {};
  isCore: boolean;
  // Common methods
  isExpired: () => boolean | undefined;

  getSnapshotData: (
    id: string | number | undefined,
    snapshotId: number,
    snapshotData: T,
    dataStoreMethods: DataStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    categoryProperties?: CategoryProperties,
    category?: Category
  ) => Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> | null | undefined;
  deleteSnapshot: (id: string) => void;
  // Change the interface to match your implementation
  snapshotData: (
    id: string | number | null,
    data: Data<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotManager: SnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    events: Record<string, CalendarManagerStoreClass<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>,
    snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    dataItems: RealtimeDataItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
    newData: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    timestamp: Date,
    payload: UpdateSnapshotPayload<T>,
    payloadData: T | K,
    mappedSnapshotData: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
    delegate: SnapshotWithCriteria<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
    store: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    category?: Category,
    snapshotId?: string | number | null,
  ) => { 
    snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>; 
  };
  // Optional common properties with defaults
  methods?: any[];
  snapshotStore?: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;
  data?: Data<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null | undefined;
}

// Optional: If you need type-safe methods
interface SnapshotBaseMethods {
  methods: Array<{
    name: string;
    execute: (...args: any[]) => any;
    description?: string;
  }>;
}


interface CustomSnapshotData<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends BaseDataEntity,
  SharedRelationshipData<K>,
  SharedIdentifiers<T, K>,
  SnapshotBaseProperties<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
{
  timestamp: string | number | Date
  orders?: Order[];
  customProperty?: unknown; 
}

// Original type of snapshotData
type OriginalSnapshotData<T extends BaseDataEntity, K extends T = T> = SnapshotData<T, K, never>;

// Core shared properties
interface SnapshotCoreBase<
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends SharedIdentifiers<T, K> {
  dataObject?: Record<string, unknown>;
  initialState?: InitializedState<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  isCore?: boolean;
  initialSnapshotStoreConfig?: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null,
  config?: SharedConfigType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  onInitialize?: (callback: () => void) => void;
  onError?: (error: Error) => void;
  taskIdToAssign?: string;
  schema?: any;
  currentCategory?: string;
  mappedSnapshotData?: any;
  // Identity and metadata
  storeId: number;
  core: CoreSnapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  security: SnapshotSecurity;
  storage: SnapshotStorage<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  snapshotIds?: string[];
  description?: string;
  tags?: TagsRecord<T>| string[];
  state?: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;
  topic?: string;
  meta?: StructuredMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  
  // Config and category
  configOption?: string | SnapshotConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;
  priority?: string | PriorityTypeEnum;
  categoryProperties?: CategoryProperties;
  
  // Lifecycle and status
  isExpired: () => boolean | undefined;
  isCompressed?: boolean;
  isEncrypted?: boolean;
  isSigned?: boolean;
  expirationDate?: Date | string;
  deleted?: boolean;
  status?: StatusType | undefined;
  
  // Audit and tracking
  auditTrail?: AuditRecord[];
  
  // Data and storage
  data: Data<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null | undefined;
  snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;
  dataStoreMethods?: DataStoreMethods<T, K, Meta> | null;
  
  // Timestamps
  updatedAt?: string | Date;
  timestamp?: string | number | Date;
}

// Extended base for relationships
interface SnapshotRelationshipBase<
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends SnapshotCoreBase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  parentId?: string | null;
  parent?: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;
  children?: ChildRelationship<T, K, Meta> | CoreSnapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  childIds?: K[];
  snapshotCategory?: SnapshotCategory<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  snapshotSubscriberId?: string | null;
  
  addRelationship: (key: string, snapshot: K) => void;
  removeRelationship: (key: string) => boolean;
  getRelationship: (key: string) => K | undefined;
  hasRelationship: (key: string) => boolean;
 
}


interface SnapshotRelationshipMethods<
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  getParentId(id: string, snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): string | null;
  getChildIds(id: string, childSnapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): (string | number | undefined)[];
  addChild(
    parentId: string,
    childId: string,
    childSnapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): void;
  removeChild(
    childId: string,
    parentId: string,
    parentSnapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    childSnapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): void;
  getChildren(id: string, childSnapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  hasChildren(id: string): boolean;
  isDescendantOf(
    childId: string, 
    parentId: string, 
    parentSnapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    childSnapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): boolean;
}

interface SnapshotRelationships<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends SnapshotRelationshipBase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  // Use composition instead of redefining methods
  // Relationship-specific properties only (no method redefinition)
  parentSnapshot?: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  childSnapshots: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  relatedSnapshots: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;
  initializeWithData(data: SnapshotUnion<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]): void;
  hasSnapshots(): Promise<boolean>;
  getSnapshotById: (id: string) => Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;
}

interface SnapshotCoreBaseWithoutMethods<
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends SharedIdentifiers<T, K> {
  dataObject?: Record<string, unknown>;
  initialState?: InitializedState<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  isCore?: boolean;
  initialSnapshotStoreConfig?: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;
  config?: SharedConfigType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  onError?: (error: Error) => void;
  taskIdToAssign?: string;
}

interface SnapshotData<
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends BaseEntityProperties,
    SnapshotCoreBaseWithoutMethods,
    SnapshotCoreBase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    Partial<SnapshotMethods<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
    SharedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  // Unique properties only
  shared: SharedSnapshotProperties<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  operations: SnapshotOperations<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  base: BaseEntity<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  sharedMetadata: SharedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;

  // Version and subscription
  subscription?: Subscription<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;
  versionHistory?: VersionHistory<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;

  // Additional lifecycle
  initialSnapshotStoreConfig?: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;

  taskIdToAssign?: string;
  schema?: Record<string, SchemaField>;
  versionInfo?: { version: number; timestamp: Date; previousVersions?: any[] };

  // Additional data
  initialState?: InitializedState<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | {};
  snapshot?: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;

  // Delegate and status
  delegate?: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  todoSnapshotId?: string;
  status?: StatusType | undefined;
  enrichedProperties?: {
      [key: string]: any;
      processedBy?: string;
      processingTimestamp?: number;
      // Add any other enrichment properties you need
    };
  validate(): boolean;
  serialize(): string;
  get(key: string): any;
  set(key: string, value: any): void;
  processEvent(data: any, type: string, event: Event): void;

  // Methods (keep only unique ones)
    // For RETRIEVING data (simple lookup)
  getSnapshotData?: (params: SnapshotDataParams<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => 
    SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined;

  deleteSnapshot: (id: string) => void;

  then?: (callback: (newData: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void) => Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined;
}




interface SnapshotHierarchyMethods<
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends SnapshotRelationshipMethods<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  
  // 1. TRAVERSAL METHODS
  traverseAncestors(
    snapshotId: string,
    callback: (ancestor: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void
  ): void;
  
  traverseDescendants(
    snapshotId: string,
    callback: (descendant: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void,
    options?: { depth?: number; includeSelf?: boolean }
  ): void;
  
  getAncestryChain(snapshotId: string): Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  getDescendantsTree(snapshotId: string): Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>;
  
  // 2. LEVEL/DEPTH METHODS
  getDepth(snapshotId: string): number;
  getLevel(snapshotId: string): number;
  getSnapshotsAtLevel(level: number): Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  
  // 3. HIERARCHY VALIDATION
  validateHierarchy(): boolean;
  detectCycles(): string[]; // Returns IDs involved in cycles
  isTreeValid(): boolean;
  
  // 4. HIERARCHY TRANSFORMATION
  moveSubtree(
    sourceSnapshotId: string,
    newParentId: string | null
  ): boolean;
  
  flattenHierarchy(): Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  rebuildHierarchyFromFlatList(
    snapshots: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]
  ): void;
  
  // 5. BULK HIERARCHY OPERATIONS
  getRootSnapshots(): Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  getLeafSnapshots(): Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  
  // 6. HIERARCHY QUERIES
  findCommonAncestor(
    snapshotId1: string,
    snapshotId2: string
  ): Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;
  
  getSiblings(snapshotId: string): Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  isRoot(snapshotId: string): boolean;
  isLeaf(snapshotId: string): boolean;
  
  // 7. HIERARCHY STATISTICS
  getSubtreeSize(snapshotId: string): number;
  getMaxDepth(): number;
  getHierarchyStats(): {
    totalSnapshots: number;
    maxDepth: number;
    rootCount: number;
    leafCount: number;
    averageChildren: number;
  };
  
  // 8. HIERARCHY IMPORT/EXPORT
  exportHierarchy(): HierarchyExport<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  importHierarchy(
    hierarchyData: HierarchyExport<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): void;
}


interface HierarchyExport<
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  snapshots: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  relationships: Array<{
    parentId: string | null;
    childId: string;
    order?: number;
  }>;
  metadata: {
    exportedAt: Date;
    version: string;
    rootSnapshotIds: string[];
  };
}

export type {
  CustomSnapshotData, SnapshotBaseMethods, SnapshotBaseProperties, SnapshotCoreBase, SnapshotData, SnapshotHierarchyMethods, SnapshotRelationships
};

