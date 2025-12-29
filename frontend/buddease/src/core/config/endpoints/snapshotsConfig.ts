// snapshotsConfig.ts
import { SnapshotsEndpoints } from '@/core/typings/categories/SnapshotsEndpoints';

export const snapshotsConfig: SnapshotsEndpoints = {
  list: { path: "/api/snapshots", method: "GET" },
  create: { path: "/api/snapshots/create", method: "POST" },
  single: (snapshotId: string) => ({ path: `/api/snapshots/${snapshotId}`, method: "GET" }),
  add: { path: "/api/snapshots/add", method: "POST" },
  remove: (snapshotId: string) => ({ path: `/api/snapshots/${snapshotId}/remove`, method: "DELETE" }),
  update: (snapshotId: string) => ({ path: `/api/snapshots/${snapshotId}`, method: "PUT" }),
  fetchUpdatedData: (snapshotId: string) => ({ path: `/api/snapshots/${snapshotId}/fetch-updated-data`, method: "GET" }),
  bulkAdd: { path: "/api/snapshots/bulk-add", method: "POST" },
  bulkRemove: { path: "/api/snapshots/bulk-remove", method: "POST" },
  bulkUpdate: { path: "/api/snapshots/bulk-update", method: "POST" },
};