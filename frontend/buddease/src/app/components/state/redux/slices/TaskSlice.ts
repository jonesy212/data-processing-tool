// TaskSlice.ts
import { Idea, tasksDataSource } from "../../../models/tasks/Task";

import useWebNotifications from "@/app/components/hooks/commHooks/useWebNotifications";
import { TaskLogger } from "@/app/components/logging/Logger";
import { Data } from "@/app/components/models/data/Data";
import { Progress } from "@/app/components/models/tracker/ProgressBar";
import Project from "@/app/components/projects/Project";
import { sanitizeInput } from "@/app/components/security/SanitizationFunctions";
import { NotificationTypeEnum, useNotification } from "@/app/components/support/NotificationContext";
import NOTIFICATION_MESSAGES from "@/app/components/support/NotificationMessages";
import { Comment } from "@/app/components/todos/Todo";
import { User } from "@/app/components/users/User";
import { VideoData } from "@/app/components/video/Video";
import { generateNewTask } from "@/app/generators/GenerateNewTask";
import UniqueIDGenerator from "@/app/generators/GenerateUniqueIds";
import { NamingConventionsError } from "@/app/shared/shared-error-handling";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import FileSaver from "file-saver";
import * as Papa from "papaparse";
import * as XLSX from "xlsx";
import { Task, TaskDetails } from "../../../models/tasks/Task";
import { userManagerStore } from "../../stores/UserStore";
import { WritableDraft } from "../ReducerGenerator";
import { useProjectManagerSlice } from "./ProjectSlice";

const { notify } = useNotification();
const { showNotification } = useWebNotifications();

interface TaskManagerState extends Task {
  tasks: Task[];
  actionStack: Task[];
  redoStack: Task[];
  taskTitle: string;
  taskDescription: string;
  taskStatus: "pending" | "inProgress" | "completed";
  priority: "low" | "medium" | "high";

  pendingTasks: []; // Initialize pendingTasks array
  inProgressTasks: []; // Initialize inProgressTasks array
  completedTasks: []; // Initialize completedTasks array
}

const tasks: Record<string, Task> = { ...tasksDataSource };
const initialState: TaskManagerState = {
  tasks: [],
  taskTitle: "",
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
  assignedTo: null,
  assigneeId: "",
  dueDate: new Date(),
  payload: undefined,
  type: "addTask",
  status: "pending",
  previouslyAssignedTo: [],
  done: false,
  data: {} as Data, 
  source: "user",
  some: function (callbackfn: (value: Task, index: number, array: Task[]) => unknown, thisArg?: any): boolean {
    throw new Error("Function not implemented.");
  },
  then: function (arg0: (newTask: any) => void): unknown {
    throw new Error("Function not implemented.");
  },
  startDate: undefined,
  endDate: new Date(),
  isActive: false,
  tags: [],
  analysisType: "",
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
  ideas: []
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

    addTask: (state, action: PayloadAction<{ id: string; title: string }>) => {
      const { id, title } = action.payload;
      // Generate a unique ID for the new task
      const generateTaskId = new UniqueIDGenerator();
      const generatedTaskID = generateTaskId.generateTaskID(id, title);

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
          "Could not find task to complete.",
          NOTIFICATION_MESSAGES.Notifications.DEFAULT,
          new Date(),
          NotificationTypeEnum.Error
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
          task.status.toLowerCase() === keyword
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
          return a.status.localeCompare(b.status); // Sort by task status
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
        const generateTaskId = new UniqueIDGenerator();
        const generatedTaskID = UniqueIDGenerator.generateTaskID(
          taskToDuplicate.title,
          taskToDuplicate.description
        );
        const duplicatedTask = { ...taskToDuplicate, id: generatedTaskID }; // Generate a new unique ID for the duplicated task
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
          task.status.toLowerCase().includes(searchQuery)
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
            new Date(),
            NotificationTypeEnum.Error
          );
        } else {
          // Handle other types of errors
          console.error("Export error:", error.message);
          // You can also dispatch an action or display a notification to inform the user about the error
          notify(
            "Export Error",
            `An error occurred while exporting tasks. Please try again later.`,
            new Date(),
            NotificationTypeEnum.Error
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
      action: PayloadAction<{ taskId: string; comment: WritableDraft<Comment> }>
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

    startIdeationSession: () => {
      // Function to create a new task for the ideation session
      const createNewTask = () => {
        return {
          id: "unique_task_id", // Generate a unique task ID
          title: "Ideation Session Task", // Title for the ideation session task
          description: "Task created for the ideation session", // Description for the task
          status: "pending", // Initial status of the task
        };
      };

      // Function to assign the task to the current user
      const assignTaskToCurrentUser = (task: Task, currentUser: User) => {
        // Assuming there is a function or method to assign the task to the current user
        task.assignedUser = currentUser; // Assigning the task to the current user
        return task;
      };

   
      const newTask = createNewTask(); 
      const currentUser = userManagerStore()
      const project = useProjectManagerSlice().currentProject;
      const assignedTask = useProjectManagerSlice.assignTaskToCurrentUser(newTask as Task, currentUser); // Assign the task to the current user
      const projectAssignedTask = useProjectManagerSlice.assignTaskToProject(project, assignedTask); // Assign the task to a specific project
      const phaseAssignedTask = useProjectManagerSlice.assignTaskToIdeationPhase(projectAssignedTask); // Assign the task to the ideation phase within the project
      useProjectManagerSlice.assignTaskToProjectPhase(phaseAssignedTask); // Assign the task to a specific phase within the project (e.g., ideation phase)
    

      // Function to assign the task to a specific project
      const assignTaskToProject = (task: Task, project: Project) => {
        // Assuming there is a function or method to assign the task to a specific project
        task.project = project; // Assigning the task to the specified project
        return task;
      };

      // Function to assign the task to the ideation phase within the project
      const assignTaskToIdeationPhase = (task: Task) => {
        // Logic to assign the task to the ideation phase within the project goes here.
        return task; // Placeholder return for demonstration
      };

      // Function to assign the task to a specific phase within the project (e.g., ideation phase)
      const assignTaskToProjectPhase = (task: Task) => {
        // Logic to assign the task to a specific phase within the project goes here.
      };

      const captureIdeas = () => {
        // Implement logic to capture ideas
        return;
      };

      const collaborateOnIdeas = () => {
        // Implement logic to collaborate on ideas
      };

      // 2. Team Formation Phase
      const createTeam: () => {
        // Implement logic to create a team
      };

      const inviteTeamMembers: () => {
        // Implement logic to invite team members
      };

      const manageTeamMembers: () => {
        // Implement logic to manage team members
      };

      // 3. Product Brainstorming Phase
      const conductBrainstormingSessions: () => {
        // Implement logic to conduct brainstorming sessions
      };

      const collectFeedback: () => {
        // Implement logic to collect feedback
      };

      const iterateOnProductConcepts: () => {
        // Implement logic to iterate on product concepts
      };

      // 4. Launch Process Phase
      const planLaunchStrategy: () => {
        // Implement logic to plan launch strategy
      };

      const coordinateLaunchActivities: () => {
        // Implement logic to coordinate launch activities
      };

      const monitorLaunchProgress: () => {
        // Implement logic to monitor launch progress
      };

      // 5. Data Analysis Phase
      const collectData: () => {
        // Implement logic to collect data
      };

      const analyzeData: () => {
        // Implement logic to analyze data
      };

      const iterativeImprovements: () => {
        // Implement logic for iterative improvements
      };

      // 6. Community Engagement
      const communityDiscussions: () => {
        // Implement logic for community discussions
      };

      const communityEvents: () => {
        // Implement logic for community events
      };

      const recognizeContributions: () => {
        // Implement logic to recognize contributions
      };

      // 7. Platform Maintenance
      const bugReporting: () => {
        // Implement logic for bug reporting
      };

      const featureRequests: () => {
        // Implement logic for feature requests
      };

      const platformUpdates: () => {
        // Implement logic for platform updates
      };

      // 8. User Support
      const helpDesk: () => {
        // Implement logic for help desk
      };

      const knowledgeBase: () => {
        // Implement logic for knowledge base
      };

      const userTraining: () => {
        // Implement logic for user training
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
