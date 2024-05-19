import { Task } from "../components/models/tasks/Task";

let currentTaskId = 1;

export const generateNewTask = (
  projectId: string,
  title: string,
  isComplete: boolean,
  numberOfSubtasks: number = 0,
): Task => {
  // Make the task ID more unique and identifiable between teams and projects
  const taskId = `${projectId}_${currentTaskId}`;

  // Increment the task ID for the next task
  currentTaskId++;

  // Determine the status based on isComplete
  const status = isComplete ? "complete" : "pending";

  // Create the base task object
  let newTask: Task = {
    id: taskId,
    title: "",
    description: "",
    assignedTo: [],
    dueDate: new Date(),
    status: status,
    priority: "medium",
    estimatedHours: 0,
    actualHours: 0,
    startDate: new Date(),
    completionDate: isComplete ? new Date() : undefined,
    endDate: new Date(),
    isActive: false,
    tags: [],
    dependencies: [],
    then: (arg0: (newTask: any) => void) => {},
    previouslyAssignedTo: [],
    done: isComplete,
    assigneeId: "",
    payload: "",
    data: {},
    source: "user",
    type: "",
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    projectId: projectId || "",

    // Implementing Symbol.iterator for the base task
    [Symbol.iterator]: function* () {
      yield this; // Yielding the current task
    }
  };

  // Add subtasks if specified
  if (numberOfSubtasks > 0) {
    newTask[Symbol.iterator] = function* () {
      for (let i = 0; i < numberOfSubtasks; i++) {
        // Generate subtask IDs based on the parent task ID
        const subtaskId = `${this.id}_subtask_${i}`;
        yield { id: subtaskId, title: `Subtask ${i + 1}`, description: "Subtask description" };
      }
    };
  }

  return newTask;
};
