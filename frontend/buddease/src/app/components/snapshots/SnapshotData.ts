// SnapshotData.ts
import { SnapshotCategory } from "@/app/api/getSnapshotEndpoint";
import { Attachment } from '@/app/components/documents/Attachment/attachment';
import { SharedIdentifiers, SharedSnapshotProperties } from "@/app/components/documents/RelatedProps";
import { InitializedState } from '@/app/components/projects/DataAnalysisPhase/DataProcessing/DataStore';
import { BaseEntity } from '@/app/components/routing/FuzzyMatch';
import { Snapshots } from '@/app/components/snapshots';
import { SnapshotStoreConfig } from '@/app/components/snapshots/SnapshotStoreConfig';
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/configs/BaseConfig';
import { StructuredMetadata } from "@/app/configs/StructuredMetadata";
import { SharedMetadata } from '@/app/configs/metadata/createMetadataState';
import { CategoryProperties } from "@/app/pages/personas/ScenarioBuilder";
import { BaseDataRoot } from "@/configs/BaseConfig";
import { SnapshotManager } from '../../../data_analysis/frontend/buddease/src/app/components/hooks/useSnapshotManager';
import { RealtimeDataItem } from '../../../data_analysis/frontend/buddease/src/app/components/models/realtime/RealtimeData';
import CalendarManagerStoreClass from '../../../data_analysis/frontend/buddease/src/app/components/state/stores/CalendarManagerStore';
import { UpdateSnapshotPayload } from '../../../data_analysis/frontend/buddease/src/server/database/Payload';
import { Order } from "../crypto/Orders";
import { Category } from "../libraries/categories/generateCategoryProperties";
import { ChildRelationship, SharedRelationshipData } from "../models/data/Data";
import { PriorityTypeEnum, StatusType } from "../models/data/StatusType";
import { DataStoreMethods } from "../projects/DataAnalysisPhase/DataProcessing/ DataStoreMethods";
import { DataStore } from "../projects/DataAnalysisPhase/DataProcessing/DataStore";
import { Subscription } from "../subscriptions/Subscription";
import { AuditRecord } from "../users/Subscriber";
import { SubscriberCollection } from "../users/SubscriberCollection";
import { VersionHistory } from "../versions/VersionData";
import { CoreSnapshot } from "./CoreSnapshot";
import { SnapshotsArray, SnapshotUnion } from "./LocalStorageSnapshotStore";
import { Snapshot } from "./Snapshot";
import { SnapshotConfig } from "./SnapshotConfig";
import { SnapshotDataParams } from './SnapshotDataParams';
import { SnapshotInitialization } from './SnapshotInitialization';
import { SnapshotMethods } from "./SnapshotMethods";
import { SnapshotSecurity } from "./SnapshotSecurity";
import SnapshotStore from "./SnapshotStore";
import { InitializedData } from "./SnapshotStoreOptions";
import { SnapshotWithCriteria, TagsRecord } from "./SnapshotWithCriteria";
import { SnapshotOperations } from './snapshotOperations';


interface SnapshotBaseProperties<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  // Common properties that exist across all snapshot types
  storeId: number;
  timestamp: Date | string | number;
  snapshotIds?: string[];
  subscribers?: SubscriberCollection<T, K, Meta, ExcludedFields>[];
  auditTrail: AuditRecord[];
    // Snapshot-specific properties
  dataObject?: Record<string, unknown>;
  deleted: boolean;
  initialState: InitializedState<T, K, Meta, ExcludedFields> | {};
  isCore: boolean;
  // Common methods
  isExpired: () => boolean | undefined;
  setSnapshotCategory: (id: string, newCategory: Category) => void;
  getSnapshotCategory: (id: string) => Category | undefined;
  getSnapshotData: (
    id: string | number | undefined,
    snapshotId: number,
    snapshotData: T,
    category: Category | undefined,
    categoryProperties: CategoryProperties | undefined,
    dataStoreMethods: DataStore<T, K, Meta, ExcludedFields>
  ) => Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> | null | undefined;
  deleteSnapshot: (id: string) => void;
  // Change the interface to match your implementation
  snapshotData: (
    id: string | number | null,
    data: InitializedData<T, K, Meta, ExcludedFields>,
    snapshotManager: SnapshotManager<T, K, Meta, ExcludedFields>,
    events: Record<string, CalendarManagerStoreClass<T, K, Meta, ExcludedFields>[]>,
    snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    dataItems: RealtimeDataItem<T, K, Meta, ExcludedFields>[],
    newData: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    timestamp: Date,
    payload: UpdateSnapshotPayload<T>,
    category: Category | undefined,
    payloadData: T | K,
    mappedSnapshotData: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
    delegate: SnapshotWithCriteria<T, K, Meta, ExcludedFields>[],
    store: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotId?: string | number | null,
    storeId?: number
  ) => { 
    snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>; 
  };
  // Optional common properties with defaults
  methods?: any[];
  snapshotStore?: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;
  data?: InitializedData<T, K, Meta, ExcludedFields> | null | undefined;
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
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
> extends BaseDataEntity<T, K, Meta, AttachmentType, ExcludedFields>,
  SharedRelationshipData<K>,
  SharedIdentifiers<T, K>,
  SnapshotBaseProperties<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
{
  timestamp: string | number | Date | undefined
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
  // Identity and metadata
  storeId: number;
  core: CoreSnapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  security: SnapshotSecurity;
  storage: SnapshotStorage<T, K, Meta, ExcludedFields>;
  snapshotIds?: string[];
  description?: string | null;
  tags?: TagsRecord<T, K, Meta, ExcludedFields> | string[] | undefined;
  state?: SnapshotsArray<T, K, Meta> | null;
  topic?: string;
  meta?: StructuredMetadata<T, K>;
  
  // Config and category
  configOption?: string | SnapshotConfig<T, K, Meta, ExcludedFields> | SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;
  priority?: string | PriorityTypeEnum;
  categoryProperties?: CategoryProperties | undefined;
  
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
  subscribers?: SubscriberCollection<T, K, Meta, ExcludedFields>[];
  
  // Data and storage
  data: InitializedData<T, K, Meta, ExcludedFields> | null | undefined;
  snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;
  dataStoreMethods?: DataStoreMethods<T, K, Meta> | null;
  
  // Timestamps
  updatedAt?: string | Date;
  timestamp: string | number | Date | undefined;
}

// Extended base for relationships
interface SnapshotRelationshipBase<
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends SnapshotCoreBase<T, K, Meta, ExcludedFields> {
  parentId?: string | null;
  parent?: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;
  children?: ChildRelationship<T, K, Meta> | CoreSnapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  childIds?: K[];
  snapshotCategory?: SnapshotCategory<T, K, Meta, ExcludedFields>
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
> extends SnapshotRelationshipBase<T, K, Meta, ExcludedFields> {
  // Use composition instead of redefining methods
  // Relationship-specific properties only (no method redefinition)
  parentSnapshot?: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  childSnapshots: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  relatedSnapshots: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;
  initializeWithData(data: SnapshotUnion<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]): void | undefined;
  hasSnapshots(): Promise<boolean>;
  getSnapshotById: (id: string) => Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;
}


interface SnapshotData<
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends Omit<SnapshotInitialization<T, K, Meta, ExcludedFields>, 'initialState' | 'initialConfig' | 'onInitialize'>,
      SnapshotCoreBase<T, K, Meta, ExcludedFields>,
      Partial<SnapshotMethods<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
      SharedMetadata<T, K, ExcludedFields>
{
  id: string;
  storeId: number;
  category: any;
  validate(): boolean;
  serialize(): string;
  get(key: string): any;
  set(key: string, value: any): void;
  processEvent(data: any, type: string, event: Event): void;

  // Unique properties only
  shared: SharedSnapshotProperties<T, K, ExcludedFields>;
  operations: SnapshotOperations<T, K, Meta, AttachmentType, ExcludedFields>;
  base: BaseEntity<T, K, Meta, ExcludedFields>;
  sharedMetadata: SharedMetadata<T, K, Meta, ExcludedFields>;

  // Version and subscription
  subscription?: Subscription<T, K, Meta, ExcludedFields> | null;
  versionHistory?: VersionHistory<T, K, Meta, ExcludedFields>;
  
  // Additional lifecycle
  initialConfig?: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;

  taskIdToAssign?: string;
  schema?: any;
  versionInfo?: { version: number; timestamp: Date; previousVersions?: any[] };
  
  // Additional data
  initialState?: InitializedState<T, K, Meta, ExcludedFields> | {};
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
  // Methods (keep only unique ones)
    // For RETRIEVING data (simple lookup)
  getSnapshotData?: (params: SnapshotDataParams<T, K, Meta, ExcludedFields>) => 
    SnapshotData<T, K, Meta, ExcludedFields> | undefined;
 
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
> extends SnapshotRelationshipMethods<T, K, Meta, ExcludedFields> {
  
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
  exportHierarchy(): HierarchyExport<T, K, Meta, ExcludedFields>;
  importHierarchy(
    hierarchyData: HierarchyExport<T, K, Meta, ExcludedFields>
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
  CustomSnapshotData, SnapshotBaseMethods, SnapshotBaseProperties, SnapshotData, SnapshotHierarchyMethods, SnapshotRelationships
};

