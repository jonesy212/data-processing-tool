import { NotificationType } from '@/app/context/NotificationContext';
import { Snapshot } from '@/app/snapshots/Snapshot';
import { notify } from '@/app/utils/snapshotUtils';
import { BaseDataEntity, BaseDataRoot, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import StorageService from '@/app/utils/storage/StoragService';
import { Attachment } from "@/app/documents/attachment/Attachment";

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

// Archive service class (optional, for more complex scenarios)
class ArchiveService {
  private config: ArchiveConfig;
  private storage: StorageService;

  constructor(config: Partial<ArchiveConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
    this.storage = new StorageService();
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
          major: snapshot.version?.major ?? 0,
          minor: snapshot.version?.minor ?? 0,
          patch: snapshot.version?.patch ?? 0,
          versionNumber: snapshot.version?.versionNumber ?? 1,
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
    // ✅ Fix 3: Properly handle `unknown` error
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
      // Compress the snapshot data
      const compressed = await compressData(snapshotString, this.config.compressionType);
      processedData = {
        ...snapshot,
        data: compressed, // Store compressed data
        metadata: {
          ...snapshot.metadata,
          isCompressed: true,
          compressionType: this.config.compressionType
        }
      };
      finalSize = new Blob([compressed]).size;
      compressionRatio = originalSize / finalSize;
    }

    const checksum = calculateChecksum(JSON.stringify(processedData));

    return {
      data: processedData,
      checksum,
      size: finalSize,
      originalSize,
      compressionRatio
    };
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
    const storageKey = `archives/${archivedSnapshot.metadata.id}.json`;

    // Store in selected locations
    if (this.config.storageLocation === 'local' || this.config.storageLocation === 'both') {
      await this.storage.storeLocal(storageKey, archivedSnapshot);
    }

    if (this.config.storageLocation === 'cloud' || this.config.storageLocation === 'both') {
      await this.storage.storeCloud(storageKey, archivedSnapshot);
    }

    // Update archive index
    await this.updateArchiveIndex(archivedSnapshot);
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
    notify({
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

  private getCurrentUser(): string {
    // Implement your user context retrieval
    return 'system'; // or get from authentication context
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

