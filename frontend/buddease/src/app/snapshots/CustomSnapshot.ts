import { SnapshotCategory } from "@/app/api/getSnapshotEndpoint";
import { Order } from "@/app/components/crypto/Orders";
import { BaseEntity } from '@/app/components/routing/FuzzyMatch';
import { Attachment } from '@/app/documents/attachment/Attachment';
import { SharedIdentifiers, SharedSnapshotProperties } from "@/app/documents/RelatedProps";
import { SnapshotManager } from '@/app/hooks/useSnapshotManager';
import { Category } from '@/app/libraries/categories/generateCategoryProperties';
import { SnapshotStorage } from "@/app/utils/storage/SnapshotStorage";
import { ChildRelationship, SharedRelationshipData } from '@/app/models/data/Data';
import { PriorityTypeEnum, StatusType } from "@/app/models/data/StatusType";
import { CategoryProperties } from "@/app/pages/personas/ScenarioBuilder";
import { DataStore, InitializedState } from '@/app/projects/DataAnalysisPhase/DataProcessing/DataStore';
import { DataStoreMethods } from "@/app/projects/DataAnalysisPhase/DataProcessing/DataStoreMethods";
import { SharedMetadata } from '@/app/shared/SharedMetadata';
import { CoreSnapshot } from "@/app/snapshots/CoreSnapshot";
import { SnapshotsArray, SnapshotUnion } from '@/app/snapshots/LocalStorageSnapshotStore';
import { Snapshot } from '@/app/snapshots/Snapshot';
import { Snapshots } from '@/app/snapshots/LocalStorageSnapshotStore';
import { SnapshotDataParams } from '@/app/snapshots/SnapshotDataParams';
import { SnapshotInitialization } from '@/app/snapshots/SnapshotInitialization';
import { SnapshotOperations } from '@/app/snapshots/snapshotOperations';
import { SnapshotStoreConfig } from '@/app/snapshots/SnapshotStoreConfig';
import CalendarManagerStoreClass from '@/app/state/stores/CalendarManagerStore';
import { AuditRecord } from "@/app/subscribers/Subscriber";
import { SubscriberCollection } from '@/app/subscribers/SubscriberCollection';
import { Subscription } from "@/app/subscriptions/Subscription";
import { RealtimeDataItem } from '@/app/typings/realtimeTypes';
import { VersionHistory } from "@/app/versions/VersionData";
import { BaseDataEntity, BaseDataRoot, DefaultExcludedFields, DefaultMeta } from '@/config/BaseConfig';
import { StructuredMetadata } from "@/config/StructuredMetadata";
import { UpdateSnapshotPayload } from '@/server/database/Payload';
import { SnapshotConfig } from "./SnapshotConfig";
import { SnapshotMethods } from "./SnapshotMethods";
import { SnapshotSecurity } from "./SnapshotSecurity";
import SnapshotStore from "./SnapshotStore";
import { InitializedData } from "./SnapshotStoreOptions";
import { SnapshotWithCriteria, TagsRecord } from "./SnapshotWithCriteria";


interface CustomSnapshot<
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends 
    // Core from SnapshotData
    Omit<SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, 
      'initialState' | 'initialConfig' | 'onInitialize' | 'snapshot' | 'versionInfo'
    >,
    // Core from Snapshot  
    Omit<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      'dataObject' | 'deleted' | 'initialState' | 'isCore' | 'initialConfig' | 'onInitialize' | 'versionInfo'
    >
{
  // === RESOLVED PROPERTIES (Merging conflicts) ===
  
  // From SnapshotData (take precedence for these)
  id: string;
  storeId: number;
  validate(): boolean;
  serialize(): string;
  get(key: string): any;
  set(key: string, value: any): void;
  processEvent(data: any, type: string, event: Event): void;
  deleteSnapshot: (id: string) => void;

  // From Snapshot (take precedence for these)
  dataObject?: Record<string, unknown>;
  deleted: boolean;
  initialState: InitializedState<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | {};
  isCore: boolean;
  initialConfig: InitializedConfig | {};
  onInitialize: (callback: () => void) => void;
  
  // === COMBINED PROPERTIES ===
  
  // Version info - create unified version
  versionInfo: ExtendedVersionData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | 
               { version: number; timestamp: Date; previousVersions?: any[] };
  
  // Schema - unified approach
  schema: Record<string, SchemaField> | string;
  
  // Shared properties - unified
  shared: SharedSnapshotProperties<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  sharedMetadata: SharedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  
  // Operations
  operations: SnapshotOperations<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  
  // Base entity
  base: BaseEntity<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;

  // === CUSTOM-SPECIFIC PROPERTIES ===
  
  // Flexible data storage
  customData?: {
    originalSnapshot?: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
    originalSnapshotData?: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
    mergedAt: Date;
    mergeStrategy: 'snapshot-first' | 'data-first' | 'custom';
  };

  // Enhanced lifecycle methods
  initializeFromSnapshot(snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): void;
  initializeFromSnapshotData(snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): void;
  convertToSnapshot(): Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  convertToSnapshotData(): SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  
  // Custom methods
  getMergedProperties(): T & K & { 
    fromSnapshot: Partial<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;
    fromSnapshotData: Partial<SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;
  };
  
  // Compatibility layer
  isCompatibleWithSnapshot(): boolean;
  isCompatibleWithSnapshotData(): boolean;
  
  // Additional custom fields
  customType: 'hybrid' | 'snapshot-dominant' | 'data-dominant';
  compatibilityScore?: number; // 0-100 how well it bridges both types
}


const createCustomSnapshot = <
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  snapshot?: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  snapshotData?: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  options: {
    mergeStrategy?: 'snapshot-first' | 'data-first' | 'balanced';
    preserveOriginal?: boolean;
  } = {}
): CustomSnapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> => {
  
  const mergeStrategy = options.mergeStrategy || 'balanced';
  const preserveOriginal = options.preserveOriginal ?? true;

  // Base object with resolved conflicts
  const customSnapshot: CustomSnapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
    // === RESOLVED CORE PROPERTIES ===
    id: snapshotData?.id || snapshot?.id || `custom-${Date.now()}`,
    storeId: snapshotData?.storeId || snapshot?.storeId || 0,
    deleted: snapshot?.deleted || false,
    isCore: snapshot?.isCore || false,
    
    // === METHODS (SnapshotData takes precedence) ===
    validate: snapshotData?.validate || (() => true),
    serialize: snapshotData?.serialize || (() => JSON.stringify({})),
    get: snapshotData?.get || ((key: string) => undefined),
    set: snapshotData?.set || ((key: string, value: any) => {}),
    processEvent: snapshotData?.processEvent || ((data: any, type: string, event: Event) => {}),
    deleteSnapshot: snapshotData?.deleteSnapshot || ((id: string) => {}),
    
    // === COMBINED PROPERTIES ===
    initialState: snapshot?.initialState || snapshotData?.initialState || {},
    initialConfig: snapshot?.initialConfig || snapshotData?.initialConfig || {},
    onInitialize: snapshot?.onInitialize || ((callback: () => void) => callback()),
    
    // Version info - smart merge
    versionInfo: mergeVersionInfo(snapshot?.versionInfo, snapshotData?.versionInfo),
    
    // Schema - prefer structured over string
    schema: (typeof snapshot?.schema === 'object' ? snapshot.schema : snapshotData?.schema) || {},
    
    // Shared properties - merge intelligently
    shared: mergeSharedProperties(snapshot?.shared, snapshotData?.shared),
    sharedMetadata: mergeSharedMetadata(snapshot?.sharedMetadata, snapshotData?.sharedMetadata),
    
    // Operations and base
    operations: snapshotData?.operations || {},
    base: snapshotData?.base || {} as BaseEntity<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    
    // === CUSTOM-SPECIFIC IMPLEMENTATIONS ===
    customData: preserveOriginal ? {
      originalSnapshot: snapshot,
      originalSnapshotData: snapshotData,
      mergedAt: new Date(),
      mergeStrategy
    } : undefined,
    
    customType: determineCustomType(snapshot, snapshotData, mergeStrategy),
    
    // Custom methods
    initializeFromSnapshot: function(snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) {
      Object.assign(this, snapshot);
      if (this.customData) {
        this.customData.originalSnapshot = snapshot;
      }
    },
    
    initializeFromSnapshotData: function(snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) {
      Object.assign(this, snapshotData);
      if (this.customData) {
        this.customData.originalSnapshotData = snapshotData;
      }
    },
    
    convertToSnapshot: function(): Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
      return {
        ...this,
        // Ensure all required Snapshot properties are present
        dataObject: this.dataObject || {},
        deleted: this.deleted,
        initialState: this.initialState,
        isCore: this.isCore,
        initialConfig: this.initialConfig,
        onInitialize: this.onInitialize,
        versionInfo: this.versionInfo as ExtendedVersionData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
      } as Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
    },
    
    convertToSnapshotData: function(): SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
      return {
        ...this,
        // Ensure all required SnapshotData properties are present
        validate: this.validate,
        serialize: this.serialize,
        get: this.get,
        set: this.set,
        processEvent: this.processEvent,
        deleteSnapshot: this.deleteSnapshot,
        operations: this.operations,
        base: this.base,
        sharedMetadata: this.sharedMetadata
      } as SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
    },
    
    getMergedProperties: function() {
      return {
        ...(snapshot || {}),
        ...(snapshotData || {}),
        fromSnapshot: snapshot || {},
        fromSnapshotData: snapshotData || {}
      } as T & K & { 
        fromSnapshot: Partial<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;
        fromSnapshotData: Partial<SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;
      };
    },
    
    isCompatibleWithSnapshot: function() {
      return !!(this.id && this.storeId !== undefined && this.initialState);
    },
    
    isCompatibleWithSnapshotData: function() {
      return !!(this.id && this.storeId !== undefined && this.validate && this.serialize);
    }
  };

  return customSnapshot;
};

// Helper functions
const mergeVersionInfo = (snapshotVersion: any, dataVersion: any) => {
  if (snapshotVersion && typeof snapshotVersion === 'object') return snapshotVersion;
  if (dataVersion && typeof dataVersion === 'object') return dataVersion;
  return { version: 1, timestamp: new Date() };
};

const mergeSharedProperties = (snapshotShared: any, dataShared: any) => {
  return { ...dataShared, ...snapshotShared };
};

const mergeSharedMetadata = (snapshotMetadata: any, dataMetadata: any) => {
  return { ...dataMetadata, ...snapshotMetadata };
};

const determineCustomType = (snapshot: any, snapshotData: any, strategy: string) => {
  if (strategy === 'snapshot-first') return 'snapshot-dominant';
  if (strategy === 'data-first') return 'data-dominant';
  return 'hybrid';
};