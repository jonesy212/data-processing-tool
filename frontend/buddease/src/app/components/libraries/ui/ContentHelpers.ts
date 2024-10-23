import { Data } from "ws";
import { Task } from "../../models/tasks/Task";
import { Project } from "../../projects/Project";
import { SnapshotData } from "../../snapshots";
import { Snapshot } from "../../snapshots/LocalStorageSnapshotStore";
import { Todo } from "../../todos/Todo";

// ContentHelpers.ts
export function isTask(content: Task | Project): content is Task {
  return (content as Task).status !== undefined;
}

export function isProject(content: Task | Project): content is Project {
  return (content as Project).startDate !== undefined;
}

  export function isTodo <T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T>(content: Task | Todo): content is Todo {
    return (content as Todo).title !== undefined;
  }

  
 export function isMap <T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T>(data: SnapshotData<T, Meta, K>): data is SnapshotData<T, Meta, K> & Map<string, Snapshot<T, Meta, K>> {
    return data instanceof Map;
  }