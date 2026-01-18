// types.ts
import type { BaseDataEntity, DefaultMeta } from '@/core/config/BaseConfig';
import type { Attachment } from '@/core/documents/attachment/Attachment';
import SnapshotStore from '@/core/snapshots/SnapshotStore';

/**
 * MiddlewareContext
 * 
 * Generic context object passed to middleware functions.
 * Provides access to:
 * - `operation`: name of the operation being executed
 * - `payload`: data associated with the operation
 * - `store`: optional SnapshotStore for the operation
 * - `timestamp`: when the operation started
 * - `plugins`: optional plugin identifiers
 * - `state`: optional mutable state for middleware
 * - `metadata`: additional metadata
 * - `userId`: optional user identifier
 */
export interface MiddlewareContext<
  T extends BaseDataEntity = BaseDataEntity,
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

/**
 * MiddlewareNext
 * 
 * The "next" function in a middleware chain.
 * Receives the current context and returns a Promise of any type.
 */
export type MiddlewareNext<T = any> = (
  context: MiddlewareContext<any, any, any, any, any, any>
) => Promise<T>;

/**
 * MiddlewareFunction
 * 
 * Defines a middleware function that can intercept, modify, or react
 * to operations before passing control to the next middleware.
 */
export type MiddlewareFunction = (
  context: MiddlewareContext<any, any, any, any, any, any>,
  next: MiddlewareNext
) => Promise<any>;

/**
 * MiddlewareConfig
 * 
 * Optional configuration for middleware registration and execution.
 */
export interface MiddlewareConfig {
  name: string;
  priority?: number;
  enabled?: boolean;
  config?: Record<string, any>;
}

/**
 * MiddlewarePipeline
 * 
 * Standard interface for managing a chain of middleware functions.
 * - `execute`: run all middlewares for a given operation and payload
 * - `use`: register a new middleware
 * - `remove`: unregister a middleware by name
 * - `getMiddlewares`: return current middleware list
 */
export interface MiddlewarePipeline {
  execute: <T = any>(operation: string, payload: any) => Promise<T>;
  use: (middleware: MiddlewareFunction) => void;
  remove: (middlewareName: string) => void;
  getMiddlewares: () => MiddlewareFunction[];
}
