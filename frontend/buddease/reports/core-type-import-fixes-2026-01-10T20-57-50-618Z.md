# Core Type Import Fix Report

**Generated:** 2026-01-10T20:57:50.633Z
**Total fixes:** 16
**Files modified:** 4

## Summary

| File | Changes | Status |
|------|---------|--------|
| `src/core/calendar/CalendarEventFeedbackAnalysis.ts` | 1 | ✅ Ready |
| `src/core/calendar/formatCalendarAsCSV.ts` | 4 | ✅ Ready |
| `src/core/calendar/CalendarEventTrendDetectionResult.ts` | 1 | ✅ Ready |
| `src/core/calendar/CalendarEvent.ts` | 10 | ✅ Ready |

## Detailed Changes

### src/core/calendar/CalendarEventFeedbackAnalysis.ts

**Change 1** (Line 3):

```diff
- import { WritableDraft } from "@/core/state/redux/ReducerGenerator";
+ import type { WritableDraft } from "@/core/state/redux/ReducerGenerator";
```

### src/core/calendar/formatCalendarAsCSV.ts

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

**Change 4** (Line 5):

```diff
- import { AppCalendarEvent } from '@/core/typings/meetingTypes';
+ import type { AppCalendarEvent } from '@/core/typings/meetingTypes';
```

### src/core/calendar/CalendarEventTrendDetectionResult.ts

**Change 1** (Line 2):

```diff
- import { EventTrendType } from "@/core/models/data/EventPriorityClassification";
+ import type { EventTrendType } from "@/core/models/data/EventPriorityClassification";
```

### src/core/calendar/CalendarEvent.ts

**Change 1** (Line 3):

```diff
- import { Label } from '@/core/branding/BrandingSettings';
+ import type { Label } from '@/core/branding/BrandingSettings';
```

**Change 2** (Line 4):

```diff
- import { Team } from "@/core/components/teams/Team";
+ import type { Team } from "@/core/components/teams/Team";
```

**Change 3** (Line 8):

```diff
- import { useMetadata } from "@/core/config/useMetadata";
+ import type { useMetadata } from "@/core/config/useMetadata";
```

**Change 4** (Line 10):

```diff
- import { DocumentOptions } from "@/core/documents/DocumentOptions";
+ import type { DocumentOptions } from "@/core/documents/DocumentOptions";
```

**Change 5** (Line 11):

```diff
- import { NotificationType } from '@/core/features/support/UnifiedNotificationTypes';
+ import type { NotificationType } from '@/core/features/support/UnifiedNotificationTypes';
```

**Change 6** (Line 12):

```diff
- import { Category } from "@/core/libraries/categories/generateCategoryProperties";
+ import type { Category } from "@/core/libraries/categories/generateCategoryProperties";
```

**Change 7** (Line 13):

```diff
- import { CommonData } from "@/core/models/CommonData";
+ import type { CommonData } from "@/core/models/CommonData";
```

**Change 8** (Line 14):

```diff
- import { Member } from '@/core/models/members/Member';
+ import type { Member } from '@/core/models/members/Member';
```

**Change 9** (Line 15):

```diff
- import { Phase } from "@/core/models/phases/Phase";
+ import type { Phase } from "@/core/models/phases/Phase";
```

**Change 10** (Line 18):

```diff
- import { ReminderSettings } from '@/core/settings/Reminder';
+ import type { ReminderSettings } from '@/core/settings/Reminder';
```

## How to Apply

These changes will be applied when you confirm in the interactive prompt.

If you want to preview the changes without applying:
```bash
tsx fix-interface-imports.ts core-types --dry-run
```
