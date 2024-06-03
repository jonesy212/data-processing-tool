import Milestone from "@/app/components/calendar/CalendarSlice";
import { Task } from "@/app/components/models/tasks/Task";
import {Project} from "@/app/components/projects/Project";
import { NotificationData } from "@/app/components/support/NofiticationsSlice";
import { useNotification } from "@/app/components/support/NotificationContext";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {ProjectState} from "./ProjectSlice";
import { Progress } from "@/app/components/models/tracker/ProgressBar";

// Define and export the Notification type

interface ProjectManagerState extends ProjectState {
  tasks: Record<string, Task>;
  milestones: Record<string, Milestone>;
  notifications: Record<string, NotificationData>;
  loading: boolean;
  progress: Progress;
}

const initialState: ProjectManagerState = {
  projects: [],
  tasks: {} as Record<string, Task>,
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
    addTask: (state, action: PayloadAction<Task>) => {
      // Add logic to add a task here
    },
    removeTask: (state, action: PayloadAction<string>) => {
      // Add logic to remove a task here
    },
    updateTask: (state, action: PayloadAction<Task>) => {
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
