// SnapshotsEndpoints.ts
import { EndpointConfig } from '../EndpointConfigurations';

export interface SnapshotsEndpoints {
  create: EndpointConfig;
  list: EndpointConfig;
  single: (snapshotId: string) => EndpointConfig;
  add: EndpointConfig;
  remove: (snapshotId: string) => EndpointConfig;
  update: (snapshotId: string) => EndpointConfig;
  fetchUpdatedData: (snapshotId: string) => EndpointConfig;
  bulkAdd: EndpointConfig;
  bulkRemove: EndpointConfig;
  bulkUpdate: EndpointConfig;
}