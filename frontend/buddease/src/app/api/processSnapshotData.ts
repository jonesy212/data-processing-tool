import { isSnapshotStore } from "@/app/components/typings/YourSpecificSnapshotType";
import { isSnapshot } from '@/app/components/snapshots/snapshotUtils';
import { ExcludedFields } from '@/app/components/routing/Fields';
import { BaseData } from '@/app/components/models/data/Data';
import { SnapshotOperations } from '@/app/components/snapshots/snapshotOperations';
import { Snapshot, SnapshotData,SnapshotBaseProperties } from '@/app/components/snapshots';
import { CustomSnapshotData } from "@/app/components/snapshots/SnapshotData";
import SnapshotStore from '@/app/components/snapshots/SnapshotStore';
import { SnapshotStoreConfig } from '@/app/components/snapshots/SnapshotStoreConfig';
import { DataWithPriority } from "@/app/components/utils/versionUtils";
import { StructuredMetadata } from "@/app/configs/StructuredMetadata";
import { SnapshotDataType } from "../components/snapshots";
import { BaseDataEntity, DefaultMeta, DefaultExcludedFields } from '@/app/configs/BaseConfig';
import { Meta } from '@/app/components/models/data/dataStoreMethods';
import { SharedMetadata } from '@/app/configs/metadata/createMetadataState';
import { CoreSnapshot } from "@/app/components/snapshots/CoreSnapshot";
import { Attachment } from "@/documents/Attachment/attachment";
import { BaseEntity } from '@/app/components/routing/FuzzyMatch';
import { SnapshotSecurity } from '@/app/components/snapshots/SnapshotSecurity';

interface EnhancedSnapshotData<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
> extends SnapshotData<T, K, Meta, ExcludedFields> {
  getLatestSnapshot: () => Snapshot<T, K, Meta, ExcludedFields>;
}

// Enhanced type that includes both regular and store-like snapshots

// Enhanced type that includes both regular and store-like snapshots with all 4 parameters
type EnhancedSnapshotDataType<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
> =
  | SnapshotData<T, K, Meta, ExcludedFields>
  | EnhancedSnapshotData<T, K, Meta, ExcludedFields>
  | Map<string, Snapshot<T, K, Meta, ExcludedFields>>
  | Promise<{ snapshot: Snapshot<T, K, Meta, ExcludedFields> }>
  | SnapshotDataType<T, K>
  | Snapshot<T, K, Meta, ExcludedFields>
  | SnapshotStore<T, K, Meta, ExcludedFields>
  | undefined;

/**
 * Type guard for EnhancedSnapshotData
 */
function isEnhancedSnapshotData<T extends BaseDataEntity, K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
  >(
  input: unknown
): input is EnhancedSnapshotData<T, K> {
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
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
>(
  input: EnhancedSnapshotDataType<T, K, Meta, ExcludedFields>
): SnapshotData<T, K, Meta, ExcludedFields> | undefined => {
  if (!input) return undefined;
  
  if (input instanceof Map) {
    const firstEntry = input.values().next().value;
    if (!firstEntry) return undefined;
    
    // Type guard to ensure we have the base properties
    const baseEntry = firstEntry as unknown as SnapshotBaseProperties<T, K, Meta, ExcludedFields>;
    
    // Convert Snapshot to SnapshotData properly
    return {
      // Core nested properties with proper types
      core: firstEntry.core || {} as CoreSnapshot<T, K, Meta, ExcludedFields>,
      shared: firstEntry.shared || {} as SharedSnapshotProperties<T, K, ExcludedFields>,
      identity: firstEntry.identity || {} as SnapshotIdentity,
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
      versioning: firstEntry.versioning || {} as SnapshotVersioning<T, K, Meta>,
      storage: firstEntry.storage || {} as SnapshotStorage<T, K, Meta, ExcludedFields>,
      operations: firstEntry.operations || {} as SnapshotOperations<T, K>,
      base: firstEntry.base || {} as BaseEntity<T, K, Meta, ExcludedFields>,
      sharedMetadata: firstEntry.sharedMetadata || {} as SharedMetadata<T, K, Meta, ExcludedFields>,
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
      snapshotData: baseEntry.snapshotData ?? (async () => ({} as SnapshotDataType<T, K>)),
      
      // Default empty arrays for collection properties
      subscribers: baseEntry.subscribers ?? [],
      auditTrail: baseEntry.auditTrail ?? [],
      snapshotIds: baseEntry.snapshotIds ?? [],
      methods: baseEntry.methods ?? [],
      
      // Ensure data property exists
      data: firstEntry.data ?? null,
      
    } as SnapshotData<T, K, Meta, ExcludedFields>;
  }
  
  // Handle Promise inputs
  if (input instanceof Promise) {
    return undefined;
  }
  
  // Handle EnhancedSnapshotData objects
  if (isEnhancedSnapshotData<T, K, Meta, ExcludedFields>(input)) {
    const latestSnapshot = input.getLatestSnapshot();
    return latestSnapshot ? toSnapshotData(latestSnapshot) : undefined;
  }
  
  // Handle SnapshotStore objects
  if (isSnapshotStore<T, K, Meta, ExcludedFields>(input)) {
    // Convert SnapshotStore to SnapshotData if needed
    return {
      ...input,
      core: input.core || {} as CoreSnapshot<T, K, Meta>,
      shared: input.shared || {} as SharedSnapshotProperties<T, K, ExcludedFields>,
      identity: input.identity || {} as SnapshotIdentity,
      security: input.security || {} as SnapshotSecurity,
      // ... other required properties
    } as unknown as SnapshotData<T, K, Meta, ExcludedFields>;
  }
  
  // If it's already SnapshotData or compatible, return as-is
  return input as SnapshotData<T, K, Meta, ExcludedFields>;
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
  K extends T = T
>(
  id: number
): Promise<SnapshotStore<T, K>[] | undefined> => {
  // Simulate an asynchronous operation to retrieve SnapshotStores by ID
  // Assume `snapshotStoresDatabase` is a Map or database you’re querying from
  const snapshotStoresDatabase: Map<number, SnapshotStore<T, K>[]> = new Map(); // Replace with actual data source

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
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
>(
  input: unknown
): input is CustomSnapshotData<T, K, Meta, AttachmentType, ExcludedFields> => {
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
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
>(
  input: CustomSnapshotData<T, K, Meta, AttachmentType, ExcludedFields>
): Snapshot<T, K, Meta, ExcludedFields> => {
  // Create base object with proper typing
  const baseSnapshot: Partial<Snapshot<T, K, Meta, ExcludedFields>> = {
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
    storeConfig: {} as SnapshotStoreConfig<T, K, Meta, ExcludedFields>,
    additionalData: {},
    timestamp: input.timestamp ?? new Date(),
    orders: input.orders ?? [],
  };

  // Cast to the target type (with validation in real code)
  return baseSnapshot as Snapshot<T, K, Meta, ExcludedFields>;
};

// Process snapshot data
function processSnapshotData<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
>(
  snapshotDataType: SnapshotDataType<T, K> | SnapshotData<T, K, Meta, ExcludedFields> | Snapshot<T, K, Meta, ExcludedFields> | SnapshotStore<T, K, Meta, ExcludedFields> | undefined
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
      if (isSnapshot<T, K, Meta, ExcludedFields>(snapshot)) {
        processPriorityData(convertSnapshotToSnapshotDataType<T, K, Meta, ExcludedFields>(snapshot));
      } else if (isSnapshotStore<T, K, Meta, ExcludedFields>(snapshot)) {
        processPriorityData(snapshotDataType as SnapshotDataType<T, K>);
      } else {
        processPriorityData(snapshot as any);
      }
    });
  } 
  // Handle individual Snapshot objects
  else if (isSnapshot<T, K, Meta, ExcludedFields>(snapshotDataType)) {
    console.log("Processing Snapshot", snapshotDataType);
    processPriorityData(convertSnapshotToSnapshotDataType<T, K, Meta, ExcludedFields>(snapshotDataType));
  }
  // Handle SnapshotStore objects
  else if (isSnapshotStore<T, K, Meta, ExcludedFields>(snapshotDataType)) {
    console.log("Processing SnapshotStore", snapshotDataType);
    processPriorityData(snapshotDataType as SnapshotDataType<T, K>);
  }
  // Handle SnapshotData objects
  else {
    console.log("Processing SnapshotData", snapshotDataType);
    processPriorityData(snapshotDataType as SnapshotDataType<T, K>);
  }
}

// Helper function to convert Snapshot to SnapshotDataType with all generics
function convertSnapshotToSnapshotDataType<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
>(
  snapshot: Snapshot<T, K, Meta, ExcludedFields>
): SnapshotDataType<T, K> {
  // Implement conversion logic based on your types
  return {
    // Map snapshot properties to SnapshotDataType structure
    ...snapshot,
    // Add any missing properties or transformations
  } as unknown as SnapshotDataType<T, K>;
}

// Update processPriorityData to accept more types with proper generics
const processPriorityData = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
>(
  snapshotInput: SnapshotDataType<T, K> | Snapshot<T, K, Meta, ExcludedFields> | SnapshotStore<T, K, Meta, ExcludedFields> | SnapshotData<T, K, Meta, ExcludedFields>
): void => {
  // Convert to a common type first, then process
  const processedData = convertToProcessableType<T, K, Meta, ExcludedFields>(snapshotInput);
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
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
>(
  input: SnapshotDataType<T, K> | Snapshot<T, K, Meta, ExcludedFields> | SnapshotStore<T, K, Meta, ExcludedFields> | SnapshotData<T, K, Meta, ExcludedFields>
): SnapshotData<T, K, Meta, ExcludedFields> | null {
  if (isSnapshot<T, K, Meta, ExcludedFields>(input)) {
    return transformSnapshotToSnapshotData<T, K, Meta, ExcludedFields>(input);
  } else if (isSnapshotStore<T, K, Meta, ExcludedFields>(input)) {
    return input.getLatestSnapshot?.() || null;
  }
  return input as SnapshotData<T, K, Meta, ExcludedFields>;
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
