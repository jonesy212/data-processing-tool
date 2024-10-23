// ProjectOwnerSlice.ts

import { TeamMember } from '@/app/components/models/teams/TeamMembers';
import { Project } from '@/app/components/projects/Project';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
 
interface ProjectOwnerState {
  projects: Project[];
  teamMembers: TeamMember[];
  // Add more state properties as needed
}

const initialState: ProjectOwnerState = {
  projects: [],
  teamMembers: [],
  // Initialize other state properties
};

const projectOwnerSlice = createSlice({
  name: 'projectOwner',
  initialState,
  reducers: {
    createProjectRequest: (state, action: PayloadAction<Project>) => {
      // Add logic for handling create project request
    },
    createProjectSuccess: (state, action: PayloadAction<Project>) => {
      // Add logic for handling create project success
    },
    createProjectFailure: (state, action: PayloadAction<{error: string}>) => {
      // Add logic for handling create project failure
    },
    // Add more reducers for updating and managing project owner state
  },
});

export const { createProjectRequest, createProjectSuccess, createProjectFailure } = projectOwnerSlice.actions;
export default projectOwnerSlice.reducer;
