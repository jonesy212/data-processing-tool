import { Snapshot } from ".";
import { Data } from '@/app/models/data/Data';
import { K, T } from "./SnapshotConfig";

//snapshotTaskMap.ts
const snapshotTasktMap = new Map<string, Snapshot<Task, Data<T, K, Meta>>>([
  [
    'subtask1',
    {} as Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ]
]);

export { snapshotTasktMap };
