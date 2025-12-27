// snapshotTaskMap.ts
import type { Snapshot } from '@/app/snapshots/Snapshot';;
import { TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields } from "@/app/typings/entities/TaskEntity";

//snapshotTaskMap.ts
const snapshotTasktMap = new Map<string, Snapshot<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>>([
  [
    'subtask1',
    {} as Snapshot<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>
  ]
]);

export { snapshotTasktMap };
