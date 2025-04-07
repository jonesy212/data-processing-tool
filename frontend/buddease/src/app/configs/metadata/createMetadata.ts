import { EventManager, InitializedState } from "@/app/components/projects/DataAnalysisPhase/DataProcessing/DataStore";
import { StructuredMetadata } from "@/app/configs/StructuredMetadata";
import { UnifiedMetadata } from "@/app/configs/database/MetaDataOptions";
import { BaseData } from "../../components/models/data/Data";
import crypto from 'crypto';

interface DashboardMeta<T extends BaseData<any>, K extends T = T>
  extends StructuredMetadata<T, K> {
  createdBy: string;
  // Other dashboard-specific fields here
}

interface ProfileMeta<T extends BaseData<any>, K extends T = T>
  extends StructuredMetadata<T, K> {
  createdBy: string;
  updatedBy?: string;
  updatedAt?: Date;
}



// Helper function to encrypt data
const encrypt = (data: string, key: string): string => {
  const cipher = crypto.createCipher('aes-256-cbc', key);
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
};

// Helper function to mask sensitive data
const maskSensitiveData = (data: string): string => {
  return data.replace(/./g, '*');
};


export const createMetadata = <
  T extends BaseData<any>,
  K extends T = T,
  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>,
  ExcludedFields extends keyof T = never
>(
  options: UnifiedMetadata<T, K, Meta, ExcludedFields>
): Meta => {
  // Fetch encryption key from environment variables
  const encryptionKey = process.env.ENCRYPTION_KEY;
  if (!encryptionKey) {
    throw new Error('Encryption key is missing in environment variables.');
  }

  // Encrypt sensitive fields
  const encryptedApiKey = encrypt(options.apiKey || "", encryptionKey);
  const encryptedCreatedBy = encrypt(options.createdBy || "system", encryptionKey);
  const encryptedMetadata = encrypt(JSON.stringify(options.metadata || {}), encryptionKey);
  const encryptedConfig = encrypt(JSON.stringify(options.config || {}), encryptionKey);
  const encryptedBaseUrl = encrypt(options.baseUrl || "", encryptionKey);

  // Initialize SecureFieldManager for metadata
  const secureMetadataManager = new SecureFieldManager(encryptedMetadata, encryptionKey)
    .setSensitive(true) // Mark metadata as sensitive
    .setUserAccess(true); // Allow user access

  // Default metadata configuration
  const defaultMeta: StructuredMetadata<T, K> = {
    id: "default-id",
    apiEndpoint: "https://default-api-endpoint.com",
    apiKey: undefined,
    timeout: 3000,
    retryAttempts: 3,
    name: "Default Metadata",
    description: "Default metadata description",
    category: "Default Category",
    timestamp: new Date(),
    createdBy: "system",
    tags: [],
    metadata: secureMetadataManager, // Use SecureFieldManager for metadata
    initialState: { state: "initialized", data: [] } as InitializedState<T, K>,
    meta: new Map(),
    events: {} as EventManager<T, K>,
    metadataEntries: {},
    childIds: [],
    relatedData: [],
  };

  // Area-specific metadata overrides
  const areaSpecificMetaData: Record<
    string,
    Partial<DashboardMeta<T, K> | ProfileMeta<T, K>>
  > = {
    dashboard: {
      createdBy: 'dashboard-module',
      childIds: [],
    },
    profile: {
      createdBy: 'profile-module',
      updatedBy: 'user',
      updatedAt: new Date(),
    },
    // Add more areas as needed
  };

  const areaMetaData = areaSpecificMetaData[options.area] || {};

  // Merge default metadata, area-specific metadata, and overrides
  const mergedMeta: Meta = {
    ...defaultMeta,
    ...areaMetaData,
    ...options.overrides,
    apiKey: new SecureFieldManager(encryptedApiKey, encryptionKey).setSensitive(true).setUserAccess(false).toString(),
    createdBy: new SecureFieldManager(encryptedCreatedBy, encryptionKey).setSensitive(true).toString(),
    config: new SecureFieldManager(encryptedConfig, encryptionKey).setSensitive(true),
    baseUrl: new SecureFieldManager(encryptedBaseUrl, encryptionKey).setSensitive(true).toString(),
  } as Meta;

  return mergedMeta;
};


