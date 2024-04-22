// TaskSlice.ts
import { generateNewTask } from "@/app/generators/GenerateNewTask";
import UniqueIDGenerator from "@/app/generators/GenerateUniqueIds";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import FileSaver from "file-saver";
import * as Papa from "papaparse";
import { NamingConventionsError } from "shared_error_handling";
import * as XLSX from "xlsx";
import useWebNotifications from "../../../hooks/commHooks/useWebNotifications";
import { TaskLogger } from "../../../logging/Logger";
import { Data } from "../../../models/data/Data";
import { ProjectPhaseTypeEnum } from "../../../models/data/StatusType";
import TaskDetails, { Task, tasksDataSource } from "../../../models/tasks/Task";
import { Progress } from "../../../models/tracker/ProgressBar";
import { Project } from "../../../projects/Project";
import { sanitizeInput } from "../../../security/SanitizationFunctions";
import {
  NotificationType,
  NotificationTypeEnum,
  useNotification,
} from "../../../support/NotificationContext";
import NOTIFICATION_MESSAGES from "../../../support/NotificationMessages";
import { Idea } from "../../../users/Ideas";
import { User } from "../../../users/User";
import { VideoData } from "../../../video/Video";
import { implementThen } from "../../stores/CommonEvent";
import { ProjectManagerStore } from "../../stores/ProjectStore";
import { WritableDraft } from "../ReducerGenerator";
import { CustomComment } from "./BlogSlice";

const { showNotification } = useWebNotifications();
const { notify } = useNotification();

interface TaskManagerState extends Task {
  tasks: Task[];
  actionStack: Task[];
  redoStack: Task[];
  taskTitle: string;
  taskDescription: string;
  taskStatus: "pending" | "inProgress" | "completed";
  priority: "low" | "medium" | "high";
  projectManager: ProjectManagerStore | null;
  pendingTasks: []; // Initialize pendingTasks array
  inProgressTasks: []; // Initialize inProgressTasks array
  completedTasks: []; // Initialize completedTasks array
}

const tasks: Record<string, Task> = { ...tasksDataSource };
const initialState: TaskManagerState = {
  tasks: [],
  taskTitle: "",
  name: "taskManager",
  taskDescription: "",
  taskStatus: "pending",
  actionStack: [],
  redoStack: [],
  priority: "low",
  pendingTasks: [],
  inProgressTasks: [],
  completedTasks: [],
  ...tasks,
  id: "",
  title: "",
  description: "",
  assignedTo: {} as WritableDraft<User>,
  assigneeId: "",
  dueDate: new Date(),
  payload: undefined,
  type: "addTask",
  status: "pending",
  previouslyAssignedTo: [],
  done: false,
  data: {} as Data,
  source: "user",
  projectManager: null,
  some: function (
    callbackfn: (value: Task, index: number, array: Task[]) => unknown,
    thisArg?: any
  ): boolean {
    return this.tasks.some(callbackfn, thisArg);
  },

  then: implementThen,
  startDate: undefined,
  endDate: new Date(),
  isActive: false,
  tags: [],
  analysisType: {} as AnalysisTypeEnum,
  analysisResults: [],
  videoThumbnail: "",
  videoDuration: 0,
  videoUrl: "",
  [Symbol.iterator]: function (): Iterator<any, any, undefined> {
    throw new Error("Function not implemented.");
  },
  _id: "",
  phase: null,
  videoData: {} as VideoData,
  ideas: [],
};

const handleNumberPriority = (priority: number): "low" | "medium" | "high" => {
  if (priority === 1) {
    return "low";
  } else if (priority === 2) {
    return "medium";
  } else if (priority === 3) {
    return "high";
  } else {
    console.warn(`Invalid priority number: ${priority}. Defaulting to 'low'.`);
    return "low"; // Default to 'low' priority if the number is not recognized
  }
};

export const taskManagerSlice = createSlice({
  name: "taskManager",
  initialState,
  reducers: {
    updateTaskTitle: (state, action: PayloadAction<string>) => {
      state.taskTitle = action.payload;
    },

    updateTaskDescription: (state, action: PayloadAction<string>) => {
      state.taskDescription = action.payload;
    },

    updateTaskStatus: (
      state,
      action: PayloadAction<"pending" | "inProgress" | "completed">
    ) => {
      state.taskStatus = action.payload;
    },

    updateTaskDetails: (
      state,
      action: PayloadAction<{ taskId: string; updatedDetails: Partial<Task> }>
    ) => {
      const { taskId, updatedDetails } = action.payload;
      const taskToUpdate = state.tasks.find((task) => task.id === taskId);

      if (taskToUpdate) {
        // Update the task details
        Object.assign(taskToUpdate, updatedDetails);
      }
    },

    dueDate: (
      state,
      action: PayloadAction<{
        id: string | number;
        updatedDetails: typeof TaskDetails;
        dueDate: Date;
      }>
    ) => {
      const { id, dueDate, updatedDetails } = action.payload; // Include id in the destructuring
      const taskToUpdateIndex = state.tasks.findIndex((task) => task.id === id);

      if (taskToUpdateIndex !== -1) {
        const taskToUpdate = state.tasks[taskToUpdateIndex];
        const updatedTask = {
          ...taskToUpdate,
          dueDate,
          ...updatedDetails, // Assuming updatedDetails contains other properties to update
        };

        state.tasks[taskToUpdateIndex] = updatedTask;
      }
    },

    addTask: (state, action: PayloadAction<{ id: string; title: string, isComplete: boolean }>) => {
      const { id, title } = action.payload;
      // Generate a unique ID for the new task
      const generatedTaskID = UniqueIDGenerator.generateTaskID(id, title);

      // Ensure task title is not empty
      if (sanitizeInput(state.taskTitle.trim()) === "") {
        console.error("Task title cannot be empty.");
        return;
      }

      const newTask: WritableDraft<Task> = {
        id: generatedTaskID,
        title,
        description: state.taskDescription,
        status: state.taskStatus,
      } as WritableDraft<Task>;

      state.tasks.push(newTask);
      TaskLogger.logTaskCreated("New Task", generatedTaskID);

      generateNewTask().then((newTask: any) => {
        state.tasks.push(newTask);
      });

      state.taskTitle = "";
      state.taskDescription = "";
      state.taskStatus = "pending";
    },

    removeTask: (state, action: PayloadAction<string>) => {
      state.tasks = state.tasks.filter((task) => task.id !== action.payload);
    },

    completeTask: (state, action: PayloadAction<string>) => {
      const completedTaskId = action.payload;
      // Find the completed task in the state
      const completedTask = state.tasks.find(
        (task) => task.id === completedTaskId
      );

      if (!completedTask) {
        // If the task does not exist, display an error notification
        notify(
          "completedTask",
          "Could not find task to complete.",
          NOTIFICATION_MESSAGES.Notifications.DEFAULT,
          new Date(),
          "Error" as NotificationType
        );
        return;
      }

      // Check if notification permission is granted before displaying notification
      if (Notification.permission === "granted") {
        showNotification("Task Completed", {
          body: "Congratulations! You have completed a task.",
        });
      } else {
        notify(
          "completedTask",
          "Notification permission not granted.",
          NOTIFICATION_MESSAGES.Notifications.NOTIFICATION_SEND_FAILED,
          new Date(),
          NotificationTypeEnum.OperationError
        );
      }
    },

    filterTasks: (state, action: PayloadAction<string>) => {
      const keyword = action.payload.toLowerCase(); // Convert the keyword to lowercase for case-insensitive search
      state.tasks = state.tasks.filter((task) => {
        // Implement filtering logic based on action.payload
        return (
          task.title.toLowerCase().includes(keyword) || // Filter by task title
          task.description.toLowerCase().includes(keyword) || // Filter by task description
          task.status?.toLowerCase() === keyword
        ); // Filter by task status
      });
    },

    sortTasks: (state, action: PayloadAction<string>) => {
      const sortBy = action.payload.toLowerCase(); // Convert the sorting criteria to lowercase for case-insensitive comparison

      state.tasks.sort((a, b) => {
        if (sortBy === "title") {
          return a.title.localeCompare(b.title); // Sort by task title
        } else if (sortBy === "description") {
          return a.description.localeCompare(b.description); // Sort by task description
        } else if (sortBy === "status") {
          if (a.status && b.status) {
            return a.status.localeCompare(b.status); // Sort by task status
          } else if (!a.status && b.status) {
            return 1; // If a.status is falsy and b.status is truthy, sort b before a
          } else if (a.status && !b.status) {
            return -1; // If a.status is truthy and b.status is falsy, sort a before b
          } else {
            return 0; // If both a.status and b.status are falsy, consider them equal
          }
        } else {
          // Default sorting criteria
          return a.title.localeCompare(b.title); // Sort by task title if sorting criteria is not recognized
        }
      });
    },

    duplicateTask: (state, action: PayloadAction<string>) => {
      const taskId = action.payload;
      const taskToDuplicate = state.tasks.find((task) => task.id === taskId);
      if (taskToDuplicate) {
        const generatedID = UniqueIDGenerator.generateTaskID(
          taskToDuplicate.title,
          taskToDuplicate.description
        );
        const duplicatedTask = { ...taskToDuplicate, id: generatedID }; // Generate a new unique ID for the duplicated task
        state.tasks.push(duplicatedTask);
      }
    },

    moveTask: (
      state,
      action: PayloadAction<{
        taskId: string;
        destination: "pending" | "inProgress" | "completed";
      }>
    ) => {
      const { taskId, destination } = action.payload;
      const taskIndex = state.tasks.findIndex((task) => task.id === taskId);

      if (taskIndex !== -1) {
        // Update the task status
        state.tasks[taskIndex].status = destination;

        // Create a new array excluding the moved task
        const updatedTasks = state.tasks.filter(
          (task, index) => index !== taskIndex
        );

        // Determine the target array based on the destination
        let targetArray: WritableDraft<Task[]> = [];
        if (destination === "pending") {
          targetArray = state.pendingTasks;
        } else if (destination === "inProgress") {
          targetArray = state.inProgressTasks;
        } else if (destination === "completed") {
          targetArray = state.completedTasks;
        }

        // Add the moved task to the target array
        targetArray.push(state.tasks[taskIndex]);

        // Update the tasks array with the updated tasks
        state.tasks = updatedTasks;
      }
    },

    // Update the setTaskPriority action to accept priority as a number
    setTaskPriority: (
      state,
      action: PayloadAction<{
        taskId: string;
        priority: "low" | "medium" | "high";
      }>
    ) => {
      const { taskId, priority } = action.payload;
      const taskToUpdate = state.tasks.find((task) => task.id === taskId);
      if (taskToUpdate) {
        taskToUpdate.priority = priority;
      }
    },

    setTaskDueDate: (
      state,
      action: PayloadAction<{ taskId: string; dueDate: Date }>
    ) => {
      const { taskId, dueDate } = action.payload;
      const taskToUpdate = state.tasks.find((task) => task.id === taskId);
      if (taskToUpdate) {
        taskToUpdate.dueDate = dueDate;
      }
    },

    archiveCompletedTasks: (state) => {
      state.tasks = state.tasks.filter((task) => task.status !== "completed");
    },

    clearAllTasks: (state) => {
      state.tasks = [];
    },

    editTask: (
      state,
      action: PayloadAction<{
        taskId: string;
        updatedTask: WritableDraft<Task>;
      }>
    ) => {
      const { taskId, updatedTask } = action.payload;
      const taskIndex = state.tasks.findIndex((task) => task.id === taskId);

      if (taskIndex !== -1) {
        // Update the task
        state.tasks[taskIndex] = updatedTask;
      }
    },

    searchTasks: (state, action: PayloadAction<string>) => {
      const searchQuery = action.payload.toLowerCase(); // Convert the search query to lowercase for case-insensitive comparison

      state.tasks = state.tasks.filter((task) => {
        // Search logic based on task properties (title, description, status)
        return (
          task.title.toLowerCase().includes(searchQuery) ||
          task.description.toLowerCase().includes(searchQuery) ||
          task.status?.toLowerCase().includes(searchQuery)
        );
      });
    },

    assignTask: (
      state,
      action: PayloadAction<{ taskId: string; assigneeId: string }>
    ) => {
      const { taskId, assigneeId } = action.payload;
      // Find the task by taskId
      const taskToAssign = state.tasks.find((task) => task.id === taskId);

      if (taskToAssign) {
        // Assign the task to the specified assignee
        taskToAssign.assigneeId = assigneeId;
      } else {
        console.error(`Task with ID ${taskId} not found.`);
      }
    },

    archiveTask: (state, action: PayloadAction<string>) => {
      const taskIndex = state.tasks.findIndex(
        (task) => task.id === action.payload
      );

      if (taskIndex !== -1) {
        state.tasks.splice(taskIndex, 1);
      }
    },

    undoAction: (state) => {
      if (state.actionStack.length === 0) {
        console.warn("Cannot undo. Action stack is empty.");
        return;
      }

      const lastAction = state.actionStack.pop();
      // Ensure lastAction is not undefined
      if (!lastAction) {
        console.warn("Last action is undefined.");
        return;
      }

      // Implement logic to undo the last action based on its type
      switch (lastAction.type) {
        case "addTask":
          // If the last action was 'addTask', remove the last added task from the tasks array
          state.tasks.pop();
          break;
        case "removeTask":
          // If the last action was 'removeTask', re-add the removed task to the tasks array
          state.tasks.push(lastAction.payload.task);
          break;
        case "bug":
          // If the last action was 'removeTask', re-add the removed task to the tasks array
          state.tasks.push(lastAction.payload.task);
          break;
        case "feature":
          // If the last action was 'removeTask', re-add the removed task to the tasks array
          state.tasks.push(lastAction.payload.task);
          break;
        // Handle other types of actions if needed
        default:
          console.warn("Unsupported action type for undo: ", lastAction.type);
          break;
      }
    },

    redoAction: (state) => {
      if (state.redoStack.length === 0) {
        console.warn("Cannot redo. Redo stack is empty.");
        return;
      }

      const lastRedoAction = state.redoStack.pop();

      if (!lastRedoAction) {
        console.warn("Last redo action is undefined.");
        return;
      }
      // Redo logic based on the type of lastRedoAction
      switch (lastRedoAction.type) {
        case "removeTask":
          // If the last undone action was removing a task, re-add the removed task to the tasks array
          state.tasks.push(lastRedoAction.payload.task);
          break;
        case "addTask":
          // If the last undone action was adding a task, remove the last added task from the tasks array
          state.tasks.pop();
          break;
        case "bug":
          // If the last action was 'removeTask', re-add the removed task to the tasks array
          state.tasks.push(lastRedoAction.payload.task);
          break;
        case "feature":
          // If the last action was 'removeTask', re-add the removed task to the tasks array
          state.tasks.push(lastRedoAction.payload.task);
          break;
        // Handle other types of undone actions if needed
        default:
          console.warn(
            "Unsupported action type for redo: ",
            lastRedoAction.type
          );
          break;
      }
    },

    exportTasks: (state, action: PayloadAction<string>) => {
      const exportFormat = action.payload.toLowerCase(); // Convert format to lowercase for consistent comparison

      try {
        switch (exportFormat) {
          case "csv":
            const tasksCSV = Papa.unparse(state.tasks); // Convert tasks to CSV format
            const csvBlob = new Blob([tasksCSV], {
              type: "text/csv;charset=utf-8",
            });
            FileSaver.saveAs(csvBlob, "tasks.csv"); // Save tasks as a CSV file
            break;
          case "json":
            const tasksJSON = JSON.stringify(state.tasks, null, 2); // Convert tasks to JSON format with indentation
            const jsonBlob = new Blob([tasksJSON], {
              type: "application/json",
            });
            FileSaver.saveAs(jsonBlob, "tasks.json"); // Save tasks as a JSON file
            break;
          case "xls":
          case "xlsx":
            const worksheet = XLSX.utils.json_to_sheet(state.tasks); // Convert tasks to worksheet
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "tasks"); // Add worksheet to workbook
            XLSX.writeFile(workbook, `tasks.${exportFormat}`); // Save workbook as XLS or XLSX file
            break;
          default:
            throw new NamingConventionsError(
              "UnsupportedExportFormat",
              `Unsupported export format: ${exportFormat}`
            );
        }
      } catch (error: any) {
        // Handle the NamingConventionsError
        if (error instanceof NamingConventionsError) {
          console.error("Naming conventions error:", error.message);
          // You can also dispatch an action or display a notification to inform the user about the error
          notify(
            "Export Error",
            `An error occurred while exporting tasks: ${error.message}`,
            NOTIFICATION_MESSAGES.File.EXPORT_ERROR,
            new Date(),
            "Error" as NotificationType
          );
        } else {
          // Handle other types of errors
          console.error("Export error:", error.message);
          // You can also dispatch an action or display a notification to inform the user about the error
          notify(
            "Export Error",
            `An error occurred while exporting tasks. Please try again later.`,
            NOTIFICATION_MESSAGES.File.EXPORT_ERROR,
            new Date(),
            "Error" as NotificationType
          );
        }
      }
    },

    updateTaskTags: (
      state,
      action: PayloadAction<{ task: Task; tags: string[] }>
    ) => {
      const { task, tags } = action.payload;
      const index = state.tasks.findIndex((t) => t.id === task.id);
      if (index === -1) {
        console.warn(`Task with id ${task.id} not found.`);
        return;
      }
      // Update the task's tags
      state.tasks[index].tags = tags;
    },

    updateTaskDueDate: (
      state,
      action: PayloadAction<{ task: Task; dueDate: Date }>
    ) => {
      const { task, dueDate } = action.payload;
      const index = state.tasks.findIndex((t) => t.id === task.id);

      if (index === -1) {
        console.warn(`Task with id ${task.id} not found.`);
        return;
      }
      // Update the task's due date
      state.tasks[index].dueDate = dueDate;
    },

    updateTaskPriority: (
      state,
      action: PayloadAction<{
        task: Task;
        priority: number | "low" | "medium" | "high";
      }>
    ) => {
      const { task, priority } = action.payload;
      const index = state.tasks.findIndex((t) => t.id === task.id);
      if (index === -1) {
        console.warn(`Task with id ${task.id} not found.`);
        return;
      }

      // Check if the priority is a number or a string
      if (typeof priority === "number") {
        // Handle numbers as priority values
        // Add your logic here to map number values to the appropriate strings or handle them accordingly
        // For example:
        state.tasks[index].priority = handleNumberPriority(priority);
      } else {
        // Handle strings as priority values
        state.tasks[index].priority = priority;
      }
    },

    // Method to handle task dependencies
    addTaskDependency: (
      state,
      action: PayloadAction<{
        taskId: string;
        dependencyId: WritableDraft<Task>;
      }>
    ) => {
      const { taskId, dependencyId } = action.payload;
      const taskToUpdate = state.tasks.find((task) => task.id === taskId);

      if (taskToUpdate) {
        if (!taskToUpdate.dependencies) {
          taskToUpdate.dependencies = [];
        }
        taskToUpdate.dependencies.push(dependencyId);
      }
    },

    removeTaskDependency: (
      state,
      action: PayloadAction<{ taskId: string; dependencyId: Task }>
    ) => {
      const { taskId, dependencyId } = action.payload;
      const taskToUpdate = state.tasks.find((task) => task.id === taskId);

      if (taskToUpdate && taskToUpdate.dependencies) {
        taskToUpdate.dependencies = taskToUpdate.dependencies.filter(
          (id) => id !== dependencyId
        );
      }
    },

    // Method to handle task comments/notes
    addTaskComment: (
      state,
      action: PayloadAction<{
        taskId: string;
        comment: WritableDraft<CustomComment>;
      }>
    ) => {
      const { taskId, comment } = action.payload;
      const taskToUpdate = state.tasks.find((task) => task.id === taskId);

      if (taskToUpdate) {
        if (!taskToUpdate.comments) {
          taskToUpdate.comments = [];
        }
        taskToUpdate.comments.push(comment);
      }
    },

    removeTaskComment: (
      state,
      action: PayloadAction<{ taskId: string; commentIndex: number }>
    ) => {
      const { taskId, commentIndex } = action.payload;
      const taskToUpdate = state.tasks.find((task) => task.id === taskId);

      if (taskToUpdate && taskToUpdate.comments) {
        taskToUpdate.comments.splice(commentIndex, 1);
      }
    },

    // Method to handle task history/logs
    getTaskHistory: (state, action: PayloadAction<{ taskId: string }>) => {
      const { taskId } = action.payload;
      const taskToUpdate = state.tasks.find((task) => task.id === taskId);

      if (taskToUpdate) {
        // Fetch and return task history/logs
        return taskToUpdate.history;
      }
    },

    revertToPreviousState: (
      state,
      action: PayloadAction<{ taskId: string; historyIndex: number }>
    ) => {
      const { taskId, historyIndex } = action.payload;
      const taskToUpdate = state.tasks.find((task) => task.id === taskId);

      if (taskToUpdate && taskToUpdate.history) {
        // Implement logic to revert task to previous state based on history index
        const previousState = taskToUpdate.history[historyIndex];
        if (previousState) {
          // Update task with previous state
          Object.assign(taskToUpdate, previousState);
        }
      }
    },

    importTasks: (
      state,
      action: PayloadAction<{ file: File; format: string }>
    ) => {
      const { file, format } = action.payload;

      const reader = new FileReader();

      reader.onload = (event) => {
        let parsedTasks: WritableDraft<Task>[] = [];

        try {
          switch (format) {
            case "csv":
              parsedTasks = Papa.parse<WritableDraft<Task>>(
                event.target?.result as string,
                { header: true }
              ).data;
              break;
            case "json":
              parsedTasks = JSON.parse(event.target?.result as string);
              break;
            case "xls":
            case "xlsx":
              const workbook = XLSX.read(event.target?.result, {
                type: "binary",
              });
              const sheetName = workbook.SheetNames[0];
              const sheet = workbook.Sheets[sheetName];
              parsedTasks =
                XLSX.utils.sheet_to_json<WritableDraft<Task>>(sheet);
              break;
            case "pdf":
              // Implement PDF parsing logic here
              break;
            default:
              throw new NamingConventionsError(
                "UnsupportedFormatError",
                `Unsupported file format: ${format}`
              );
          }

          // Replace current tasks with imported tasks
          state.tasks = parsedTasks;
        } catch (error) {
          if (error instanceof NamingConventionsError) {
            console.error(error.message);
            // Handle the specific error type accordingly
          } else {
            console.error("Error parsing tasks:", error);
            // Handle other types of errors
          }
        }
      };

      reader.onerror = (event) => {
        console.error("Error reading file:", event.target?.error);
      };

      reader.readAsBinaryString(file); // Read the file as binary string
    },

    markTaskComplete: (state, action: PayloadAction<number>) => {
      const task = state.tasks.find((t: any) => t.id === action.payload) as
        | Task
        | undefined;
      if (task) {
        task.data.isCompleted = true;
      }
    },

    markTaskPending: (state, action: PayloadAction<number>) => {
      const task = state.tasks.find((t: any) => t.id === action.payload) as
        | Task
        | undefined;
      if (task) {
        task.data.isCompleted = false;
      }
    },

    batchFetchTaskSnapshots: (state, action: PayloadAction<Task[]>) => {
      const newTasks = action.payload.map((task) => task.someProperty); // Extract necessary information from Task objects
      state.tasks = newTasks; // Now assigning an array of strings
    },

    markTaskAsInProgress: (state, action: PayloadAction<number>) => {
      const task = state.tasks.find((t: any) => t.id === action.payload) as
        | Task
        | undefined;
      if (task) {
        task.data.isCompleted = false;
      }
    },

    updateTaskAssignee: (
      state,
      action: PayloadAction<{ taskId: string; assignee: User }>
    ) => {
      const { taskId, assignee } = action.payload;
      const task = state.tasks.find((t: any) => t.id === taskId) as
        | Task
        | undefined;
      if (task) {
        task.data.assignee = assignee;
      }
    },

    updateTaskProgress: (
      state,
      action: PayloadAction<{ taskId: string; progress: Progress }>
    ) => {
      const { taskId, progress } = action.payload;
      const task = state.tasks.find((t: any) => t.id === taskId) as
        | Task
        | undefined;
      if (task) {
        task.data.progress = progress;
      }
    },

    captureIdeas: (
      state,
      action: PayloadAction<{ taskId: string; ideas: Idea[] }>
    ) => {
      const { taskId, ideas } = action.payload;
      const task = state.tasks.find((t: any) => t.id === taskId) as
        | Task
        | undefined;
      if (task) {
        task.data.ideas = ideas;
      }
    },

    // 1. Facilitate Ideation Phase

    startIdeationSession: (
      state: WritableDraft<TaskManagerState>,
      action: PayloadAction<User | null>
    ) => {
      // Destructure the payload from the action
      const { payload: currentUser } = action;

      const task: Task = {} as Task;

      // Function to create a new task for the ideation session
      const createNewTask = (): Task => {
        return {
          ...(task as WritableDraft<Task>),
          status: "pending", // Initial status of the task
          createdAt: new Date(),
          updatedAt: new Date(),
          comments: [],
          attachments: [],
          subtasks: [],
          project: null,
          phaseType: ProjectPhaseTypeEnum.Ideation,
          assignedUser: null,
          ideas: [],
        };
      };

      // Function to assign the task to the current user
      const assignTaskToCurrentUser = (
        task: Task,
        currentUser: User | null
      ) => {
        // Assuming there is a function or method to assign the task to the current user
        if (currentUser) {
          task.assignedUser = currentUser; // Assigning the task to the current user
        }
        return task;
      };
      let ideationTask = createNewTask();
      ideationTask = assignTaskToCurrentUser(ideationTask, currentUser);

      // Function to assign the task to a specific project
      const assignTaskToProject = (
        task: Task,
        project: Project | undefined
      ) => {
        // Assuming there is a function or method to assign the task to a specific project
        if (project) {
          task.project = project; // Assigning the task to the specified project
        }
        return task;
      };

      // Function to assign the task to the ideation phase within the project
      const assignTaskToIdeationPhase = (
        task: Task,
        phaseType: ProjectPhaseTypeEnum
      ) => {
        // Assuming there is a method or logic to assign the task to the ideation phase within the project
        task.phaseType = phaseType; // Assigning the task to the ideation phase
        return task;
      };

      // Function to assign the task to a specific phase within the project (e.g., ideation phase)
      const assignTaskToProjectPhase = (
        task: Task,
        phaseType: ProjectPhaseTypeEnum
      ) => {
        // Assuming there is a method or logic to assign the task to a specific phase within the project
        task.phaseType = phaseType; // Assigning the task to the specified phase
        return task;
      };

      const assignedTo = currentUser?._id; // Get the ID of the current user
      const projectId = state.projectManager?.currentProject; // Get the current project, safely checking for null
      const assignedTask = assignedTo
        ? assignTaskToCurrentUser(task, currentUser as User)
        : task; // Assign the task to the current user if assignedTo is not undefined
      const projectAssignedTask = projectId
        ? assignTaskToProject(assignedTask, projectId as Project)
        : assignedTask; // Assign the task to a specific project if projectId is not null
      const phaseAssignedTask = assignTaskToIdeationPhase(
        projectAssignedTask,
        ProjectPhaseTypeEnum.Ideation
      ); // Assign the task to the ideation phase within the project
      assignTaskToProjectPhase(
        phaseAssignedTask,
        ProjectPhaseTypeEnum.Ideation
      ); // Assign the task to a specific phase within the project (e.g., ideation phase)

      const captureIdeas = () => {
        // Implement logic to capture ideas
        return;
      };

      const collaborateOnIdeas = () => {
        // Implement logic to collaborate on ideas
      };

      // 2. Team Formation Phase
      const createTeam = () => {
        // Implement logic to create a team
      };
    },
  },
});

export const {
  completeTask,
  updateTaskTitle,
  updateTaskDescription,
  updateTaskStatus,
  addTask,
  removeTask,
  filterTasks,
  sortTasks,
  clearAllTasks,
  editTask,
  searchTasks,
  assignTask,
  archiveTask,
  undoAction,
  redoAction,
  exportTasks,
  importTasks,
  updateTaskDetails,

  updateTaskTags,
  updateTaskDueDate,
  updateTaskPriority,
  addTaskDependency,
  removeTaskDependency,
  addTaskComment,
  removeTaskComment,
  getTaskHistory,
  revertToPreviousState,
  markTaskComplete,
  markTaskPending,
  markTaskAsInProgress,
  updateTaskAssignee,
  batchFetchTaskSnapshots,
  updateTaskProgress,
  captureIdeas,
} = taskManagerSlice.actions;

// Export selector for accessing the tasks from the state
export const selectTasks = (state: { tasks: TaskManagerState }) =>
  state.tasks.tasks;

// Export reducer for the tracker entity slice
export default taskManagerSlice.reducer;
export type { TaskManagerState };
