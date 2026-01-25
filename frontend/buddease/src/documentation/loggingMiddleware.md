# Logging Middleware

**File:** `loggingMiddleware.ts`

## Overview

The **Logging Middleware** is a type-safe middleware for the snapshot/middleware pipeline. Its responsibilities include:

* Logging the start and end of operations.
* Measuring operation duration for performance monitoring.
* Capturing and logging errors without disrupting pipeline flow.
* Using async fire-and-forget logging to avoid slowing down execution.

It leverages the `Logger` class and types `MiddlewareContext` and `MiddlewareNext` from the typed snapshot/middleware system.

---

## Generic Type Parameters

* `T extends BaseDataEntity = BaseDataEntity`  
* `K extends T = T`  
* `Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>`  
* `AttachmentType extends Attachment = Attachment`  
* `ExcludedFields extends keyof T = never`  
* `IncludedFields extends keyof T = keyof T`  

These allow type-safe access to store snapshots, notifications, tasks, etc.

---

## Props / Parameters

### `context: MiddlewareContext<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>`

* `operation: string` – Name of the operation being executed.
* `payload: any` – The data associated with the operation.
* `store: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null` – Reference to the store.
* `timestamp: Date` – Operation timestamp.
* `plugins: string[]` – Plugins involved in the operation.
* `metadata?: Record<string, any>` – Optional metadata.
* `userId?: string` – Optional user identifier.
* `state?: any` – Optional state reference.

### `next: MiddlewareNext`

* Function to call the next middleware in the pipeline.

---

## Example Usage

```ts
import { loggingMiddleware } from '@/core/middleware/loggingMiddleware';
import { middlewarePipeline } from '@/core/middleware/pipeline';

middlewarePipeline.use(loggingMiddleware);
