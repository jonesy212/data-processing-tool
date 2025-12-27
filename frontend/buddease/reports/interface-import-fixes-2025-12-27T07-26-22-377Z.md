# Interface Import Fixes Preview

**Generated:** 2025-12-27T07:26:22.403Z
**Total fixes found:** 20
**Interface files analyzed:** 10 of 865

> **Note:** This is a preview only. No changes have been made.

## ApiActions
**Source file:** `src/app/actions/ApiActions.ts`

### ApiActionTypes
**Imports to fix:** 1

| Import File | Line | Original | Fixed |
|-------------|------|----------|-------|
| `src/app/actions/AppActions.ts` | 3 | `import { ApiActionTypes } from "@/app/actions/ApiActions";` | `import type { ApiActionTypes } from "@/app/actions/ApiActions";` |

## AppActionTypes
**Source file:** `src/app/actions/AppActionTypes.ts`

### SnapshotForActions
**Imports to fix:** 1

| Import File | Line | Original | Fixed |
|-------------|------|----------|-------|
| `src/app/actions/DataActions.ts` | 3 | `import { SnapshotForActions } from '@/app/actions/AppActionTypes';` | `import type { SnapshotForActions } from '@/app/actions/AppActionTypes';` |

## CalendarEventActions
**Source file:** `src/app/actions/CalendarEventActions.ts`

### DefaultCalendarEvent
**Imports to fix:** 1

| Import File | Line | Original | Fixed |
|-------------|------|----------|-------|
| `src/app/logging/Logger.ts` | 22 | `import { DefaultCalendarEvent } from '@/app/actions/CalendarEventActions';` | `import type { DefaultCalendarEvent } from '@/app/actions/CalendarEventActions';` |

## CommunicationActions
**Source file:** `src/app/actions/CommunicationActions.tsx`

### CommunicationActionTypes
**Imports to fix:** 1

| Import File | Line | Original | Fixed |
|-------------|------|----------|-------|
| `src/app/state/stores/DetailsListStore.ts` | 23 | `import { CommunicationActionTypes } from "@/app/actions/CommunicationActions";` | `import type { CommunicationActionTypes } from "@/app/actions/CommunicationActions";` |

## SnapshotActions
**Source file:** `src/app/actions/SnapshotActions.tsx`

### SnapshotOperation
**Imports to fix:** 5

| Import File | Line | Original | Fixed |
|-------------|------|----------|-------|
| `src/app/snapshots/SnapshotStoreProps.ts` | 2 | `import { SnapshotOperation, SnapshotOperationType } from "@/app/actions/SnapshotActions";` | `import type { SnapshotOperation, SnapshotOperationType } from "@/app/actions/SnapshotActions";` |
| `src/app/snapshots/SnapshotStoreConfigComponent.tsx` | 2 | `import { SnapshotOperation, SnapshotOperationType } from "@/app/actions/SnapshotActions";` | `import type { SnapshotOperation, SnapshotOperationType } from "@/app/actions/SnapshotActions";` |
| `src/app/snapshots/newStoreUtils.ts` | 2 | `import { SnapshotOperation, SnapshotOperationType } from "@/app/actions/SnapshotActions";` | `import type { SnapshotOperation, SnapshotOperationType } from "@/app/actions/SnapshotActions";` |
| `src/app/snapshots/SnapshotStore.tsx` | 67 | `import { SnapshotOperation } from '@/app/actions/SnapshotActions';` | `import type { SnapshotOperation } from '@/app/actions/SnapshotActions';` |
| `src/app/snapshots/convertSnapshotStoreToStorage.ts` | 2 | `import { SnapshotOperation } from '@/app/actions/SnapshotActions';` | `import type { SnapshotOperation } from '@/app/actions/SnapshotActions';` |

### SnapshotStoreActions
**Imports to fix:** 1

| Import File | Line | Original | Fixed |
|-------------|------|----------|-------|
| `src/app/snapshots/handleSnapshotOperation.ts` | 2 | `import SnapshotStoreActions from '@/app/actions/SnapshotActions';` | `import type SnapshotStoreActions from '@/app/actions/SnapshotActions';` |

## SubscriptionActions
**Source file:** `src/app/actions/SubscriptionActions.ts`

### SubscriptionPayload
**Imports to fix:** 5

| Import File | Line | Original | Fixed |
|-------------|------|----------|-------|
| `src/app/snapshots/convertSubscriptionPayloadToSubscriber.ts` | 2 | `import { SubscriptionPayload } from "@/app/actions/SubscriptionActions";` | `import type { SubscriptionPayload } from "@/app/actions/SubscriptionActions";` |
| `src/app/typings/entities/SubscriptionEntity.ts` | 2 | `import { SubscriptionPayload } from '@/app/actions/SubscriptionActions';` | `import type { SubscriptionPayload } from '@/app/actions/SubscriptionActions';` |
| `src/app/server/database/payloads/projectSubscriptionPayload.ts` | 2 | `import { createSubscriptionPayload } from "@/app/actions/SubscriptionActions";` | `import type { createSubscriptionPayload } from "@/app/actions/SubscriptionActions";` |
| `src/app/server/database/Payload.tsx` | 5 | `import { SubscriptionPayload } from "@/app/actions/SubscriptionActions";` | `import type { SubscriptionPayload } from "@/app/actions/SubscriptionActions";` |
| `src/app/hooks/useSubscription.tsx` | 2 | `import { SubscriptionActions, SubscriptionPayload } from "@/app/actions/SubscriptionActions";` | `import type { SubscriptionActions, SubscriptionPayload } from "@/app/actions/SubscriptionActions";` |

## UIActions
**Source file:** `src/app/actions/UIActions.ts`

### GesterEvent
**Imports to fix:** 1

| Import File | Line | Original | Fixed |
|-------------|------|----------|-------|
| `src/app/features/shortcuts/ShortcutKeys.tsx` | 10 | `import { GesterEvent, UIActions } from "@/app/actions/UIActions";` | `import type { GesterEvent, UIActions } from "@/app/actions/UIActions";` |

### FetchUserDataPayload
**Imports to fix:** 1

| Import File | Line | Original | Fixed |
|-------------|------|----------|-------|
| `src/app/hooks/commHooks/useNotificationBar.tsx` | 3 | `import { FetchUserDataPayload, UIActions } from '@/app/actions/UIActions'; // Import FetchUserDataPayload` | `import type { FetchUserDataPayload, UIActions } from '@/app/actions/UIActions'; // Import FetchUserDataPayload` |

## ValidationActions
**Source file:** `src/app/actions/ValidationActions.ts`

### ValidationAction
**Imports to fix:** 3

| Import File | Line | Original | Fixed |
|-------------|------|----------|-------|
| `src/app/state/redux/sagas/ThemeSettingsSagas.ts` | 5 | `import { ValidationActionTypes, ValidationActions, validationSuccess } from "@/app/actions/ValidationActions";` | `import type { ValidationActionTypes, ValidationActions, validationSuccess } from "@/app/actions/ValidationActions";` |
| `src/app/state/redux/sagas/validationSagas.ts` | 3 | `import { ValidationActionTypes, validationFailure, validationSuccess } from '@/app/actions/ValidationActions';` | `import type { ValidationActionTypes, validationFailure, validationSuccess } from '@/app/actions/ValidationActions';` |
| `src/app/actions/scheduleAction.ts` | 40 | `import { ValidationActions } from '@/app/actions/ValidationActions';` | `import type { ValidationActions } from '@/app/actions/ValidationActions';` |

## Summary

| Interface | Source File | Import Count |
|-----------|-------------|--------------|
| ApiActionTypes | ApiActions | 1 |
| SnapshotForActions | AppActionTypes | 1 |
| DefaultCalendarEvent | CalendarEventActions | 1 |
| CommunicationActionTypes | CommunicationActions | 1 |
| SnapshotOperation | SnapshotActions | 5 |
| SnapshotStoreActions | SnapshotActions | 1 |
| SubscriptionPayload | SubscriptionActions | 5 |
| GesterEvent | UIActions | 1 |
| FetchUserDataPayload | UIActions | 1 |
| ValidationAction | ValidationActions | 3 |
