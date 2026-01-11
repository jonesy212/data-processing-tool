# Core Type Import Fix Report

**Generated:** 2026-01-10T21:00:33.359Z
**Total fixes:** 15
**Files modified:** 6

## Summary

| File | Changes | Status |
|------|---------|--------|
| `src/core/calendar/CalendarEvent.ts` | 5 | ✅ Ready |
| `src/core/calendar/formatCalendarAsXLS.ts` | 3 | ✅ Ready |
| `src/core/calendar/CalendarEventEngagementMetrics.ts` | 2 | ✅ Ready |
| `src/core/calendar/CalendarEventInvitationPersonalization.ts` | 2 | ✅ Ready |
| `src/core/calendar/ExternalCalendarOverlay.ts` | 2 | ✅ Ready |
| `src/core/calendar/formatCalendarAsDOCX.ts` | 1 | ✅ Ready |

## Detailed Changes

### src/core/calendar/CalendarEvent.ts

**Change 1** (Line 24):

```diff
- import { Attendee } from "@/core/components/calendar/Attendee";
+ import type { Attendee } from "@/core/components/calendar/Attendee";
```

**Change 2** (Line 25):

```diff
- import { TagsRecord } from '@/core/models/tracker/Tag';
+ import type { TagsRecord } from '@/core/models/tracker/Tag';
```

**Change 3** (Line 26):

```diff
- import { WritableDraft } from "@/core/state/redux/ReducerGenerator";
+ import type { WritableDraft } from "@/core/state/redux/ReducerGenerator";
```

**Change 4** (Line 27):

```diff
- import { CommonEvent } from "@/core/state/stores/CommonEvent";
+ import type { CommonEvent } from "@/core/state/stores/CommonEvent";
```

**Change 5** (Line 28):

```diff
- import { AllStatus } from "@/core/state/stores/DetailsListStore";
+ import type { AllStatus } from "@/core/state/stores/DetailsListStore";
```

### src/core/calendar/formatCalendarAsXLS.ts

**Change 1** (Line 2):

```diff
- import { CalendarEvent } from '@/core/calendar/CalendarEvent';
+ import type { CalendarEvent } from '@/core/calendar/CalendarEvent';
```

**Change 2** (Line 3):

```diff
- import { SimpleCalendarEvent } from '@/core/components/calendar/CalendarContext';
+ import type { SimpleCalendarEvent } from '@/core/components/calendar/CalendarContext';
```

**Change 3** (Line 4):

```diff
- import { WritableDraft } from "@/core/state/redux/ReducerGenerator";
+ import type { WritableDraft } from "@/core/state/redux/ReducerGenerator";
```

### src/core/calendar/CalendarEventEngagementMetrics.ts

**Change 1** (Line 2):

```diff
- import { EngagementMetrics } from "@/core/models/data/EventPriorityClassification";
+ import type { EngagementMetrics } from "@/core/models/data/EventPriorityClassification";
```

**Change 2** (Line 3):

```diff
- import { WritableDraft } from "@/core/state/redux/ReducerGenerator";
+ import type { WritableDraft } from "@/core/state/redux/ReducerGenerator";
```

### src/core/calendar/CalendarEventInvitationPersonalization.ts

**Change 1** (Line 2):

```diff
- import { PersonalizedInvitation } from "@/core/models/data/EventPriorityClassification";
+ import type { PersonalizedInvitation } from "@/core/models/data/EventPriorityClassification";
```

**Change 2** (Line 3):

```diff
- import { WritableDraft } from "@/core/state/redux/ReducerGenerator";
+ import type { WritableDraft } from "@/core/state/redux/ReducerGenerator";
```

### src/core/calendar/ExternalCalendarOverlay.ts

**Change 1** (Line 2):

```diff
- import { CalendarEvent } from '@/core/calendar/CalendarEvent';
+ import type { CalendarEvent } from '@/core/calendar/CalendarEvent';
```

**Change 2** (Line 3):

```diff
- import { DocumentOptions } from "@/core/documents/DocumentOptions";
+ import type { DocumentOptions } from "@/core/documents/DocumentOptions";
```

### src/core/calendar/formatCalendarAsDOCX.ts

**Change 1** (Line 2):

```diff
- import { CalendarEvent } from '@/core/calendar/CalendarEvent';
+ import type { CalendarEvent } from '@/core/calendar/CalendarEvent';
```

## How to Apply

These changes will be applied when you confirm in the interactive prompt.

If you want to preview the changes without applying:
```bash
tsx fix-interface-imports.ts core-types --dry-run
```
