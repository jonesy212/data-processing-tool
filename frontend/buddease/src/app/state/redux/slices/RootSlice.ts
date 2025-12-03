
// RootSlice.ts
import { BaseDataRoot } from '@/app/config/BaseConfig';
import { VersionState } from '@/app/state/redux/slices/VersionSlice';
import { DrawingState } from '@/app/state/redux/slices/DrawingSlice';
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { ProjectOwnerState } from '@/app/state/redux/slices/ProjectOwnerSlice'
import { Attachment } from '@/app/documents/attachment/Attachment';
import { BlogState } from '@/app/state/redux/slices/BlogSlice';
import { PagingState } from '@/app/pages/Paging';
import { RandomWalkState } from '@/app/state/redux/slices/RandomWalkManagerSlice';
import { SettingsState } from '@/app/state/redux/slices/SettingsSlice';
import { NotificationState } from '@/app/state/redux/slices/NotificationSlice';
import EntityId from '@/app/state/redux/slices/RootSlice';
import { CollaborationState } from '@/app/state/redux/slices/CollaborationSlice';
import { EventState } from '@/app/state/redux/slices/EventSlice';
import { RealtimeDataState } from '@/app/state/redux/slices/RealtimeDataSlice';
import { ApiManagerState } from '@/app/state/redux/slices/ApiSlice';
import { DocumentSliceState } from '@/app/state/redux/slices/DocumentSlice';
import { TodoManagerState } from '@/app/todos/Todo';
import { CalendarManagerState } from '@/app/state/redux/slices//CalendarSlice';
import { DataAnalysisState } from '@/app/typings/phases/dataAnalysisTypes';
import { DataSliceState } from '@/app/state/redux/slices/DataSlice';
import { TrackerManagerState } from '@/app/state/redux/slices/TrackerSlice';
import { TaskState } from '@/app/state/redux/slices/TaskSlice';
import { ProjectState } from '@/app/state/redux/slices/ProjectSlice';
import { UIState } from '@/app/state/stores/UISlice';
import { AlignmentOptions } from '@/app/state/redux/slices/toolbarSlice';
import { VideoState } from '@/app/state/redux/slices/VideoSlice';
import { ToolbarState } from '@/app/state/stores/ToolbarStore';
import { createSlice, createAction, PayloadAction } from "@reduxjs/toolkit";
import { WritableDraft } from "immer";
import { v4 as uuidv4 } from "uuid";

// Import your AppTask / TaskCollection types (6-param)
import { AppTask, TaskCollection } from "@/app/typings/entities/TaskEntity";
import { FilteredEventsState } from "@/app/state/stores/FilterStore";
import { UserManagerState } from "@/app/state/redux/slices//UserSlice";
import { DrawingEntity, DrawingK, DrawingMeta, DrawingAttachment, DrawingExcludedFields, DrawingIncludedFields } from '@/app/typings/entities/DrawingEntity'

/** Task payloads */
type NewTaskPayload = Partial<AppTask> & { title: string };
type UpdateTaskPayload = { id: string; patch: Partial<AppTask> };
type ReorderPayload = { from: number; to: number };

interface TaskManagerState {
  tasks: TaskCollection;
}

export interface RootState<
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
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
  todoManager: TodoManagerState;
  documentManager: DocumentSliceState<DocumentEntity, DocumentK, DocumentMeta>;

  // API & Networking
  apiManager: ApiManagerState;
  realtimeManager: RealtimeDataState;

  // Event & Collaboration
  eventManager: EventState;
  collaborationManager: CollaborationState<
    UserProfile<UserEntity, UserK, UserMeta, UserAttachment, UserExcludedFields, UserIncludedFields>,
    ProjectData
  >;

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
      const task = state.tasks.find((t) => t.id === action.payload.id) as WritableDraft<AppTask> | undefined;
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
