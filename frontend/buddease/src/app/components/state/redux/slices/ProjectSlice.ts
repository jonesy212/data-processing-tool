import { Task } from '@/app/components/models/tasks/Task';
import Project from '@/app/components/projects/Project';
import { User } from '@/app/components/users/User';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { WritableDraft } from '../ReducerGenerator';
import { RootState } from './RootSlice';

interface ProjectState {
  project: Project | null;
  projects: Project[];
  loading: boolean;
  error: string | null;
}

const initialState: ProjectState = {
  project: null,
  projects: [],
  loading: false,
  error: null,
};

export const useProjectManagerSlice = createSlice({
  name: 'project',
  initialState,
  reducers: {
    fetchProjectStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchProjectSuccess(state, action: PayloadAction<WritableDraft<Project>>) {
      state.loading = false;
      state.project = action.payload;
    },
    fetchProjectFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
      },
    

      addProject(state, action: PayloadAction<WritableDraft<Project>>) {
        state.projects.push(action.payload);
      },
      updateProject(state, action: PayloadAction<WritableDraft<Project>>) {
        const index = state.projects.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.projects[index] = action.payload;
        }
      },
      deleteProject(state, action: PayloadAction<string>) {
        state.projects = state.projects.filter(p => p.id !== action.payload);
      },

      
      assignUserToProject(state, action: PayloadAction<{ projectId: WritableDraft<string>; userId: WritableDraft<User> }>) {
        const { projectId, userId } = action.payload;
        const projectIndex = state.projects.findIndex(project => project.id === projectId);
        if (projectIndex !== -1) {
            const updatedProjects = state.projects.map(project => {
                if (project.id === projectId) {
                    // Assuming 'assignUserToProject' adds the user ID to the project's members array
                    return {
                        ...project,
                        members: [...project.members, userId]
                    };
                }
                return project;
            });
            return { ...state, projects: updatedProjects };
        }
        return state;
    },
    
    removeUserFromProject(state, action: PayloadAction<{ projectId: string; userId: WritableDraft<User> }>) {
        // Implement logic to remove a user from a project
        const { projectId, userId } = action.payload;
        const projectIndex = state.projects.findIndex(project => project.id === projectId);
        if (projectIndex !== -1) {
            const project = state.projects[projectIndex];
            // Assuming 'removeUserFromProject' removes the user ID from the project's members array
            project.members = project.members.filter(memberId => memberId !== userId);
            state.projects[projectIndex] = project;
        }
    },
    
    setProjectStatus(state, action: PayloadAction<{ projectId: WritableDraft<string>; status: WritableDraft<"pending" | "inProgress" | "completed"> }>) {
        // Implement logic to set the status of a project
        const { projectId, status } = action.payload;
        const projectIndex = state.projects.findIndex(project => project.id === projectId);
        if (projectIndex !== -1) {
            const project = state.projects[projectIndex];
            project.status = status;
            state.projects[projectIndex] = project;
        }
    },
    
    addTaskToProject(state, action: PayloadAction<{ projectId: string; task: WritableDraft<Task> }>) {
        // Implement logic to add a task to a project
        const { projectId, task } = action.payload;
        const projectIndex = state.projects.findIndex(project => project.id === projectId);
        if (projectIndex !== -1) {
            const project = state.projects[projectIndex];
            project.tasks.push(task);
            state.projects[projectIndex] = project;
        }
    },
    
    removeTaskFromProject(state, action: PayloadAction<{ projectId: string; taskId: WritableDraft<Task> }>) {
        // Implement logic to remove a task from a project
        const { projectId, taskId } = action.payload;
        const projectIndex = state.projects.findIndex(project => project.id === projectId);
        if (projectIndex !== -1) {
            const project = state.projects[projectIndex];
            project.tasks = project.tasks.filter(async task => task.id !== await taskId);
            state.projects[projectIndex] = project;
        }
    },
    
    updateTaskInProject(state, action: PayloadAction<{ projectId: string; task: WritableDraft<Task> }>) {
        // Implement logic to update a task in a project
        const { projectId, task } = action.payload;
        const projectIndex = state.projects.findIndex(project => project.id === projectId);
        if (projectIndex !== -1) {
            const project = state.projects[projectIndex];
            const taskIndex = project.tasks.findIndex(t => t.id === task.id);
            if (taskIndex !== -1) {
                project.tasks[taskIndex] = task;
                state.projects[projectIndex] = project;
            }
        }
    }
    
    // Define additional reducers as needed
  },
});

// Export actions
export const {
    fetchProjectStart,
    fetchProjectSuccess,
    fetchProjectFailure,
    addProject,
    updateProject,
    deleteProject,

    // Add other actions here
    assignUserToProject,
    removeUserFromProject,
    setProjectStatus,
    addTaskToProject,
    removeTaskFromProject,
    updateTaskInProject,
  // Add other actions here
} = useProjectManagerSlice.actions;

// Export reducer
export default useProjectManagerSlice.reducer;

// Selectors
export const selectProject = (state: RootState) => state.useProjectManager.project;
export const selectProjects = (state: RootState) => state.useProjectManager.projects;
export const selectProjectLoading = (state: RootState) => state.useProjectManager.loading;
export const selectProjectError = (state: RootState) => state.useProjectManager.error;
