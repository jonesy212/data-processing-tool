import { Attachment } from "@/app/documents/attachment/Attachment";
import { useSecurityAudit } from "@/app/hooks/useSecurityAudit";
import { EventManager, InitializedState } from "@/app/projects/DataAnalysisPhase/DataProcessing/DataStore";
import { BaseDataEntity, BaseDataRoot, DefaultExcludedFields, DefaultMeta } from '@/config/BaseConfig';
import { UnifiedMetadata, UnifiedMetaDataOptions } from "@/config/MetaDataOptions";
import { StructuredMetadata } from "@/config/StructuredMetadata";
import SecureFieldManager from '@/server/security/SecureFieldManager';
import { createLatestVersion } from '@/versions/createLatestVersion';
import crypto from 'crypto';


interface DashboardMeta<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T>
extends StructuredMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  createdBy: string;
  // Other dashboard-specific fields here
}

interface ProfileMeta<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>
  extends StructuredMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
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
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  options: Partial<UnifiedMetaDataOptions<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> & {
    // Security options
    enableEncryption?: boolean;
    enableSanitization?: boolean;
    // Area-specific configuration
    area?: string;
    overrides?: Partial<StructuredMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;
  } = {}
): UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> => {
  
  // Destructure options with defaults
  const {
    enableEncryption = true,
    enableSanitization = true,
    area = '',
    overrides = {},
    ...metadataOptions
  } = options;

  // Apply sanitization if enabled
  let sanitizedData = metadataOptions;
  if (enableSanitization) {
    const { sanitizeMetadata } = useSecurityAudit();
    sanitizedData = sanitizeMetadata(metadataOptions);
  }

  // Handle encryption if enabled
  let encryptedFields: Partial<UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> = {};
  
  if (enableEncryption) {
    const encryptionKey = process.env.ENCRYPTION_KEY;
    if (!encryptionKey) {
      throw new Error('Encryption key is missing in environment variables.');
    }

    // Encrypt sensitive fields
    const encryptedApiKey = encrypt(sanitizedData.apiKey || "", encryptionKey);
    const encryptedCreatedBy = encrypt(sanitizedData.createdBy || "system", encryptionKey);
    const encryptedMetadata = encrypt(JSON.stringify(sanitizedData.metadata || {}), encryptionKey);
    const encryptedConfig = encrypt(JSON.stringify(sanitizedData.config || {}), encryptionKey);
    const encryptedBaseUrl = encrypt(sanitizedData.baseUrl || "", encryptionKey);

    // Initialize SecureFieldManager for encrypted fields
    const secureMetadataManager = new SecureFieldManager(encryptedMetadata, encryptionKey)
      .setSensitive(true)
      .setUserAccess(true);

    encryptedFields = {
      apiKey: new SecureFieldManager(encryptedApiKey, encryptionKey)
        .setSensitive(true)
        .setUserAccess(false)
        .toString(),
      createdBy: new SecureFieldManager(encryptedCreatedBy, encryptionKey)
        .setSensitive(true)
        .toString(),
      config: new SecureFieldManager(encryptedConfig, encryptionKey)
        .setSensitive(true),
      baseUrl: new SecureFieldManager(encryptedBaseUrl, encryptionKey)
        .setSensitive(true)
        .toString(),
      metadata: secureMetadataManager,
    };
  }

  // Area-specific metadata configurations
  const areaSpecificMetaData: Record<
    string,
    Partial<UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>
  > = {
    dashboard: {
      createdBy: 'dashboard-module',
      childIds: [],
      area: 'dashboard',
    },
    profile: {
      createdBy: 'profile-module',
      updatedBy: 'user',
      updatedAt: new Date(),
      area: 'profile',
    },
    // Add more areas as needed
  };

  const areaMetaData = areaSpecificMetaData[area] || {};

  // Default metadata structure
  const defaultMeta: UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
    area: '',
    tags: [],
    id: 'default-id',
    schema: {},
    isActive: true,
    projectMetadata: undefined,
    videoMetadata: undefined,
    mediaMetadata: undefined,
    taskMetadata: undefined,
    meetingMetadata: undefined,
    metadataEntries: {},
    childIds: [],
    relatedData: [],
    currentMeta: {} as StructuredMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    structuredMetadata: {} as StructuredMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    latestVersion: createLatestVersion<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(),
    apiEndpoint: "https://default-api-endpoint.com",
    apiKey: undefined,
    timeout: 3000,
    retryAttempts: 3,
    name: "Default Metadata",
    description: "Default metadata description",
    category: "Default Category",
    timestamp: new Date(),
    createdBy: "system",
    metadata: {} as any,
    initialState: { state: "initialized", data: [] } as InitializedState<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    events: {} as EventManager<T, K>,
  };

  // Merge all layers: defaults → area-specific → sanitized data → encrypted fields → overrides
  const mergedMeta: UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
    ...defaultMeta,
    ...areaMetaData,
    ...sanitizedData,
    ...encryptedFields,
    ...overrides,
  };

  return mergedMeta;
};
