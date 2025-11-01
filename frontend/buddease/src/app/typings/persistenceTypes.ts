// persistenceTypes.ts
import { Attachment } from '@/app/documents/attachment/Attachment';
import { Snapshot } from '@/app/snapshots/snapshotTypes';
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';

// Core Persistence Interfaces
export interface PersistenceAdapter {
  initialize(): Promise<void>;
  save<T>(key: string, data: T): Promise<void>;
  load<T>(key: string): Promise<T | null>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
  getAllKeys(): Promise<string[]>;
}

export interface PersistenceConfig {
  strategy: 'localStorage' | 'indexedDB' | 'memory' | 'custom';
  namespace?: string;
  encryption?: boolean;
  compression?: boolean;
  maxSize?: number;
  version?: string;
}

export interface CacheProxyConfig {
  maxAge: number;
  strategy: 'lazy' | 'eager';
  maxSize?: number;
}

export interface StorageStats {
  totalSize: number;
  itemCount: number;
  namespace: string;
  lastBackup?: Date;
}

// Error Types
export interface PersistenceError {
  code: 'STORAGE_FULL' | 'ENCRYPTION_FAILED' | 'SERIALIZATION_ERROR' | 'NETWORK_ERROR';
  message: string;
  originalError?: Error;
  recoverable: boolean;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  accessCount: number;
  size: number;
}

// Migration Types
export interface DataMigration {
  fromVersion: string;
  toVersion: string;
  migrate: (data: any) => any;
}

export interface MigrationPlan {
  currentVersion: string;
  targetVersion: string;
  migrations: DataMigration[];
}

// Backup & Recovery Types
export interface BackupMetadata {
  id: string;
  timestamp: Date;
  size: number;
  itemCount: number;
  version: string;
}

export interface RecoveryOptions {
  includeMetadata?: boolean;
  validateIntegrity?: boolean;
  batchSize?: number;
}

// Generic type helpers for persistence
export type PersistableSnapshot<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> = Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> & {
  _persistedAt?: Date;
  _version?: string;
  _checksum?: string;
};

export type StorageKey = `snapshot:${string}` | `config:${string}` | `cache:${string}`;

// Event Types for Persistence Layer
export interface PersistenceEvent {
  type: 'SAVE' | 'LOAD' | 'DELETE' | 'CLEAR' | 'MIGRATION' | 'ERROR';
  key?: string;
  timestamp: Date;
  success: boolean;
  duration?: number;
  error?: PersistenceError;
}

export interface PersistenceEventHandler {
  (event: PersistenceEvent): void;
}

// Configuration Types
export interface PersistenceLayerConfig {
  adapter: PersistenceAdapter;
  cache: CacheProxyConfig;
  migration?: MigrationPlan;
  backup?: {
    enabled: boolean;
    interval: number;
    maxBackups: number;
  };
  events?: {
    onEvent?: PersistenceEventHandler;
  };
}

// Export all types
export type { };
