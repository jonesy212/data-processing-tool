// TaskSlice.ts
import { updateTaskPositionAPI } from '@/app/api/TasksApi';
import { BaseDataEntity, DefaultMeta } from '@/app/config/BaseConfig';
import { Attachment } from '@/app/documents/attachment/Attachment';
import { TagEntity } from '@/app/typings/entities/TagEntity';
import { UserEntity } from '@/app/typings/entities/UserEntity';
import { User, UserAttachment, UserExcludedFields, UserIncludedFields, UserK, UserMeta } from '@/app/typings/entities/UserEntity';

import { ScheduledData } from "@/app/calendar/ScheduledData";
import { Task } from "@/app/components/models/tasks/Task";
import { NotificationTypeEnum } from '@/app/features/support/UnifiedNotificationTypes';
import { PriorityTypeEnum } from "@/app/models/data/StatusType";
import { Tag } from "@/app/models/tracker/Tag";
import { useNotification } from '@/app/state/context/NotificationContext';
import { WritableDraft } from "@/app/state/redux/ReducerGenerator";
import { AllStatus } from "@/app/state/stores/DetailsListStore";
import { MobXRootState } from "@/app/state/stores/RootStores";
import { TaskAttachment, TaskEntity, TaskExcludedFields, TaskIncludedFields, TaskK, TaskMeta } from "@/app/typings/entities/TaskEntity";
import {
  PayloadAction,
  ThunkAction,
  createSlice,
} from "@reduxjs/toolkit";
import { produce } from "immer";
import { updateTask } from "./CollaborationSlice";
// Inside the function where `notify` is used
const { notify } = useNotification();

interface TaskState<
  T extends BaseDataEntity = TaskEntity, 
  K extends T = T, 
  Meta extends DefaultMeta<T, K> = TaskMeta, 
  AttachmentType extends Attachment = TaskAttachment,
  ExcludedFields extends keyof T = TaskExcludedFields,
  IncludedFields extends keyof T = TaskIncludedFields
> {
  id: string;
  tasks: Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  loading: boolean;
  error: string | null;
  updateTaskTitle: (title: { id: string; title: string }) => void;
  deleteTask: (id: string) => void;
  taskTitle: string;
  taskDescription: string;
  status: AllStatus;
  dueDate: Date | null;
  priority: PriorityTypeEnum;
  taskStatus: AllStatus;
  entitiesLoaded: { [key: string]: Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> };
  tags: Tag<TagEntity>[];
  draggingTaskId: string | null;
}

interface ToggleTaskPayload {
  taskId: string;
}

const initialState: TaskState = {
  id: "",

  tasks: [],
  loading: false,
  error: null,
  updateTaskTitle:
    (title: { id: string; title: string }) => (dispatch: any) => {
      console.log(title);
      dispatch(updateTask(title));
    },

  deleteTask: function (id: string): void {
    console.log(id);
    console.log("delete task");
  },
  taskTitle: "",
  taskDescription: "",
  status: "",
  dueDate: null,
  priority: PriorityTypeEnum.Low,
  taskStatus: "",
  entitiesLoaded: {},
  tags: [],
  draggingTaskId: "",
};

export const updateTaskPositionAsync = (
  taskId: string,
  newPosition: { x: number; y: number },
): ThunkAction<void, MobXRootState, unknown, any> => {
  return async (dispatch) => {
    try {
      // Perform async operation (e.g., API call)
      // Replace with your actual API call logic
      // await taskApi.updateTaskPosition(taskId, newPosition);

    // Simulating API call success
    await updateTaskPositionAPI(
        taskId,
        newPosition,
        dispatch,
        () => notify({
          id: "taskPositionUpdated",
          message: `Task position updated successfully for task ${taskId}`,
          timestamp: new Date(),
          type: NotificationTypeEnum.SUCCESS,
          data: { additionalOptions: JSON.stringify(newPosition) }
        })
      );

      // Dispatch an action indicating success or update
      dispatch({ type: 'TASK_POSITION_UPDATED', payload: { taskId, newPosition } });
    } catch (error) {
      // Handle error, if any
      console.error('Error updating task position:', error);

      // Notify about the error
      notify({
        id: "taskPositionUpdateError",
        message: `Failed to update task position for task ${taskId}`,
        timestamp: new Date(),
        type: NotificationTypeEnum.ERROR,
        data: { additionalOptions: JSON.stringify(error) },
      });
    }
  };
};

export const filterTasks = async (
  state: WritableDraft<TaskState>,
  action: PayloadAction<{
    userId: { operation: string; value: string | number };
    query: { operation: string; value: string | number };
  }>
): Promise<{
  userId: {
    operation: string;
    value: string | number;
  };
  query: { operation: string; value: string | number };
}> => {
  const { userId, query } = action.payload;

  // You can adjust the logic here to use userId and query for filtering
  // For demonstration, assuming userId.operation and query.operation are not used in filtering
  // Only userId.value and query.value are used in filtering logic

  switch (userId.value) {
    case "all":
      break;
    case "completed":
      state.tasks = state.tasks.filter((task) => task.isComplete);
      break;
    case "active":
      state.tasks = state.tasks.filter((task) => !task.isComplete);
      break;
    default:
      console.error("Invalid filter:", userId.value);
      break;
  }
  // Add logic for query if necessary
  // Resolve the promise with the payload structure expected by handleFilterTasks
  return Promise.resolve({ userId, query });
};

type DraftableTask = WritableDraft<Omit<Task<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>, 'assignedTo' | 'scheduled'>> & {
  assignedTo: User<UserEntity, UserK, UserMeta, UserAttachment, UserExcludedFields, UserIncludedFields>[] | User<UserEntity, UserK, UserMeta, UserAttachment, UserExcludedFields, UserIncludedFields> | null;
  scheduled?: WritableDraft<ScheduledData>;
};


export const useTaskManagerSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    createTask: (state, action: PayloadAction<WritableDraft<Task<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>>>) => {
      state.tasks.push(action.payload);
    },

    fetchTasksRequest(state) {
      state.loading = true;
      state.error = null;
    },

    fetchTasksSuccess(
      state,
      action: PayloadAction<{ tasks: WritableDraft<Task<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>>[] }>
    ) {
      state.loading = false;
      state.tasks = action.payload.tasks;
      state.entitiesLoaded = {};
    
      state.tasks.forEach((task) => {
        state.entitiesLoaded[task.id] = task;
      });
    
      state.tasks.forEach((task) => {
        if (task.tags) {
          const tagArray = Array.isArray(task.tags)
            ? task.tags
            : Object.values(task.tags);
    
          tagArray.forEach((tag) => {
            let writableTag: WritableDraft<Tag<TagEntity>>;
    
            if (typeof tag === "string") {
              // Create a mock Tag object from string
              writableTag = {
                id: tag,
                display: "",
                getOptions: () => [],
                getId: () => tag,
                localeCompare: () => 0,
              } as unknown as WritableDraft<Tag<TagEntity>>;
            } else {
              // Use immer `produce` to create a writable draft
              writableTag = produce(tag, () => {}) as WritableDraft<Tag<TagEntity>>;
            }
    
            // Add if not already in tags
            if (!state.tags.some((existingTag) => existingTag.id === writableTag.id)) {
              state.tags.push(writableTag);
            }
          });
        }
      });
    },

    entitiesLoaded(
      state,
      action: PayloadAction<{ tasks: WritableDraft<Task<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>>[] }>
    ) {
      state.tasks = action.payload.tasks;
    },

    fetchTasksFailure(state, action: PayloadAction<{ error: string }>) {
      state.loading = false;
      state.error = action.payload.error;
    },

    addTask: (state, action: PayloadAction<WritableDraft<Task<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>>>) => {
      state.tasks.push(action.payload);
    },

    addTaskSuccess(state, action: PayloadAction<{ task: WritableDraft<Task<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>> }>) {
      state.tasks.push(action.payload.task);
    },

    addTaskFailure(state, action: PayloadAction<{ error: string }>) {
      state.error = action.payload.error;
    },

    removeTaskSuccess(state, action: PayloadAction<string>) {
      state.tasks = state.tasks.filter((task) => task.id !== action.payload);
    },

    removeTaskFailure(state, action: PayloadAction<{ error: string }>) {
      state.error = action.payload.error;
    },

    toggleTask(state, action: PayloadAction<ToggleTaskPayload>) {
      const taskId = action.payload;
      const taskIndex = state.tasks.findIndex(
        (task) => task.id === taskId.toString()
      );
      if (taskIndex !== -1) {
        state.tasks[taskIndex].isComplete = !state.tasks[taskIndex].isComplete;
      }
    },

    updateTaskTitle(
      state,
      action: PayloadAction<{ id: string; title: string }>
    ) {
      const { id, title } = action.payload;
      const taskIndex = state.tasks.findIndex((task) => task.id === id);
      if (taskIndex !== -1) {
        state.tasks[taskIndex].title = title;
      }
    },

    updateTaskDescription(
      state,
      action: PayloadAction<{ id: string; description: string }>
    ) {
      const { id, description } = action.payload;
      const taskIndex = state.tasks.findIndex((task) => task.id === id);
      if (taskIndex !== -1) {
        state.tasks[taskIndex].description = description;
      }
    },

    taskStatus(state, action: PayloadAction<{ id: string; status: string }>) {
      const { id, status } = action.payload;
      const taskIndex = state.tasks.findIndex((task) => task.id === id);
      if (taskIndex !== -1) {
        state.tasks[taskIndex].status = status;
        const taskToUpdate = state.tasks[taskIndex];
        if (taskToUpdate) {
          switch (status) {
            case "some_status":
              taskToUpdate.title = "Updated Title";
              taskToUpdate.description = "Updated Description";
              break;
            default:
              break;
          }
        }
      }
    },

    updateTaskStatus(
      state,
      action: PayloadAction<{ id: string; status: string }>
    ) {
      const { id, status } = action.payload;
      const taskIndex = state.tasks.findIndex((task) => task.id === id);
      if (taskIndex !== -1) {
        state.tasks[taskIndex].status = status;
      }
    },

    
    resizeTask(state, action: PayloadAction<{ task: Task<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>; newSize: number }>) {
      const { task, newSize } = action.payload;
      const index = state.tasks.findIndex((t) => t.id === task.id);

      if (index !== -1) {
        state.tasks[index] = produce(task, (draft: DraftableTask) => {
          draft.size = newSize;
        
          // Handle assignedTo
          if (task.assignedTo) {
            draft.assignedTo = Array.isArray(task.assignedTo)
              ? task.assignedTo.map((user) =>
                  produce(user, (userDraft) => userDraft) as WritableDraft<User<UserEntity, UserK, UserMeta, UserAttachment, UserExcludedFields, UserIncludedFields>>
                )
              : produce(task.assignedTo, (userDraft) => userDraft) as WritableDraft<User<UserEntity, UserK, UserMeta, UserAttachment, UserExcludedFields, UserIncludedFields>>;
          } else {
            draft.assignedTo = null;
          }
        
          // Handle scheduled
          if (task.scheduled) {
            draft.scheduled = produce(task.scheduled, (scheduledDraft) => {
              if (scheduledDraft.subtasks) {
                scheduledDraft.subtasks = scheduledDraft.subtasks.map((subtask) =>
                  produce(subtask, (subtaskDraft) => subtaskDraft) as WritableDraft<TodoImpl>
                );
              }
        
              if (scheduledDraft.actions) {
                scheduledDraft.actions = scheduledDraft.actions.map((action) =>
                  produce(action, (actionDraft) => actionDraft) as WritableDraft<Action>
                );
              }
            }) as WritableDraft<ScheduledData>;
          }
        });        
      }
    },
    
    startDragTask: (state, action: PayloadAction<string>) => {
      state.draggingTaskId = action.payload;
    },

    endDragTask: (state) => {
      state.draggingTaskId = null;
    },

    dropTask: (state, action: PayloadAction<{ taskId: string; newPosition: number }>) => {
      const { taskId, newPosition } = action.payload;
      const taskIndex = state.tasks.findIndex((task) => task.id === taskId);
      if (taskIndex !== -1) {
        // Ensure `position` is defined
        if (!state.tasks[taskIndex].position) {
          state.tasks[taskIndex].position = { x: 0, y: 0 }; // Initialize if undefined
        }
    
        // Update the position
        state.tasks[taskIndex].position.x = newPosition; // Update x or y as needed
      }
    },

    dragTask: (state, action: PayloadAction<{ taskId: string; newPosition: { x: number; y: number } }>) => {
      const { taskId, newPosition } = action.payload;
      const taskIndex = state.tasks.findIndex((task) => task.id === taskId);
      if (taskIndex !== -1) {
        // Ensure `position` is defined
        if (!state.tasks[taskIndex].position) {
          state.tasks[taskIndex].position = { x: 0, y: 0 }; // Initialize if undefined
        }
    
        // Update the position
        state.tasks[taskIndex].position = newPosition;
      }
    },

    moveTask(state, action: PayloadAction<{ taskId: string; newPosition: number }>) {
      const { taskId, newPosition } = action.payload;
      const taskIndex = state.tasks.findIndex((task) => task.id === taskId);
    
      if (taskIndex !== -1) {
        // Ensure `position` is defined
        if (!state.tasks[taskIndex].position) {
          state.tasks[taskIndex].position = { x: 0, y: 0 }; // Initialize if undefined
        }
    
        // Update the `x` coordinate (or `y` if needed)
        state.tasks[taskIndex].position = {
          ...state.tasks[taskIndex].position, // Preserve existing properties
          x: newPosition, // Update the `x` coordinate
        };
      }
    },

    updateTaskDetails(
      state,
      action: PayloadAction<{
        id: string;
        updates: {
          title?: string;
          description?: string;
        };
      }>
    ) {
      const { id, updates } = action.payload;
      const taskIndex = state.tasks.findIndex((task) => task.id === id);
      if (taskIndex !== -1) {
        if (updates.title) {
          state.tasks[taskIndex].title = updates.title;
        }
        if (updates.description) {
          state.tasks[taskIndex].description = updates.description;
        }
      }
    },

    updateTaskPosition(
      state,
      action: PayloadAction<{
        taskId: string;
        newPosition: { x: number; y: number }; // Explicitly define keys
      }>
    ) {
      const { taskId, newPosition } = action.payload;
      const taskIndex = state.tasks.findIndex((task) => task.id === taskId);

      if (taskIndex !== -1) {
        // Ensure `position` is defined
        if (!state.tasks[taskIndex].position) {
          state.tasks[taskIndex].position = { x: 0, y: 0 }; // Initialize if undefined
        }

        // Update position properties directly (no need for dynamic key access)
        state.tasks[taskIndex].position.x = newPosition.x;
        state.tasks[taskIndex].position.y = newPosition.y;

        // Log the updated task and its position
        console.log("Updated Task:", state.tasks[taskIndex]);
        console.log("New Position:", state.tasks[taskIndex].position);
        console.log("X Coordinate:", state.tasks[taskIndex].position.x);
        console.log("Y Coordinate:", state.tasks[taskIndex].position.y);
      } else {
        console.log("Task not found with ID:", taskId);
      }
    },

    completeTask(state, action: PayloadAction<string>) {
      const taskId = action.payload;
      const taskIndex = state.tasks.findIndex((task) => task.id === taskId);
      if (taskIndex !== -1) {
        state.tasks[taskIndex].isComplete = true;
      }
    },

    filterTasks(
      state,
      action: PayloadAction<{
        userId: { operation: string; value: string | number };
        query: { operation: string; value: string | number };
      }>
    ) {
      const { userId, query } = action.payload;

      // Filter tasks based on userId.value
      switch (userId.value) {
        case "all":
          state.tasks = state.tasks;
          break;
        case "completed":
          // Filter tasks to show only completed tasks
          state.tasks = state.tasks.filter((task) => task.isComplete);
          break;
        case "active":
          // Filter tasks to show only active tasks
          state.tasks = state.tasks.filter((task) => !task.isComplete);
          break;
        default:
          console.error("Invalid filter:", userId.value);
          break;
      }

      // Apply additional filtering based on query
      switch (query.operation) {
        case "equals":
          // Filter tasks where a specific property equals the query value
          state.tasks = state.tasks.filter(
            (task) => task.property && task.property === query.value
          );
          break;
        // Add more cases for other query operations if necessary
        default:
          console.error("Invalid query operation:", query.operation);
          break;
      }
    },

    markTaskComplete(state, action: PayloadAction<string>) {
      const taskId = action.payload;
      const taskIndex = state.tasks.findIndex((task) => task.id === taskId);
      if (taskIndex !== -1) {
        state.tasks[taskIndex].isComplete = true;
      }
    },

    markTaskAsInProgress(state, action: PayloadAction<string>) {
      const taskId = action.payload;
      const taskIndex = state.tasks.findIndex((task) => task.id === taskId);
      if (taskIndex !== -1) {
        state.tasks[taskIndex].status = "in_progress";
      }
    },

    taskTitle(state, action: PayloadAction<{ id: string; title: string }>) {
      const { id, title } = action.payload;
      const taskIndex = state.tasks.findIndex((task) => task.id === id);
      if (taskIndex !== -1) {
        state.tasks[taskIndex].title = title;
      }
    },

    removeTask(state, action: PayloadAction<string>) {
      const taskId = action.payload;
      state.tasks = state.tasks.filter((task) => task.id !== taskId);
    },

    selectTasks(state, action: PayloadAction<WritableDraft<Task<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>>[]>) {
      state.tasks = action.payload;
    },

    sortTasks(
      state,
      action: PayloadAction<{ field: string; order: "asc" | "desc" }>
    ) {
      const sortOrder = action.payload;
      state.tasks.sort((a, b) => {
        if (sortOrder.order === "asc") {
          return a.title.localeCompare(b.title);
        } else {
          return b.title.localeCompare(a.title);
        }
      });
    },
  },
});

export const {
  createTask,
  startDragTask,
  endDragTask,
  addTask,
  dropTask,
  dragTask,
  fetchTasksRequest,
  fetchTasksSuccess,
  fetchTasksFailure,
  moveTask,
  completeTask,
  removeTask,
  selectTasks,
  sortTasks,
  updateTaskStatus,
  resizeTask,
 
} = useTaskManagerSlice.actions;

export default useTaskManagerSlice.reducer;
export type { TaskState };
