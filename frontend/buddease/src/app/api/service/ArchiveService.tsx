// ArchiveService.tsx
import { FileMetadata } from '@/app/components/models/file/FileManager';
import { BaseDataEntity, BaseDataRoot, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { LocalStorageAdapter, PersistenceLayer } from '@/app/dataIntegration/persistenceLayer';
import { Attachment } from '@/app/documents/attachment/Attachment';
import { NotificationType } from '@/app/features/support/UnifiedNotificationTypes';
import { CloudStorageProvider } from "@/app/interfaces/provider/CloudStorageProvider";
import { fetchUserAreaDimensions } from '@/app/pages/layouts/fetchUserAreaDimensions';
import authService from '@/app/server/auth/AuthService'; // Your client-side AuthService
import { Snapshot } from '@/app/snapshots/Snapshot';
import { sendNotification } from "@/app/state/redux/slices/UserSlice";
import StorageService from '@/utils/storage/StoragService';

const area = `${fetchUserAreaDimensions().width}x${fetchUserAreaDimensions().height}`;

// Archive types
export interface ArchiveMetadata {
  id: string | number;
  originalId: string;
  archivedAt: Date;
  archivedBy: string;
  compressionType: 'gzip' | 'none';
  checksum: string;
  size: number;
  originalSize: number;
  compressionRatio: number;
  tags: string[];
  description?: string;
}

export interface ArchivedSnapshot<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  metadata: ArchiveMetadata;
  snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;  
  versionInfo: {
    major: number;
    minor: number;
    patch: number;
    versionNumber: string;
  };
}

// Archive configuration
interface ArchiveConfig {
  compressionEnabled: boolean;
  compressionType: 'gzip' | 'none';
  storageLocation: 'local' | 'cloud' | 'both';
  retentionPeriod: number; // days
  maxArchiveSize: number; // MB
  encryptionEnabled: boolean;
}

const defaultConfig: ArchiveConfig = {
  compressionEnabled: true,
  compressionType: 'gzip',
  storageLocation: 'local',
  retentionPeriod: 365, // 1 year
  maxArchiveSize: 1024, // 1GB
  encryptionEnabled: false
};


const getVersionNumber = <
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = never,
    IncludedFields extends keyof T = keyof T
  >(
  version: string | Version<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined
): string => {
  if (typeof version === 'string') {
    return version;
  }
  
  if (version?.versionNumber !== undefined) {
    return String(version.versionNumber);
  }
  
  // If no version number, create one from major.minor.patch
  return `${version?.major ?? 0}.${version?.minor ?? 0}.${version?.patch ?? 0}`;
};


// Archive service class (optional, for more complex scenarios)
class ArchiveService {
  private config: ArchiveConfig;
  private persistenceLayer: PersistenceLayer<BaseDataRoot>; // Or use proper generic types
  private storage: StorageService;
  private cloudProvider: CloudStorageProvider | null = null;
  private auth: typeof authService;
  constructor(config: Partial<ArchiveConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
    
    // Initialize local persistence
    const adapter = new LocalStorageAdapter('archives');
    this.persistenceLayer = new PersistenceLayer(adapter);
    this.persistenceLayer.initialize();
    this.auth = authService; 
    this.storage = storage;
    // Initialize cloud provider if cloud storage is enabled
    if (this.config.storageLocation === 'cloud' || this.config.storageLocation === 'both') {
      this.cloudProvider = new CloudStorageProvider(
        'ArchiveCloud', // provider name
        10240, // 10GB storage limit (adjust as needed)
        0 // initial used storage
      );
    }
  }

  
  private async storeArchivedSnapshot<
    T extends BaseDataEntity = BaseDataRoot,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T 
  >(
    archivedSnapshot: ArchivedSnapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>  
  ): Promise<void> {
    const storageKey = `archive-${archivedSnapshot.metadata.id}.json`;

    // Store locally using PersistenceLayer
    if (this.config.storageLocation === 'local' || this.config.storageLocation === 'both') {
      await this.storeInLocal(storageKey, archivedSnapshot);
    }

    // Store in cloud (if enabled)
    if (this.config.storageLocation === 'cloud' || this.config.storageLocation === 'both') {
      await this.storeInCloud(storageKey, archivedSnapshot);
    }

    // Update archive index
    await this.updateArchiveIndex(archivedSnapshot);
  }

  private async storeInLocal(storageKey: string, data: any): Promise<void> {
    // Convert data to a format PersistenceLayer can save
    const snapshotData = {
      id: storageKey,
      data: data,
      timestamp: new Date(),
      metadata: {
        type: 'archive',
        archivedAt: data.metadata.archivedAt
      }
    };
    
    await this.persistenceLayer.saveSnapshot(snapshotData as any);
  }

  private async storeInCloud(storageKey: string, data: any): Promise<void> {
    if (!this.cloudProvider) {
      throw new Error('Cloud storage provider not initialized');
    }
    
    try {
      // Convert data to string for cloud storage
      const dataString = JSON.stringify(data);
      const dataSize = new Blob([dataString]).size / (1024 * 1024); // Convert to MB
      
      // Create file metadata
      const fileMetadata: FileMetadata = {
        fileName: storageKey,
        fileSize: dataSize,
        fileType: 'application/json',
        uploadDate: new Date(),
        lastModified: new Date(),
        checksum: this.calculateChecksum(dataString),
        // Add any other metadata you need
      };
      
      // Add to cloud provider's file list
      this.cloudProvider.files.push(fileMetadata);
      
      // Upload to cloud (simulated)
      this.cloudProvider.uploadFile(storageKey, dataSize);
      
      console.log(`Successfully stored ${storageKey} in cloud storage`);
      
    } catch (error) {
      console.error('Failed to store in cloud:', error);
      throw error;
    }
  }



  private calculateChecksum(data: string): string {
    // Simple checksum implementation
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  }

  // Add method to retrieve from cloud
  private async retrieveFromCloud(storageKey: string): Promise<any> {
    if (!this.cloudProvider) {
      throw new Error('Cloud storage provider not initialized');
    }
    
    try {
      // Find the file metadata
      const file = this.cloudProvider.files.find(f => f.fileName === storageKey);
      if (!file) {
        throw new Error(`File ${storageKey} not found in cloud storage`);
      }
      
      // Simulate download
      this.cloudProvider.downloadFile(storageKey);
      
      // In a real implementation, you would fetch the actual file data
      // For now, return a placeholder
      console.log(`Retrieved ${storageKey} from cloud storage`);
      
      return { success: true, fileName: storageKey };
      
    } catch (error) {
      console.error('Failed to retrieve from cloud:', error);
      throw error;
    }
  }

  // Add method to sync between local and cloud
  async syncWithCloud(): Promise<void> {
    if (!this.cloudProvider) {
      console.log('Cloud storage not enabled');
      return;
    }
    
    try {
      // Get all local archive keys
      const localKeys = await this.persistenceLayer.getAllSnapshotIds();
      const cloudKeys = this.cloudProvider.files.map(f => f.fileName);
      
      // Find archives that exist locally but not in cloud
      const archivesToUpload = localKeys.filter(key => !cloudKeys.includes(key));
      
      // Upload missing archives to cloud
      for (const key of archivesToUpload) {
        const localData = await this.persistenceLayer.loadSnapshot(key);
        if (localData) {
          await this.storeInCloud(key, localData);
        }
      }
      
      console.log(`Sync complete. Uploaded ${archivesToUpload.length} archives to cloud.`);
      
    } catch (error) {
      console.error('Sync failed:', error);
    }
  }

  // Add cloud storage status method
  getCloudStorageStatus(): {
    providerName: string;
    storageLimit: number;
    usedStorage: number;
    availableStorage: number;
    isFull: boolean;
    fileCount: number;
  } | null {
    if (!this.cloudProvider) return null;
    
    return {
      providerName: this.cloudProvider.providerName,
      storageLimit: this.cloudProvider.storageLimit,
      usedStorage: this.cloudProvider.usedStorage,
      availableStorage: this.cloudProvider.storageLimit - this.cloudProvider.usedStorage,
      isFull: this.cloudProvider.isStorageFull(),
      fileCount: this.cloudProvider.files.length
    };
  }

  async archiveSnapshot<
    T extends BaseDataEntity = BaseDataRoot,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    options?: {
      tags?: string[];
      description?: string;
      compression?: boolean;
    }
  ): Promise<ArchiveMetadata> {
    try {
      // 1. Validate snapshot for archiving
      if (!this.validateSnapshotForArchiving(snapshot)) {
        throw new Error('Snapshot is not suitable for archiving');
      }

      // 2. Prepare archive metadata
      const archiveId = generateArchiveId();
      const archivedAt = new Date();
      const archivedBy = this.getCurrentUser(); // Implement user context

      // 3. Process snapshot data (compress if enabled)
      const processedData = await this.processSnapshotData(snapshot, options);

      // 4. Create archive record

      const originalId = snapshot.id ? snapshot.id.toString() : 'unknown-id';
      const archivedSnapshot: ArchivedSnapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
        metadata: {
          id: archiveId,
          originalId,
          archivedAt,
          archivedBy,
          compressionType: this.config.compressionEnabled ? this.config.compressionType : 'none',
          checksum: processedData.checksum,
          size: processedData.size,
          originalSize: processedData.originalSize,
          compressionRatio: processedData.compressionRatio,
          tags: options?.tags || ['auto-archive'],
          description: options?.description
        },
        snapshot: processedData.data,
        versionInfo: {
          major: typeof snapshot.version === 'string' ? 0 : snapshot.version?.major ?? 0,
          minor: typeof snapshot.version === 'string' ? 0 : snapshot.version?.minor ?? 0,
          patch: typeof snapshot.version === 'string' ? 0 : snapshot.version?.patch ?? 0,
          versionNumber:getVersionNumber(snapshot.version)
        }
      };

      // 5. Store the archived snapshot
      await this.storeArchivedSnapshot(archivedSnapshot);

      if (!snapshot.id) {
        throw new Error("Cannot update archive status — snapshot is missing an ID");
      }

      // 6. Update snapshot metadata to mark as archived
      await this.updateSnapshotArchiveStatus(snapshot.id, archiveId);

      // 7. Send notification
      this.sendArchiveNotification(archivedSnapshot);

      // 8. Clean up old archives if needed
      await this.cleanupOldArchives();

      return archivedSnapshot.metadata;

    } catch (error: unknown) {
    
      console.error('Failed to archive snapshot:', error);
      if (error instanceof Error) {
        throw new Error(`Archive failed: ${error.message}`);
      } else {
        throw new Error('Archive failed: Unknown error occurred');
      }
    }
  }

  private validateSnapshotForArchiving<
    T extends BaseDataEntity = BaseDataRoot,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): boolean {
    // Check if snapshot is already archived
    if (snapshot.metadata?.isArchived) {
      return false;
    }

    // Check if snapshot has valid data
    if (!snapshot.id || !snapshot.timestamp) {
      return false;
    }

    // Check if snapshot is too old (optional)
    const snapshotAge = Date.now() - new Date(snapshot.timestamp).getTime();
    const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
    if (snapshotAge > maxAge) {
      return false;
    }

    return true;
  }

  private async processSnapshotData<
    T extends BaseDataEntity = BaseDataRoot,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    options?: { compression?: boolean }
  ): Promise<{
    data: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
    checksum: string;
    size: number;
    originalSize: number;
    compressionRatio: number;
  }> {
    const shouldCompress = options?.compression ?? this.config.compressionEnabled;
    const snapshotString = JSON.stringify(snapshot);
    const originalSize = new Blob([snapshotString]).size;

    let processedData = snapshot;
    let finalSize = originalSize;
    let compressionRatio = 1;

    if (shouldCompress) {
      const compressed = await compressData(snapshotString, this.config.compressionType);
      
      // Get existing metadata or create default
      const existingMetadata = snapshot.metadata || {
        area: 'unknown',
        isCompressed: false,
        compressionType: 'none' as const,
        metadataEntries: {},
      };
      
      processedData = {
        ...snapshot,
        data: compressed,
        metadata: {
          ...existingMetadata,
          area: area,
          isCompressed: true,
          compressionType: this.config.compressionType
        }
      };
      
      finalSize = new Blob([compressed]).size;
      compressionRatio = originalSize / finalSize;
    }
    
    // Calculate checksum AFTER processing
    const checksum = await this.calculateChecksum(processedData); // You need to implement this
    
    return {
      data: processedData,
      checksum, // Now it's defined
      size: finalSize,
      originalSize,
      compressionRatio
    };
  }

  // Add this method to your class
  private async calculateChecksum<T extends BaseDataEntity>(
    data: Snapshot<T, any, any, any, any, any>
  ): Promise<string> {
    const dataString = JSON.stringify(data);
    // Use a proper checksum algorithm (e.g., SHA-256)
    // For now, here's a simple implementation
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(dataString);
    
    // Simple hash function (you might want to use a proper crypto library)
    let hash = 0;
    for (let i = 0; i < dataBuffer.length; i++) {
      const char = dataBuffer[i];
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
    return Math.abs(hash).toString(16);
  }

  private async updateArchiveIndex<
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T 
>(archivedSnapshot:  ArchivedSnapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): Promise<void> {
    const index = await this.storage.get('archive-index') || [];
    index.push({
      id: archivedSnapshot.metadata.id,
      originalId: archivedSnapshot.snapshot.id,
      archivedAt: archivedSnapshot.metadata.archivedAt,
      tags: archivedSnapshot.metadata.tags,
      size: archivedSnapshot.metadata.size
    });
    await this.storage.set('archive-index', index);
  }

  private async updateSnapshotArchiveStatus(snapshotId: string | number, archiveId: string): Promise<void> {
    // Update the original snapshot to mark it as archived
    // This would typically involve a database update or similar
    console.log(`Snapshot ${snapshotId} archived as ${archiveId}`);
  }


  private sendArchiveNotification<
    T extends BaseDataEntity = BaseDataRoot,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T 
  >(
    archivedSnapshot: ArchivedSnapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): void {
    sendNotification({
      id: `archive-${archivedSnapshot.metadata.id}`,
      message: 'Snapshot Archived Successfully',
      content: {
        archiveId: archivedSnapshot.metadata.id,
        originalId: archivedSnapshot.snapshot.id,
        size: archivedSnapshot.metadata.size,
        compressionRatio: archivedSnapshot.metadata.compressionRatio.toFixed(2),
        archivedAt: archivedSnapshot.metadata.archivedAt
      },
      date: new Date(),
      type: 'success' as NotificationType
    });
  }

  private async cleanupOldArchives(): Promise<void> {
    const index = await this.storage.get('archive-index') || [];
    const cutoffDate = new Date(Date.now() - this.config.retentionPeriod * 24 * 60 * 60 * 1000);

    const oldArchives = index.filter((item: any) => 
      new Date(item.archivedAt) < cutoffDate
    );

    for (const archive of oldArchives) {
      await this.storage.delete(`archives/${archive.id}.json`);
    }

    // Update index
    const newIndex = index.filter((item: any) => 
      new Date(item.archivedAt) >= cutoffDate
    );
    await this.storage.set('archive-index', newIndex);
  }

  // In ArchiveService.ts
  private getCurrentUser(): string {
    // Check if auth service exists and user is authenticated
    if (this.auth && this.auth.isAuthenticated && this.auth.isAuthenticated()) {
      const token = this.auth.getAccessToken();
      if (token) {
        try {
          // Decode JWT token
          const payload = JSON.parse(atob(token.split('.')[1]));
          
          // Return the best identifier
          if (payload.sub) return payload.sub; // JWT standard "subject"
          if (payload.id) return String(payload.id);
          if (payload.email) return payload.email;
          if (payload.username) return payload.username;
          if (payload.name) return payload.name;
          
          // If we have the token but no clear identifier
          return 'authenticated-user';
        } catch (error) {
          console.warn('Could not decode token:', error);
        }
      }
    }
    
    // No auth context available
    return 'system';
  }
}

// Standalone function version
export const archiveSnapshot = async <
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  options?: {
    tags?: string[];
    description?: string;
    compression?: boolean;
    config?: Partial<ArchiveConfig>;
  }
): Promise<ArchiveMetadata> => {
  const archiveService = new ArchiveService(options?.config);
  return archiveService.archiveSnapshot(snapshot, options);
};

// Utility functions (implement these in archive-utils.ts)
const generateArchiveId = (): string => {
  return `arc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// #note update 
const compressData = async (data: string, type: 'gzip' | 'none' = 'gzip'): Promise<string> => {
  if (type === 'none') return data;
  
  // Simple compression example (use a proper compression library in real implementation)
  try {
    // This is a placeholder - use a real compression library like pako
    const compressed = btoa(encodeURIComponent(data)); // Simple base64 encoding
    return compressed;
  } catch (error) {
    console.warn('Compression failed, storing uncompressed:', error);
    return data;
  }
};

const calculateChecksum = (data: string): string => {
  // Simple checksum implementation
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString(36);
};



export {
  calculateChecksum, compressData, generateArchiveId
};

