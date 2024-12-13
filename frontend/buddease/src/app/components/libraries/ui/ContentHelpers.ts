// ContentHelpers.ts
import { BaseData } from '@/app/components/models/data/Data';
import { Task } from "../../models/tasks/Task";
import { Project } from "../../projects/Project";
import { SnapshotData } from "../../snapshots";
import { Snapshot } from "../../snapshots/LocalStorageSnapshotStore";
import { Todo } from "../../todos/Todo";

export function isTask<
  T extends  BaseData<any>, 
  K extends T = T>(content: Task<T, K> | Project): content is Task<T, K> {
  return (content as Task<T, K>).status !== undefined;
}

export function isProject<
  T extends  BaseData<any>, 
  K extends T = T>(content: Task<T, K> | Project): content is Project {
  return (content as Project).startDate !== undefined;
}

export function isTodo<
  T extends  BaseData<any>,
  K extends T = T>(content: Task<T, K> | Todo<T, K>): content is Todo<T, K> {
    return (content as Todo<T, K>).title !== undefined;
  }

  
export function isMap<
  T extends  BaseData<any>,
  K extends T = T>(data: SnapshotData<T, K>): data is SnapshotData<T, K> & Map<string, Snapshot<T, K>> {
    return data instanceof Map;
  }