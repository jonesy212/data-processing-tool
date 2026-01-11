# Interface Import Fixes Preview

**Generated:** 2026-01-10T04:46:31.270Z
**Total fixes found:** 13
**Interface files analyzed:** 10 of 880

> **Note:** This is a preview only. No changes have been made.

## AppActionTypes
**Source file:** `src/core/actions/AppActionTypes.ts`

### SnapshotForActions
**Imports to fix:** 1

| Import File | Line | Original | Fixed |
|-------------|------|----------|-------|
| `src/core/actions/DataActions.ts` | 3 | `import { SnapshotForActions } from '@/core/actions/AppActionTypes';` | `import type { SnapshotForActions } from '@/core/actions/AppActionTypes';` |

## CommunicationActions
**Source file:** `src/core/actions/CommunicationActions.tsx`

### CommunicationActionTypes
**Imports to fix:** 1

| Import File | Line | Original | Fixed |
|-------------|------|----------|-------|
| `src/core/state/stores/DetailsListStore.ts` | 23 | `import { CommunicationActionTypes } from "@/core/actions/CommunicationActions";` | `import type { CommunicationActionTypes } from "@/core/actions/CommunicationActions";` |

## SnapshotActions
**Source file:** `src/core/actions/SnapshotActions.tsx`

### SnapshotOperation
**Imports to fix:** 5

| Import File | Line | Original | Fixed |
|-------------|------|----------|-------|
| `src/core/snapshots/SnapshotStoreProps.ts` | 2 | `import { SnapshotOperation, SnapshotOperationType } from "@/core/actions/SnapshotActions";` | `import type { SnapshotOperation, SnapshotOperationType } from "@/core/actions/SnapshotActions";` |
| `src/core/snapshots/SnapshotStoreConfigComponent.tsx` | 2 | `import { SnapshotOperation, SnapshotOperationType } from "@/core/actions/SnapshotActions";` | `import type { SnapshotOperation, SnapshotOperationType } from "@/core/actions/SnapshotActions";` |
| `src/core/snapshots/newStoreUtils.ts` | 2 | `import { SnapshotOperation, SnapshotOperationType } from "@/core/actions/SnapshotActions";` | `import type { SnapshotOperation, SnapshotOperationType } from "@/core/actions/SnapshotActions";` |
| `src/core/snapshots/SnapshotStore.tsx` | 63 | `import { SnapshotOperation } from '@/core/actions/SnapshotActions';` | `import type { SnapshotOperation } from '@/core/actions/SnapshotActions';` |
| `src/core/snapshots/convertSnapshotStoreToStorage.ts` | 2 | `import { SnapshotOperation } from '@/core/actions/SnapshotActions';` | `import type { SnapshotOperation } from '@/core/actions/SnapshotActions';` |

### SnapshotStoreActions
**Imports to fix:** 1

| Import File | Line | Original | Fixed |
|-------------|------|----------|-------|
| `src/core/snapshots/handleSnapshotOperation.ts` | 2 | `import SnapshotStoreActions from '@/core/actions/SnapshotActions';` | `import type SnapshotStoreActions from '@/core/actions/SnapshotActions';` |

## SubscriptionActions
**Source file:** `src/core/actions/SubscriptionActions.ts`

### SubscriptionPayload
**Imports to fix:** 4

| Import File | Line | Original | Fixed |
|-------------|------|----------|-------|
| `src/core/snapshots/convertSubscriptionPayloadToSubscriber.ts` | 2 | `import { SubscriptionPayload } from "@/core/actions/SubscriptionActions";` | `import type { SubscriptionPayload } from "@/core/actions/SubscriptionActions";` |
| `src/core/typings/entities/SubscriptionEntity.ts` | 2 | `import { SubscriptionPayload } from '@/core/actions/SubscriptionActions';` | `import type { SubscriptionPayload } from '@/core/actions/SubscriptionActions';` |
| `src/core/server/database/payloads/projectSubscriptionPayload.ts` | 2 | `import { createSubscriptionPayload } from "@/core/actions/SubscriptionActions";` | `import type { createSubscriptionPayload } from "@/core/actions/SubscriptionActions";` |
| `src/core/hooks/useSubscription.tsx` | 2 | `import { SubscriptionActions, SubscriptionPayload } from "@/core/actions/SubscriptionActions";` | `import type { SubscriptionActions, SubscriptionPayload } from "@/core/actions/SubscriptionActions";` |

## UIActions
**Source file:** `src/core/actions/UIActions.ts`

### FetchUserDataPayload
**Imports to fix:** 1

| Import File | Line | Original | Fixed |
|-------------|------|----------|-------|
| `src/core/hooks/commHooks/useNotificationBar.tsx` | 3 | `import { FetchUserDataPayload, UIActions } from '@/core/actions/UIActions'; // Import FetchUserDataPayload` | `import type { FetchUserDataPayload, UIActions } from '@/core/actions/UIActions'; // Import FetchUserDataPayload` |

## Summary

| Interface | Source File | Import Count |
|-----------|-------------|--------------|
| SnapshotForActions | AppActionTypes | 1 |
| CommunicationActionTypes | CommunicationActions | 1 |
| SnapshotOperation | SnapshotActions | 5 |
| SnapshotStoreActions | SnapshotActions | 1 |
| SubscriptionPayload | SubscriptionActions | 4 |
| FetchUserDataPayload | UIActions | 1 |
