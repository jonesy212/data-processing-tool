import { Attachment } from '@/app/documents/attachment/Attachment';
import SnapshotStore from '@/app/snapshots/SnapshotStore';
import { BaseDataEntity, DefaultMeta } from '@/app/config/BaseConfig';

export interface MiddlewareContext<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = never,
  IncludedFields extends keyof T = keyof T
> {
  operation: string;
  payload: any;
  store: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;
  timestamp: Date;
  plugins: string[];
  state?: any;
  metadata?: Record<string, any>;
  userId?: string;
}

export type MiddlewareNext<T = any> = (
  context: MiddlewareContext<any, any, any, any, any, any>
) => Promise<T>;

export type MiddlewareFunction = (
  context: MiddlewareContext<any, any, any, any, any, any>,
  next: MiddlewareNext
) => Promise<any>;

export interface MiddlewareConfig {
  name: string;
  priority?: number;
  enabled?: boolean;
  config?: Record<string, any>;
}

export interface MiddlewarePipeline {
  execute: <T>(operation: string, payload: any) => Promise<T>;
  use: (middleware: MiddlewareFunction) => void;
  remove: (middlewareName: string) => void;
  getMiddlewares: () => MiddlewareFunction[];
}