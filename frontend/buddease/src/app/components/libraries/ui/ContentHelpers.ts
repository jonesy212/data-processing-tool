import { Task } from "../../models/tasks/Task";
import { Project } from "../../projects/Project";
import { Todo } from "../../todos/Todo";

// ContentHelpers.ts
export function isTask(content: Task | Project): content is Task {
  return (content as Task).status !== undefined;
}

export function isProject(content: Task | Project): content is Project {
  return (content as Project).startDate !== undefined;
}

export function isTodo(content: Task | Todo): content is Todo {
  return (content as Todo).title !== undefined;
}


