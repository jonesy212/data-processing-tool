// processSnapshotData.ts
import { AppStructurePermissions } from '@/app/config/appStructure/AppStructure';

import { BaseEntity } from '@/app/config/BaseConfig';
import { SharedSnapshotProperties } from '@/app/documents/RelatedProps';
import { SnapshotIdentity } from '@/app/snapshots/SnapshotIdentity';
import { SecurityReport, SecurityScanResult } from '@/app/typings/securityMeasureTypes';
import { SnapshotStorage } from "@/utils/storage/SnapshotStorage";

import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { Attachment } from "@/app/documents/attachment/Attachment";
import { SharedMetadata } from '@/app/shared/SharedMetadata';
import { Snapshot, SnapshotBaseProperties, SnapshotData, SnapshotDataType } from '@/app/snapshots';
import { CoreSnapshot } from "@/app/snapshots/CoreSnapshot";
import { CustomSnapshotData } from '@/app/snapshots/SnapshotData';
import { SnapshotOperations } from '@/app/snapshots/snapshotOperations';
import { SnapshotSecurity } from '@/app/snapshots/SnapshotSecurity';
import SnapshotStore from '@/app/snapshots/SnapshotStore';
import { SnapshotStoreConfig } from '@/app/snapshots/SnapshotStoreConfig';
import { isSnapshotStore } from "@/app/typings/YourSpecificSnapshotType";
import { isSnapshot } from '@/utils/snapshotUtils';
import { DataWithPriority } from "@/utils/versionUtils";

interface EnhancedSnapshotData<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  getLatestSnapshot: () => Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
}

// Enhanced type that includes both regular and store-like snapshots

// Enhanced type that includes both regular and store-like snapshots with all 4 parameters
type EnhancedSnapshotDataType<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> =
  | SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  | EnhancedSnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  | Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>
  | Promise<{ snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> }>
  | SnapshotDataType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  | Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  | SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  | undefined;

/**
 * Type guard for EnhancedSnapshotData
 */
function isEnhancedSnapshotData<
  T extends BaseDataEntity, K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
  >(
  input: unknown
): input is EnhancedSnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  return (
    typeof input === 'object' && 
    input !== null &&
    'getLatestSnapshot' in input &&
    typeof input.getLatestSnapshot === 'function'
  );
}

/**
 * Converts various snapshot-like objects to standardized SnapshotData format
 */const toSnapshotData = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  input: EnhancedSnapshotDataType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
): SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined => {
  if (!input) return undefined;
  
  if (input instanceof Map) {
    const firstEntry = input.values().next().value;
    if (!firstEntry) return undefined;
    
    // Type guard to ensure we have the base properties
    const baseEntry = firstEntry as unknown as SnapshotBaseProperties<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
    
    // Convert Snapshot to SnapshotData properly
    return {
      // Core nested properties with proper types
      core: firstEntry.core || {} as CoreSnapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      shared: firstEntry.shared || {} as SharedSnapshotProperties<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      identity: firstEntry.identity || {} as SnapshotIdentity<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      security: firstEntry.security || {
        isEncrypted: false,
        isSigned: false,
        isCompressed: false,
        permissions: getDefaultPermissions(),
        accessControlList: [],
        allowedUsers: [],
        allowedRoles: [],
        securityMeasures: [],
        securityHeaders: new Map(),
        securityLogger: {
          enabled: true,
          logFilePath: '/logs/security.log',
          logLevel: 'info',
          maxFileSize: 10485760,
        },
        auditTrail: [],
        lastSecurityScan: new Date(),
        securityScore: 100,
        compliance: {
          gdprCompliant: false,
          hipaaCompliant: false,
          pciCompliant: false,
        },
        getSecurityMeasure: (measureId: string) => undefined,
        validateIntegrity: () => true,
        verifySignature: () => true,
        checkPermissions: () => true,
        encryptData: async (data) => data,
        decryptData: async (data) => data,
        signData: async () => 'signature',
        verifyData: async () => true,
        implementSecurityMeasures: () => {},
        applyHeaderSecurity: () => new Map(),
        configureLoggerSecurity: () => {},
        addSecurityMeasure: () => {},
        removeSecurityMeasure: () => {},
        initializeSecurity: async () => {},
        runSecurityScan: () => ({} as SecurityScanResult),
        generateSecurityReport: () => ({} as SecurityReport),
      } as SnapshotSecurity,
      versioning: firstEntry.versioning || {} as SnapshotVersioning<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      storage: firstEntry.storage || {} as SnapshotStorage<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      operations: firstEntry.operations || {} as SnapshotOperations<T, K>,
      base: firstEntry.base || {} as BaseEntity<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      sharedMetadata: firstEntry.sharedMetadata || {} as SharedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      snapshotStore: firstEntry.snapshotStore || null,
      items: baseEntry.items ?? [],
      config: baseEntry.config,
      currentCategory: baseEntry.currentCategory,
      find: baseEntry.find,
      
      // Copy all properties from the snapshot
      ...firstEntry,
      
      // Ensure required properties exist with proper defaults
    
      storeId: baseEntry.storeId ?? 0,
      timestamp: baseEntry.timestamp ?? new Date(),
      isExpired: baseEntry.isExpired ?? (() => false),
      setSnapshotCategory: baseEntry.setSnapshotCategory ?? (() => {}),
      getSnapshotCategory: baseEntry.getSnapshotCategory ?? (() => undefined),
      getSnapshotData: baseEntry.getSnapshotData ?? (() => undefined),
      deleteSnapshot: baseEntry.deleteSnapshot ?? (() => {}),
      
      // Default empty arrays for collection properties
      subscribers: baseEntry.subscribers ?? [],
      auditTrail: baseEntry.auditTrail ?? [],
      snapshotIds: baseEntry.snapshotIds ?? [],
      methods: baseEntry.methods ?? [],
      
      // Ensure data property exists
      data: firstEntry.data ?? null,
      
    } as SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  }
  
  // Handle Promise inputs
  if (input instanceof Promise) {
    return undefined;
  }
  
  // Handle EnhancedSnapshotData objects
  if (isEnhancedSnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(input)) {
    const latestSnapshot = input.getLatestSnapshot();
    return latestSnapshot ? toSnapshotData(latestSnapshot) : undefined;
  }
  
  // Handle SnapshotStore objects
  if (isSnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(input)) {
    // Convert SnapshotStore to SnapshotData if needed
    return {
      ...input,
      core: input.core || {} as CoreSnapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      shared: input.shared || {} as SharedSnapshotProperties<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      identity: input.identity || {} as SnapshotIdentity<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      security: input.security || {} as SnapshotSecurity,
      // ... other required properties
    } as unknown as SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  }
  
  // If it's already SnapshotData or compatible, return as-is
  return input as SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
};

// Helper function for default permissions
function getDefaultPermissions(): AppStructurePermissions {
  return {
    userId: 'default',
    permissions: {},
    permissionType: 'read',
    canView: true,
    canEdit: false,
    read: true,
    write: false,
    delete: false,
    share: false,
    execute: false,
    customPermission: false,
  };
}

// Define generic types T and K for the function
const findSnapshotStoresById = async <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  id: number
): Promise<SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] | undefined> => {
  // Simulate an asynchronous operation to retrieve SnapshotStores by ID
  // Assume `snapshotStoresDatabase` is a Map or database you’re querying from
  const snapshotStoresDatabase: Map<number, SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> = new Map(); // Replace with actual data source

  // Fetch snapshot stores for the given ID
  const stores = snapshotStoresDatabase.get(id);
  return stores ? stores : undefined;
};

// Example helper to check if input is CustomSnapshotData

// 2. Type guard with proper constraints
const isCustomSnapshotData = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  input: unknown
): input is CustomSnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> => {
  // More robust type checking
  return (
    typeof input === 'object' && 
    input !== null &&
    'timestamp' in input &&  // Required property
    'orders' in input       // Required property
    // Add other required property checks
  );
};

// 3. Transformation function with proper typing
const transformCustomSnapshotToSnapshot = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  input: CustomSnapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
): Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> => {
  // Create base object with proper typing
  const baseSnapshot: Partial<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> = {
    ...input,
    // Provide sensible defaults for required Snapshot properties
    deleted: input.deleted ?? false,
    isCore: input.isCore ?? true,
    initialConfig: input.initialConfig ?? {},
    onInitialize: input.onInitialize ?? (() => {}),
    onError: input.onError ?? ((error: Error) => console.error(error)),
    taskIdToAssign: input.taskIdToAssign ?? '',
    schema: input.schema ? JSON.stringify(input.schema) : "{}",
    currentCategory: input.currentCategory ?? "default",
    storeId: input.storeId ?? Date.now(), // Better default than 0
    versionInfo: input.versionInfo ?? { 
      version: 1, 
      timestamp: new Date(),
      previousVersions: []
    },
    
    // Complex defaults
    mappedSnapshotData: new Map(),
    initializedState: {},
    criteria: {},
    relationships: new Map(),
    storeConfig: {} as SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    additionalData: {},
    timestamp: input.timestamp ?? new Date(),
    orders: input.orders ?? [],
  };

  // Cast to the target type (with validation in real code)
  return baseSnapshot as Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
};

// Process snapshot data
function processSnapshotData<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  snapshotDataType: SnapshotDataType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined
): void {
  if (!snapshotDataType) {
    console.log("No snapshot data available.");
    return;
  }

  // Check if `snapshotDataType` is a Map
  if (snapshotDataType instanceof Map) {
    snapshotDataType.forEach((snapshot, key) => {
      console.log(`Processing snapshot with key: ${key}`, snapshot);
      
      // Handle different types in the Map with proper generics
      if (isSnapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(snapshot)) {
        processPriorityData(convertSnapshotToSnapshotDataType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(snapshot));
      } else if (isSnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(snapshot)) {
        processPriorityData(snapshotDataType as SnapshotDataType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>);
      } else {
        processPriorityData(snapshot as any);
      }
    });
  } 
  // Handle individual Snapshot objects
  else if (isSnapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(snapshotDataType)) {
    console.log("Processing Snapshot", snapshotDataType);
    processPriorityData(convertSnapshotToSnapshotDataType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(snapshotDataType));
  }
  // Handle SnapshotStore objects
  else if (isSnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(snapshotDataType)) {
    console.log("Processing SnapshotStore", snapshotDataType);
    processPriorityData(snapshotDataType as SnapshotDataType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>);
  }
  // Handle SnapshotData objects
  else {
    console.log("Processing SnapshotData", snapshotDataType);
    processPriorityData(snapshotDataType as SnapshotDataType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>);
  }
}

// Helper function to convert Snapshot to SnapshotDataType with all generics
function convertSnapshotToSnapshotDataType<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
): SnapshotDataType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  // Implement conversion logic based on your types
  return {
    // Map snapshot properties to SnapshotDataType structure
    ...snapshot,
    // Add any missing properties or transformations
  } as unknown as SnapshotDataType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
}

// Update processPriorityData to accept more types with proper generics
const processPriorityData = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  snapshotInput: SnapshotDataType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
): void => {
  // Convert to a common type first, then process
  const processedData = convertToProcessableType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(snapshotInput);
  if (!processedData) return;

  const dataWithPriority: Partial<DataWithPriority> = {
    priority: (processedData.data as T & { priority?: string })?.priority,
  };

  if (hasPriority(dataWithPriority)) {
    console.log('Data has priority:', dataWithPriority.priority);
  } else {
    console.log('No priority data found.');
  }
};

// Conversion function with all generics
function convertToProcessableType<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  input: SnapshotDataType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
): SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null {
  if (isSnapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(input)) {
    return transformSnapshotToSnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(input);
  } else if (isSnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(input)) {
    return input.getLatestSnapshot?.() || null;
  }
  return input as SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
}


// Type guard to check if an object has the 'priority' property
function hasPriority<T extends Partial<DataWithPriority>>(
  data: T
): data is T & DataWithPriority {
  return (data as DataWithPriority).priority !== undefined;
}

export {
    findSnapshotStoresById, hasPriority, isCustomSnapshotData, processPriorityData, processSnapshotData, transformCustomSnapshotToSnapshot
};
export type { EnhancedSnapshotData };

