# Core Type Import Fix Report

**Generated:** 2026-01-10T21:00:59.177Z
**Total fixes:** 11
**Files modified:** 2

## Summary

| File | Changes | Status |
|------|---------|--------|
| `src/core/calendar/formatCalendarAsDOCX.ts` | 5 | ✅ Ready |
| `src/core/calendar/CalendarViewSlice.ts` | 6 | ✅ Ready |

## Detailed Changes

### src/core/calendar/formatCalendarAsDOCX.ts

**Change 1** (Line 3):

```diff
- import { SimpleCalendarEvent } from '@/core/components/calendar/CalendarContext';
+ import type { SimpleCalendarEvent } from '@/core/components/calendar/CalendarContext';
```

**Change 2** (Line 4):

```diff
- import { MyPropertiesOptions } from '@/core/config/declarations/global';
+ import type { MyPropertiesOptions } from '@/core/config/declarations/global';
```

**Change 3** (Line 5):

```diff
- import { CustomDocument } from '@/core/documents/DocumentOptions';
+ import type { CustomDocument } from '@/core/documents/DocumentOptions';
```

**Change 4** (Line 6):

```diff
- import { WritableDraft } from "@/core/state/redux/ReducerGenerator";
+ import type { WritableDraft } from "@/core/state/redux/ReducerGenerator";
```

**Change 5** (Line 7):

```diff
- import { AppCalendarEvent } from '@/core/typings/meetingTypes';
+ import type { AppCalendarEvent } from '@/core/typings/meetingTypes';
```

### src/core/calendar/CalendarViewSlice.ts

**Change 1** (Line 3):

```diff
- import { CalendarEvent } from '@/core/calendar/CalendarEvent';
+ import type { CalendarEvent } from '@/core/calendar/CalendarEvent';
```

**Change 2** (Line 7):

```diff
- import { SimpleCalendarEvent } from '@/core/components/calendar/CalendarContext';
+ import type { SimpleCalendarEvent } from '@/core/components/calendar/CalendarContext';
```

**Change 3** (Line 8):

```diff
- import { SetCustomEventNotificationsPayload } from "@/core/components/notifications/SetEventNotification";
+ import type { SetCustomEventNotificationsPayload } from "@/core/components/notifications/SetEventNotification";
```

**Change 4** (Line 11):

```diff
- import { SupportedData } from "@/core/models/CommonData";
+ import type { SupportedData } from "@/core/models/CommonData";
```

**Change 5** (Line 12):

```diff
- import { CalendarStatus } from "@/core/models/data/StatusType";
+ import type { CalendarStatus } from "@/core/models/data/StatusType";
```

**Change 6** (Line 13):

```diff
- import { WritableDraft } from "@/core/state/redux/ReducerGenerator";
+ import type { WritableDraft } from "@/core/state/redux/ReducerGenerator";
```

## How to Apply

These changes will be applied when you confirm in the interactive prompt.

If you want to preview the changes without applying:
```bash
tsx fix-interface-imports.ts core-types --dry-run
```
