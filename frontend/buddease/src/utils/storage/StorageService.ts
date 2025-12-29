
import { ArchiveMetadata } from '@/core/api/service/ArchiveService';
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import { Attachment } from '@/core/documents/attachment/Attachment';
import type { Snapshot } from '@/core/snapshots/Snapshot';

class StorageService {
  private storage: Storage;

  constructor(storage: Storage = localStorage) {
    this.storage = storage;
  }

  // Basic storage operations
  async get(key: string): Promise<any> {
    try {
      const item = this.storage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Storage get error:', error);
      return null;
    }
  }

  async set(key: string, value: any): Promise<void> {
    try {
      this.storage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Storage set error:', error);
      throw error;
    }
  }

  async delete(key: string): Promise<void> {
    try {
      this.storage.removeItem(key);
    } catch (error) {
      console.error('Storage delete error:', error);
      throw error;
    }
  }

  async clear(): Promise<void> {
    try {
      this.storage.clear();
    } catch (error) {
      console.error('Storage clear error:', error);
      throw error;
    }
  }

  // Snapshot-specific methods
  async storeSnapshot<
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(
    key: string,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): Promise<void> {
    await this.set(`snapshots/${key}`, snapshot);
  }

  async getSnapshot<
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(
    key: string
  ): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null> {
    return await this.get(`snapshots/${key}`);
  }

  async archiveSnapshot<
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    metadata: ArchiveMetadata
  ): Promise<void> {
    const archiveKey = `archives/${metadata.id}`;
    await this.set(archiveKey, { snapshot, metadata });
    await this.updateArchiveIndex(metadata);
  }

  private async updateArchiveIndex(metadata: ArchiveMetadata): Promise<void> {
    const index = (await this.get('archive-index')) || [];
    index.push(metadata);
    await this.set('archive-index', index);
  }
}


export default StorageService