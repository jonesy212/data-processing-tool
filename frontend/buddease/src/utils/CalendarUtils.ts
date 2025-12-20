// CalendarUtils.ts

import { CalendarEventWithCriteria } from '@/app/pages/searches/FilterCriteria';
import { SnapshotStore } from '@/app/snapshots/SnapshotStore';
import { SnapshotStoreOptions } from '@/app/snapshots/SnapshotStoreOptions';
import { SnapshotStoreConfig } from '@/app/snapshots/SnapshotStoreConfig';
import { StructuredMetadata } from '@/app/config/StructuredMetadata';
import { CalendarEntity, CalendarK, CalendarMeta, CalendarAttachment, CalendarExcludedFields, CalendarIncludedFields } from "@/app/typings/entities/CalendarEntity";

/* ============================================================
 * Type Guard
 * ============================================================ */

export function isCalendarEventWithCriteria(
  value: unknown
): value is CalendarEventWithCriteria {
  if (typeof value !== 'object' || value === null) return false;

  return (
    'id' in value &&
    'version' in value &&
    'criteria' in value
  );
}

/* ============================================================
 * Assertion Helpers (ONE TARGET EACH — REQUIRED)
 * ============================================================ */

function assertCalendarStoreOptions(
  options: SnapshotStoreOptions<any, any, any, any, any, any, any, any, any>
): asserts options is SnapshotStoreOptions<
  CalendarEventWithCriteria,
  CalendarEventWithCriteria,
  StructuredMetadata<CalendarEventWithCriteria, CalendarEventWithCriteria>
> {
  if (!isCalendarEventWithCriteria((options as any)?.payload)) {
    throw new Error(
      'SnapshotStoreOptions payload must be CalendarEventWithCriteria'
    );
  }
}

function assertCalendarStoreConfig(
  config: SnapshotStoreConfig<any, any, any, any, any, any, any, any, any>
): asserts config is SnapshotStoreConfig<CalendarEntity, CalendarK, CalendarMeta, CalendarAttachment, CalendarExcludedFields, CalendarIncludedFields> {
  if (!isCalendarEventWithCriteria((config as any)?.payload)) {
    throw new Error(
      'SnapshotStoreConfig payload must be CalendarEventWithCriteria'
    );
  }
}

function assertCalendarCallback(
  callback: unknown
): asserts callback is (data: CalendarEventWithCriteria) => void {
  if (typeof callback !== 'function') {
    throw new Error('Callback must be a function');
  }
}

/* ============================================================
 * Store Factory
 * ============================================================ */

export function getCalendarSnapshotStoreData(
  options: SnapshotStoreOptions<any, any, any, any, any, any>,
  config: SnapshotStoreConfig<any, any, any, any, any, any>,
  callback: (data: any) => void
): Promise<CalendarEventWithCriteria[]> {

  /* ---------- Assertions (narrow types safely) ---------- */

  assertCalendarStoreOptions(options);
  assertCalendarStoreConfig(config);
  assertCalendarCallback(callback);

  /* ---------- Wrapped callback with runtime validation ---------- */

  const calendarCallback = (data: unknown) => {
    if (!isCalendarEventWithCriteria(data)) {
      throw new Error(
        'Callback received non-CalendarEventWithCriteria data'
      );
    }
    callback(data);
  };

  /* ---------- Snapshot store creation ---------- */

  const snapshotStore = new SnapshotStore<
    CalendarEventWithCriteria,
    CalendarEventWithCriteria
  >({
    storeId,
    name,
    version,
    schema,
    options,
    category,
    config,
    operation,
    expirationDate,
    payload,
    currentMeta,
    callback: calendarCallback,
    storeProps,
    endpointCategory
  });

  return snapshotStore.getAllData();
}
