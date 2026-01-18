// RootSlice.ts

import type { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import type { Attachment } from '@/core/documents/attachment/Attachment';
import type { PagingState } from '@/core/pages/Paging';
import type { CalendarManagerState } from '@/core/state/redux/slices//CalendarSlice';
import type { ApiManagerState } from '@/core/state/redux/slices/ApiSlice';
import type { BlogState } from '@/core/state/redux/slices/BlogSlice';
import type { CollaborationState } from '@/core/state/redux/slices/CollaborationSlice';
import type { DataSliceState } from '@/core/state/redux/slices/DataSlice';
import type { DocumentSliceState } from '@/core/state/redux/slices/DocumentSlice';
import type { DrawingState } from '@/core/state/redux/slices/DrawingSlice';
import type { EventState } from '@/core/state/redux/slices/EventSlice';
import type { NotificationState } from '@/core/state/redux/slices/NotificationSlice';
import type { ProjectOwnerState } from '@/core/state/redux/slices/ProjectOwnerSlice';
import type { ProjectState } from '@/core/state/redux/slices/ProjectSlice';
import type { RandomWalkState } from '@/core/state/redux/slices/RandomWalkManagerSlice';
import type { RealtimeDataState } from '@/core/state/redux/slices/RealtimeDataSlice';
import type { EntityId } from '@/core/state/redux/slices/RootSlice';
import type { SettingsState } from '@/core/state/redux/slices/SettingsSlice';
import type { TaskState } from '@/core/state/redux/slices/TaskSlice';
import type { AlignmentOptions } from '@/core/state/redux/slices/toolbarSlice';
import type { TrackerManagerState } from '@/core/state/redux/slices/TrackerSlice';
import type { VersionState } from '@/core/state/redux/slices/VersionSlice';
import type { VideoState } from '@/core/state/redux/slices/VideoSlice';
import type { ToolbarState } from '@/core/state/stores/ToolbarStore';
import type { UIState } from '@/core/state/stores/UISlice';
import type { TodoManagerState } from '@/core/todos/Todo';
import type { DataAnalysisState } from '@/core/typings/phases/dataAnalysisTypes';
import { createAction, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";

// Import your AppTask / TaskCollection types (6-param)
import type { UserManagerState } from "@/core/state/redux/slices//UserSlice";
import type { AuthState } from '@/core/state/redux/slices/AuthSlice';
import type { FilteredEventsState } from "@/core/state/stores/FilterStore";
import type { DrawingAttachment, DrawingEntity, DrawingExcludedFields, DrawingIncludedFields, DrawingK, DrawingMeta } from '@/core/typings/entities/DrawingEntity';
import { AppTask, TaskCollection } from "@/core/typings/entities/TaskEntity";
/** Task payloads */
type NewTaskPayload = Partial<AppTask> & { title: string };
type UpdateTaskPayload = { id: string; patch: Partial<AppTask> };
type ReorderPayload = { from: number; to: number };

interface TaskManagerState {
  tasks: TaskCollection;
}

export interface RootState<
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  
  // Auth
  authManager: AuthState<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  // User & UI
  user: UserManagerState;
  // Video & UI Management
  videoState: VideoState;
  toolbarManager: ToolbarState;
  selectedToolBar: AlignmentOptions | null;
  uiManager: UIState;

  // Project Management
  projectManager: ProjectState;
  taskManager: TaskState;
  trackerManager: TrackerManagerState;
  userManager: UserManagerState;
  teamManager: TrackerManagerState;
  projectOwner: ProjectOwnerState;

  // Data Management
  dataManager: DataSliceState;
  dataAnalysisManager: DataAnalysisState;
  calendarManager: CalendarManagerState;
  todoManager: TodoManagerState<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  documentManager: DocumentSliceState<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>

  // API & Networking
  apiManager: ApiManagerState;
  realtimeManager: RealtimeDataState;

  // Event & Collaboration
  eventManager: EventState;
  collaborationManager: CollaborationState<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;

  // Entity & Notification
  entityManager: EntityState<any, EntityId>;
  notificationManager: NotificationState;

  // Settings & Utilities
  settingsManager: SettingsState;
  videoManager: VideoState;
  randomWalkManager: RandomWalkState;
  pagingManager: PagingState;
  blogManager: BlogState;
  drawingManager: DrawingState<
    DrawingEntity,
    DrawingK,
    DrawingMeta,
    DrawingAttachment,
    DrawingExcludedFields,
    DrawingIncludedFields
  >;
  versionManager: VersionState;

  // Existing properties
  filterManager: FilteredEventsState<
    T,
    K,
    Meta,
    AttachmentType,
    ExcludedFields,
    IncludedFields
  >;
}


const initialState: TaskManagerState = {
  tasks: [],
};

/** Generic actions (can be dispatched externally) */
export const setTasks = createAction<TaskCollection>("taskManager/setTasks");
export const addTaskAction = createAction<NewTaskPayload>("taskManager/addTaskAction");
export const deleteTaskAction = createAction<{ id: string }>("taskManager/deleteTaskAction");
export const updateTaskAction = createAction<UpdateTaskPayload>("taskManager/updateTaskAction");
export const reorderTaskAction = createAction<ReorderPayload>("taskManager/reorderTaskAction");
export const clearTasks = createAction("taskManager/clearTasks");

const rootSlice = createSlice({
  name: "taskManager",
  initialState,
  reducers: {
    // local reducer mirrors actions for convenience
    setTasksLocal(state, action: PayloadAction<TaskCollection>) {
      state.tasks = action.payload;
    },
    addTaskLocal(state, action: PayloadAction<NewTaskPayload>) {
      const id = uuidv4();
      const now = new Date().toISOString();
      const newTask: AppTask = {
        id,
        title: action.payload.title,
        description: action.payload.description ?? "",
        assignedTo: action.payload.assignedTo ?? [],
        dueDate: action.payload.dueDate ? new Date(action.payload.dueDate) : new Date(),
        status: (action.payload.status as any) ?? "pending",
        priority: (action.payload.priority as any) ?? "medium",
        estimatedHours: action.payload.estimatedHours ?? 0,
        actualHours: action.payload.actualHours ?? 0,
        startDate: action.payload.startDate ?? null,
        completionDate: action.payload.completionDate ?? null,
        endDate: action.payload.endDate ?? null,
        isActive: action.payload.isActive ?? true,
        tags: action.payload.tags ?? [],
        dependencies: action.payload.dependencies ?? [],
        then: (cb: (t: AppTask) => void) => { cb(newTask); return newTask as any; },
        previouslyAssignedTo: action.payload.previouslyAssignedTo ?? [],
        done: action.payload.done ?? false,

        assigneeId: action.payload.assigneeId,
        data: action.payload.data,
        progress: action.payload.progress,
        getData: action.payload.getData,

        source: action.payload.source,
        date: action.payload.date,
        major: action.payload.major,
        minor: action.payload.minor,

        participants: action.payload.participants,
        uploadedAt: action.payload.uploadedAt,
        phase: action.payload.phase,
        phaseName: action.payload.phaseName,

        isCompleted: action.payload.isCompleted,
        label: action.payload.label,

        // Add any other AppTask fields your TaskEntity defines...
      } as AppTask;
      state.tasks.unshift(newTask);
    },
    deleteTaskLocal(state, action: PayloadAction<{ id: string }>) {
      state.tasks = state.tasks.filter((t) => t.id !== action.payload.id);
    },
    updateTaskLocal(state, action: PayloadAction<UpdateTaskPayload>) {
      const task = state.tasks.find((t) => t.id === action.payload.id)
      //  as WritableDraft<AppTask> | undefined;
      if (task) {
        Object.assign(task, action.payload.patch);
      }
    },
    reorderTaskLocal(state, action: PayloadAction<ReorderPayload>) {
      const { from, to } = action.payload;
      const tasks = state.tasks;
      if (from < 0 || to < 0 || from >= tasks.length || to >= tasks.length) return;
      const [item] = tasks.splice(from, 1);
      tasks.splice(to, 0, item);
      state.tasks = [...tasks];
    },
    clearTasksLocal(state) {
      state.tasks = [];
    },
  },
  extraReducers: (builder) => {
    builder.addCase(setTasks, (state, action) => {
      state.tasks = action.payload;
    });
    builder.addCase(addTaskAction, (state, action) => {
      // reuse local add
      rootSlice.caseReducers.addTaskLocal(state, action as any);
    });
    builder.addCase(deleteTaskAction, (state, action) => {
      rootSlice.caseReducers.deleteTaskLocal(state, action as any);
    });
    builder.addCase(updateTaskAction, (state, action) => {
      rootSlice.caseReducers.updateTaskLocal(state, action as any);
    });
    builder.addCase(reorderTaskAction, (state, action) => {
      rootSlice.caseReducers.reorderTaskLocal(state, action as any);
    });
    builder.addCase(clearTasks, (state) => {
      state.tasks = [];
    });
  },
});

export const {
  setTasksLocal,
  addTaskLocal,
  deleteTaskLocal,
  updateTaskLocal,
  reorderTaskLocal,
  clearTasksLocal,
} = rootSlice.actions;

export default rootSlice.reducer;
