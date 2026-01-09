ProjectManagerSlice.ts
import { Task } from "@/core/components/models/tasks/Task";
import type { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import { NotificationData } from '@/core/hooks/useNotificationSystem';
import { Project } from '@/core/models/projects/Project';
import { Progress } from "@/core/models/tracker/ProgressBar";
import { useNotification } from '@/core/state/context/NotificationContext';
import Milestone from "@/core/state/redux/slices/CalendarSlice";
import { ProjectState } from "@/core/state/redux/slices/ProjectSlice";
import type { ProjectManagementAttachment, ProjectManagementEntity, ProjectManagementExcludedFields, ProjectManagementIncludedFields, ProjectManagementK, ProjectManagementMeta } from '@/core/typings/entities/ProjectManagementEntity';
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import type { Attachment } from '@/core/documents/attachment/Attachment';

// Define and export the Notification type

interface ProjectManagerState<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>  extends ProjectState {
  tasks: Record<string, Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;
  milestones: Record<string, Milestone>;
  notifications: Record<string, NotificationData>;
  loading: boolean;
  progress: Progress;
}

const initialState: ProjectManagerState = {
  projects: [],
  tasks: {} as Record<string, Task<ProjectManagementEntity, ProjectManagementK, ProjectManagementMeta, ProjectManagementAttachment, ProjectManagementExcludedFields, ProjectManagementIncludedFields>>,
  milestones: {},
  notifications: {},
  loading: false,
  progress: {
    id: "default",
    value: 0,
    label: "",
    current: 0,
    max: 100,
    percentage: 0,
    name: '',
    color: '',
    description: '',
    min: '',
    done: '',
  },
  project: null,
  error: null,
  currentProject: null,
  selectedProject: null,
  projectFeedback: null,
};

const { notify } = useNotification();

export const projectManagerSlice = createSlice({
  name: "projectManager",
  initialState,
  reducers: {
    // Placeholder actions for project management
    addProject: (state, action: PayloadAction<Project>) => {
      // Add logic to add a project here
    },
    removeProject: (state, action: PayloadAction<string>) => {
      // Add logic to remove a project here
    },
    updateProject: (state, action: PayloadAction<Project>) => {
      // Add logic to update a project here
    },
    addTask: (state, action: PayloadAction<Task<ProjectManagementEntity, ProjectManagementK, ProjectManagementMeta, ProjectManagementAttachment, ProjectManagementExcludedFields, ProjectManagementIncludedFields>>) => {
      // Add logic to add a task here
    },
    removeTask: (state, action: PayloadAction<string>) => {
      // Add logic to remove a task here
    },
    updateTask: (state, action: PayloadAction<Task<ProjectManagementEntity, ProjectManagementK, ProjectManagementMeta, ProjectManagementAttachment, ProjectManagementExcludedFields, ProjectManagementIncludedFields>>) => {
      // Add logic to update a task here
    },
    addMilestone: (state, action: PayloadAction<Milestone>) => {
      // Add logic to add a milestone here
    },
    removeMilestone: (state, action: PayloadAction<string>) => {
      // Add logic to remove a milestone here
    },
    updateMilestone: (state, action: PayloadAction<Milestone>) => {
      // Add logic to update a milestone here
    },
    // Add other actions as needed
  },
});

export const {
  addProject,
  removeProject,
  updateProject,
  addTask,
  removeTask,
  updateTask,
  addMilestone,
  removeMilestone,
  updateMilestone,
} = projectManagerSlice.actions;

export const selectProjects = (state: {
  projectManager: ProjectManagerState;
}) => state.projectManager.projects;

export const selectTasks = (state: { projectManager: ProjectManagerState }) =>
  state.projectManager.tasks;

export const selectMilestones = (state: {
  projectManager: ProjectManagerState;
}) => state.projectManager.milestones;

export const selectNotifications = (state: {
  projectManager: ProjectManagerState;
}) => state.projectManager.notifications;

export default projectManagerSlice.reducer;
