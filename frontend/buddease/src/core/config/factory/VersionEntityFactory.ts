// VersionEntityFactory.ts
import type { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import type { Attachment } from '@/core/documents/attachment/Attachment';
import type { VersionEntityDataInterface } from '@/core/typings/entities/VersionEntity';
import { createDefaultVersionData } from '@/core/typings/entities/VersionEntity';
    VersionEntityDataInterface,
    createDefaultVersionData
} from '@/core/typings/entities/VersionEntity';

// Option 1: Use specific types (Recommended)
export function createVersionEntity(
  overrides?: Partial<VersionEntityDataInterface> & {
    versionNumber?: string | number;
    versionTag?: string;
    parentVersionId?: string | null;
    childVersions?: string[];
    context?: Record<string, any>;
  }
): VersionEntityDataInterface {
  return createDefaultVersionData({
    versionNumber: "1.0.0",
    versionTag: "initial",
    parentVersionId: null,
    childVersions: [],
    context: {},
    isActive: true,
    ...overrides
  });
}

// Option 2: Generic version (if you still need it)
export function createGenericVersionEntity<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  overrides?: Partial<VersionEntityDataInterface<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> & {
    versionNumber?: string | number;
    versionTag?: string;
    parentVersionId?: string | null;
    childVersions?: string[];
    context?: Record<string, any>;
  }
): VersionEntityDataInterface<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  const now = new Date();
  
  return {
    id: `version-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: now,
    updatedAt: now,
    isActive: true,
    versionNumber: "1.0.0",
    versionTag: "initial",
    data: null,
    parentVersionId: null,
    childVersions: [],
    context: {},
    name: '',
    description: '',
    category: '',
    tags: [],
    version: '',
    createdBy: '',
    metadata: undefined,
    backend: undefined,
    frontend: undefined,
    history: [],
    attachments: [],
    
    // Method implementations
    clone: function(): any {
      return { ...this };
    },
    updateMetadata: function(meta: Partial<any>): void {
      if (this.metadata) {
        Object.assign(this.metadata, meta);
        this.updatedAt = new Date();
      }
    },
    deactivate: function(): void {
      this.isActive = false;
      this.updatedAt = new Date();
    },
    activate: function(): void {
      this.isActive = true;
      this.updatedAt = new Date();
    },
    
    ...overrides
  } as VersionEntityDataInterface<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
}

// Option 3: Create specific AppVersion factory
export function createAppVersion(
  overrides?: Partial<VersionEntityDataInterface>
): VersionEntityDataInterface {
  return createVersionEntity(overrides);
}