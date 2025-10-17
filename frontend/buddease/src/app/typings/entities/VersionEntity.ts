// VersionEntity.ts
import { Attachment } from '@/app/documents/attachment/Attachment';
import { BaseDataEntity, DefaultMeta, DefaultExcludedFields } from '@/config/BaseConfig';
import { VersionData, Version, VersionImpl } from "@/app/versions/Version";
import FrontendStructure from "@/config/appStructure/FrontendStructureComponent";
import { BackendStructure } from "@/server/database/BackendStructure";
import { HistoryEntry } from "@/app/state/stores/HistoryStore";
import { StructuredMetadata } from "@/config/StructuredMetadata";
import { UnifiedMetaDataOptions, UnifiedMetadata } from '@/config/MetaDataOptions';

/**
 * Core Version Entity representing the complete versioned structure
 * for frontend/backend synchronization, version metadata, and history tracking.
 */
export class VersionEntity<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> implements Version<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, VersionData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  
  /** Unique version ID or semantic version string */
  id: string;
  versionNumber: string | number;
  versionTag?: string;
  
  /** Reference to underlying data for this version */
  data: T | null;

  /** Optional metadata structure */
  metadata?: UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  meta?: StructuredMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;

  /** Backend and frontend paired version structures */
  backend?: BackendStructure<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  frontend?: FrontendStructure<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;

  /** Historical version trail */
  history?: HistoryEntry[];

  /** Optional parent and child version links for branching */
  parentVersionId?: string | null;
  childVersions?: string[];

  /** Indicates if this version is currently active */
  isActive: boolean;

  /** Timestamp info */
  createdAt: Date;
  updatedAt: Date;

  /** Optional versioned attachments */
  attachments?: AttachmentType[];

  /** Optional version state or context info */
  context?: Record<string, any>;

  constructor(
    id: string,
    versionNumber: number,
    data: T | null,
    backend?: BackendStructure,
    frontend?: FrontendStructure<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    metadata?: StructuredMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    meta?: UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    history?: HistoryEntry[],
  ) {
    this.id = id;
    this.versionNumber = versionNumber;
    this.data = data;
    this.backend = backend;
    this.frontend = frontend;
    this.metadata = metadata;
    this.history = history;

    this.isActive = true;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  /** Get a full clone of this version */
  clone(): VersionEntity<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
    return new VersionEntity(
      this.id,
      this.versionNumber,
      this.data ? { ...this.data } : null,
      this.backend,
      this.frontend,
      this.metadata,
      this.history ? [...this.history] : [],
    );
  }

  /** Update metadata or associated context */
  updateMetadata(meta: Partial<Meta>): void {
    if (this.metadata) {
      Object.assign(this.metadata, meta);
      this.updatedAt = new Date();
    }
  }

  /** Deactivate this version */
  deactivate(): void {
    this.isActive = false;
    this.updatedAt = new Date();
  }

  /** Reactivate this version */
  activate(): void {
    this.isActive = true;
    this.updatedAt = new Date();
  }
}
// 🔍 Breakdown
// Section	Purpose
// Implements both Version<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> and VersionData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>	Ensures VersionEntity is fully compatible with all version-handling systems (data, UI, and backend).
// backend / frontend	Mirror the structure defined in your Versions interface and FrontendStructure class.
// metadata	Type-safe support for StructuredMetadata—keeps alignment with your ProjectMetadata and snapshot architecture.
// clone, updateMetadata, activate, deactivate methods	Provide common utilities for version lifecycle management.
// history	Keeps version trail consistent with the Versions interface.

// Would you like me to also include a corresponding createVersionEntity() factory function (similar to createLatestVersion<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>())// to generate a new version with defaults for easier integration?