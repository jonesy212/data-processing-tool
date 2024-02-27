import Milestone from "@/app/components/calendar/CalendarSlice";
import { Data } from "@/app/components/models/data/Data";
import { Task } from "@/app/components/models/tasks/Task";
import { Team } from "@/app/components/models/teams/Team";
import { Phase } from "@/app/components/phases/Phase";
import Project, { ProjectType } from "@/app/components/projects/Project";
import { User } from "@/app/components/users/User";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Snapshot } from "../../stores/SnapshotStore";
import { WritableDraft } from "../ReducerGenerator";
import { RootState } from "./RootSlice";

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
  name: "project",
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
      const index = state.projects.findIndex((p) => p.id === action.payload.id);
      if (index !== -1) {
        state.projects[index] = action.payload;
      }
    },
    deleteProject(state, action: PayloadAction<string>) {
      state.projects = state.projects.filter((p) => p.id !== action.payload);
    },

    assignUserToProject(
      state,
      action: PayloadAction<{
        projectId: WritableDraft<string>;
        userId: WritableDraft<User>;
      }>
    ) {
      const { projectId, userId } = action.payload;
      const projectIndex = state.projects.findIndex(
        (project) => project.id === projectId
      );
      if (projectIndex !== -1) {
        const updatedProjects = state.projects.map((project) => {
          if (project.id === projectId) {
            // Assuming 'assignUserToProject' adds the user ID to the project's members array
            return {
              ...project,
              members: [...project.members, userId],
            };
          }
          return project;
        });
        return { ...state, projects: updatedProjects };
      }
      return state;
    },

    removeUserFromProject(
      state,
      action: PayloadAction<{ projectId: string; userId: WritableDraft<User> }>
    ) {
      // Implement logic to remove a user from a project
      const { projectId, userId } = action.payload;
      const projectIndex = state.projects.findIndex(
        (project) => project.id === projectId
      );
      if (projectIndex !== -1) {
        const project = state.projects[projectIndex];
        // Assuming 'removeUserFromProject' removes the user ID from the project's members array
        project.members = project.members.filter(
          (memberId) => memberId !== userId
        );
        state.projects[projectIndex] = project;
      }
    },

    setProjectStatus(
      state,
      action: PayloadAction<{
        projectId: WritableDraft<string>;
        status: WritableDraft<"pending" | "inProgress" | "completed">;
      }>
    ) {
      // Implement logic to set the status of a project
      const { projectId, status } = action.payload;
      const projectIndex = state.projects.findIndex(
        (project) => project.id === projectId
      );
      if (projectIndex !== -1) {
        const project = state.projects[projectIndex];
        project.status = status;
        state.projects[projectIndex] = project;
      }
    },

    addTaskToProject(
      state,
      action: PayloadAction<{ projectId: string; task: WritableDraft<Task> }>
    ) {
      // Implement logic to add a task to a project
      const { projectId, task } = action.payload;
      const projectIndex = state.projects.findIndex(
        (project) => project.id === projectId
      );
      if (projectIndex !== -1) {
        const project = state.projects[projectIndex];
        project.tasks.push(task);
        state.projects[projectIndex] = project;
      }
    },

    removeTaskFromProject(
      state,
      action: PayloadAction<{ projectId: string; taskId: WritableDraft<Task> }>
    ) {
      // Implement logic to remove a task from a project
      const { projectId, taskId } = action.payload;
      const projectIndex = state.projects.findIndex(
        (project) => project.id === projectId
      );
      if (projectIndex !== -1) {
        const project = state.projects[projectIndex];
        project.tasks = project.tasks.filter(
          async (task) => task.id !== (await taskId)
        );
        state.projects[projectIndex] = project;
      }
    },

    updateTaskInProject(
      state,
      action: PayloadAction<{ projectId: string; task: WritableDraft<Task> }>
    ) {
      // Implement logic to update a task in a project
      const { projectId, task } = action.payload;
      const projectIndex = state.projects.findIndex(
        (project) => project.id === projectId
      );
      if (projectIndex !== -1) {
        const project = state.projects[projectIndex];
        const taskIndex = project.tasks.findIndex((t) => t.id === task.id);
        if (taskIndex !== -1) {
          project.tasks[taskIndex] = task;
          state.projects[projectIndex] = project;
        }
      }
    },

    createTeam(
      state,
      action: PayloadAction<{
        projectId: string;
        teamId: string;
        team: WritableDraft<Team>;
      }>
    ) {
      const { team, projectId } = action.payload;
      const projectIndex = state.projects.findIndex(
        (project) => project.id === projectId
      );
      if (projectIndex !== -1) {
        const project = state.projects[projectIndex];
        project.teams.push(team);
        state.projects[projectIndex] = project;
      }
    },

    deleteMilestone(state, action: PayloadAction<string>) {
      // Ensure state.project is not undefined
      const updatedProject: WritableDraft<Project> = state.project || {
        _id: '',
        id: '',
        name: '', // Add other required properties of Project type
        description: '',
        members: [],
        tasks: [],
        startDate: new Date(),
        endDate: null,
        isActive: false,
        leader: null,
        budget: null,
        phase: null,
        phases: {} as Phase[],
        currentPhase: null,
        type: ProjectType.Default,
        // Add other properties as needed
        milestones: {} as Milestone[],
        title: '',
        status: 'pending',
        tags: [],
        then: (callback: (newData: Snapshot<Data>) => void) => void

      //   then: (callback: (newData: Snapshot<Data>) => void) => void {
      //     // Subscribe to changes
      //     const: unsubscribe = db.collection(collection).onSnapshot((snapshot: Snapshot<Data>) => {
      //       const newData = snapshot.data.map((data: Snapshot<Data>) => ({
      //         id: data.id,
      //         ...data.data()
      //       }))
      //       callback(newData)
      //     })
      //   }
      // }
    
      //     // Unsubscribe on unmount
      //     return () => unsubscribe()
      //   },
        analysisType: '',
        analysisResults:'',
        videoUrl:'',
        videoThumbnail: '',
        videoDuration: '',
        videoData: {},
        ideas: {
          title: '',
          description: ''
        }
        // Ensure to include milestones as well
      }
      // Ensure id is always a string
      updatedProject.id = updatedProject.id || '', // Assign an empty string if id is undefined

      updatedProject.milestones = updatedProject.milestones.filter(
        (milestone: Milestone) => milestone.id !== action.payload
      );
      state.project = updatedProject;
    },

    createDeadline(
      state,
      action: PayloadAction<{ taskId: string; deadline: Date }>
    ) {
      const updatedProject = { ...state.project };
      const taskIndex = updatedProject.tasks?.findIndex(
        (task) => task.id === action.payload.taskId
      );
      if (taskIndex !== -1) {
        updatedProject.tasks?[taskIndex].deadline = action.payload.deadline;
      }
      state.project = updatedProject;
    },

    updateDeadline(
      state,
      action: PayloadAction<{ taskId: string; deadline: Date }>
    ) {
      const updatedProject = { ...state.project };
      const taskIndex = updatedProject.tasks.findIndex(
        (task) => task.id === action.payload.taskId
      );
      if (taskIndex !== -1) {
        updatedProject.tasks[taskIndex].deadline = action.payload.deadline;
      }
      state.project = updatedProject;
    },

    deleteDeadline(state, action: PayloadAction<string>) {
      const updatedProject = { ...state.project };
      const taskIndex = updatedProject.tasks.findIndex(
        (task) => task.id === action.payload
      );
      if (taskIndex !== -1) {
        updatedProject.tasks[taskIndex].deadline = null;
      }
      state.project = updatedProject;
    },

    // New reducers for additional methods
    getProjectDetails(state, action: PayloadAction<string>) {
      // Implement logic to retrieve detailed information about a specific project
      // You can fetch the project details from the backend using the provided project ID
      // For example, if you have an API endpoint to fetch project details by ID:
      const projectId = action.payload;
      const projectDetails = await fetchProjectDetails(projectId);
      state.project = projectDetails;
    },

    getProjectList(state) {
      // Implement logic to retrieve a list of all projects owned by the project owner
      // You can fetch the list of projects from the backend
      // For example, if you have an API endpoint to fetch all projects owned by the user:
      const projects = await fetchProjectList();
      state.projects = projects;
    },

    // New reducers for additional methods
    createMilestone(state, action: PayloadAction<WritableDraft<Milestone>>) {
      // Implement logic to create a milestone for tracking project progress
      // This could involve adding the new milestone to the project's milestones array
      const newMilestone = action.payload;
      state.project.milestones.push(newMilestone);
    },

    updateMilestone(state, action: PayloadAction<WritableDraft<Milestone>>) {
      // Implement logic to update the details of a milestone
      // This could involve finding the milestone in the project's milestones array and updating its properties
      const updatedMilestone = action.payload;
      const milestoneIndex = state.project.milestones.findIndex(
        (milestone) => milestone.id === updatedMilestone.id
      );
      if (milestoneIndex !== -1) {
        state.project.milestones[milestoneIndex] = updatedMilestone;
      }
    },

    // Define additional reducers as needed
  },
});

export const {
  //Project actions
  fetchProjectStart,
  fetchProjectSuccess,
  fetchProjectFailure,
  addProject,
  updateProject,
  deleteProject,

  // User Assignment
  assignUserToProject,
  removeUserFromProject,
  setProjectStatus,
  addTaskToProject,
  removeTaskFromProject,
  updateTaskInProject,

  // Action to create a team within a project
  createTeam,
  identifyTeamNeeds,
  defineJobRoles,
  createJobDescriptions,
  advertisePositions,
  reviewApplications,
  conductInterviews,
  assessCulturalFit,
  checkReferences,
  coordinateSelectionProcess,
  onboardNewTeamMembers,

  brainstormProduct, // Action to facilitate brainstorming sessions for the product
  launchProduct, // Action to mark the project as launched
  analyzeData, // Action to initiate data analysis for project insights
  rewardContributors, // Action to reward contributors based on their contributions to the project
  reinvestEarnings, // Action to reinvest a portion of earnings to bolster liquidity for the community coin
  buildCustomApp, // Action to initiate the development of a custom app for a client
  meetProjectMetrics, // Action to incentivize developers to meet project metrics within connected teams
  generateRevenue, // Action to generate revenue from client projects
  // Add other actions here

  // Community-based project features
  joinCommunityProject, // Action for users to join community-based projects
  promoteUnity, // Action to promote unity among project members
  shareProjectProgress, // Action to share project progress updates with the community
  celebrateMilestones, // Action to celebrate project milestones with the community
  provideFeedback, // Action for community members to provide feedback on projects

  // Collaboration project features
  inviteMembers, // Action to invite members to collaborate on a project
  assignTasks, // Action to assign tasks to project members
  scheduleMeetings, // Action to schedule meetings for project collaboration
  shareResources, // Action to share resources among project members
  trackProgress, // Action to track project progress collaboratively
  resolveConflicts, // Action to resolve conflicts among project members
  resolveBugs, // Action to resolve bugs among project members

  // Other features for strong project management
  conductSurveys, // Action to conduct surveys for project feedback and insights
  facilitateTraining, // Action to facilitate training sessions for project members
  provideMentorship, // Action to provide mentorship opportunities within projects
  ensureAccessibility, // Action to ensure accessibility features for all project members
  implementSecurityMeasures, // Action to implement security measures for project data
  ensurePrivacy, // Action to ensure privacy features for all project members
  implementDataProtection, // Action to implement data protection measures for project data

  //   Milestone and deadines:
  deleteMilestone,
  createDeadline,
  updateDeadline,
  deleteDeadline,
  getProjectDetails,
  getProjectList,
  createMilestone,
  updateMilestone,
  // Add other actions here
} = useProjectManagerSlice.actions;

// Export reducer
export default ProjectState;
useProjectManagerSlice.reducer;

// Selectors
export const selectProject = (state: RootState) =>
  state.useProjectManager.project;
export const selectProjects = (state: RootState) =>
  state.useProjectManager.projects;
export const selectProjectLoading = (state: RootState) =>
  state.useProjectManager.loading;
export const selectProjectError = (state: RootState) =>
  state.useProjectManager.error;
