<!-- persistenceMiddleware.md -->

---

## **File:** `persistenceMiddleware.md`

```markdown
# Persistence Middleware

**File:** `persistenceMiddleware.ts`

## Overview

The **Persistence Middleware** is responsible for:

* Handling snapshot persistence in `SnapshotStore`.
* Pre-processing operations with persistence metadata.
* Post-processing operations by saving data to the persistence layer.
* Logging all persistence operations asynchronously to avoid slowing down execution.
* Skipping persistence if it is disabled in the store configuration.

---

## Generic Type Parameters

* `T extends BaseDataEntity = BaseDataEntity`  
* `K extends T = T`  
* `Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>`  
* `AttachmentType extends Attachment = Attachment`  
* `ExcludedFields extends keyof T = never`  
* `IncludedFields extends keyof T = keyof T`  

---

## Props / Parameters

### `context: MiddlewareContext<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>`

* `operation: string` – Name of the operation (e.g., "addSnapshot").
* `payload: any` – Data payload for the operation.
* `store: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null` – Reference to the store.
* `metadata?: Record<string, any>` – Optional operation metadata.
* `userId?: string` – Optional user ID.

### `next: MiddlewareNext`

* Function to call the next middleware in the pipeline.

---

## Features

### Pre-Persistence

* Adds metadata if the store has `persistence.strategy === 'autoSave'` and operation is `addSnapshot`.
* Ensures the operation includes `persistenceLayer` and `autoSave` flags.

### Post-Persistence

* Calls `store.getDataStore()` and invokes `persist()` on the returned data store if it exists.
* Ensures snapshots and related operations are saved automatically.

### Logging

* Fire-and-forget async logging using `Logger.logWithPayload`.
* Logs start, completion, and errors.
* Captures `payload` and `result` for debugging.

---

## Example Usage

```ts
import { persistenceMiddleware } from '@/app/middleware/persistenceMiddleware';
import { middlewarePipeline } from '@/app/middleware/pipeline';

middlewarePipeline.use(persistenceMiddleware);

Notes

Skips persistence if store is null or store.options.persistence.enabled is false.

Errors in persistence logging do not block the operation.

Fully compatible with typed SnapshotStore and generic data structures.

Ensures operations are asynchronous and non-blocking.