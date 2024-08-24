// import { Data } from "ws";
// import { Task } from "../../models/tasks/Task";
// import { Project } from "../../projects/Project";
// import { Snapshot } from "../../snapshots/LocalStorageSnapshotStore";
// import { SnapshotData } from "../../snapshots/SnapshotStore";
// import { Todo } from "../../todos/Todo";
// import { BaseData } from "../../models/data/Data";

// // ContentHelpers.ts
// export function isTask(content: Task | Project): content is Task {
//   return (content as Task).status !== undefined;
// }

// export function isProject(content: Task | Project): content is Project {
//   return (content as Project).startDate !== undefined;
// }

//   export function isTodo<T extends BaseData, K extends BaseData>(content: Task | Todo<T, K>): content is Todo<T, K> {
//     return (content as Todo<T, K>).title !== undefined;
//   }

  
//  export function isMap<T extends BaseData, K extends BaseData>(data: SnapshotData<T, K>): data is SnapshotData<T, K> & Map<string, Snapshot<T, K>> {
//     return data instanceof Map;
//   }