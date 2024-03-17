import Milestone from "@/app/components/calendar/CalendarSlice";
import { Data } from "@/app/components/models/data/Data";
import { Task } from "@/app/components/models/tasks/Task";
import { Phase } from "@/app/components/phases/Phase";
import { Project } from "@/app/components/projects/Project";
import { User } from "@/app/components/users/User";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Snapshot } from "../../stores/SnapshotStore";
import { WritableDraft } from "../ReducerGenerator";
import { RootState } from "./RootSlice";
import Team from "@/app/components/models/teams/Team";
import { Member } from "@/app/components/models/teams/TeamMembers";
import { VideoData } from "@/app/components/video/Video";
import { ProjectActions } from '../../../actions/ProjectActions';
import { useDispatch } from "react-redux";
import { ProjectDetails } from "@/app/components/models/data";
import { StatusType } from "@/app/components/models/data/StatusType";
import ProjectList from '../../../lists/ProjectList';
import ProjectService, { projectService } from "@/app/api/ProjectService";
import { handleApiError } from "@/app/api/ApiLogs";
import { IdentifiedNeed } from "@/app/components/projects/IdentifiedNeed";
import { Product } from "@/app/components/products/Product";
import { JobRole } from "@/app/components/users/UserRoles";
import { JobDescription } from "@/app/components/projects/JobDescription";
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



interface YourStateType {
  projects: Project[];
}



function createUpdatedProject(payload: WritableDraft<Project>): WritableDraft<Project> {
  return {
    _id: payload._id,
    id: payload.taskId,
    name: payload.name,
    description: payload.description,
    members: payload.members,
    tasks: payload.tasks,
    status: payload.status,
    teams: payload.teams,
    startDate: payload.startDate,
    endDate: payload.endDate,
    isActive: payload.isActive,
    milestones: payload.milestones,
    leader: payload.leader,
    budget: payload.budget,
    phase: payload.phase,
    phases: payload.phases,
    type: payload.type,
    currentPhase: payload.currentPhase,
    analysisType: payload.analysisType,
    analysisResults: payload.analysisResults,
    videoData: payload.videoData
  };
}



const updateJobRolesAndDescriptions = (
  state: YourStateType,
  projectId: string,
  teamId: string,
  jobRoles: WritableDraft<JobRole[]>,
  jobDescriptions: WritableDraft<JobDescription[]>
) => {
  const projectIndex = state.projects.findIndex(
    (project:Project) => project.id === projectId
  );
  if (projectIndex !== -1) {
    const project = state.projects[projectIndex];
    const teamIndex = project.teams.findIndex(
      (team: Team) => team.id === teamId
    );
    if (teamIndex !== -1) {
      const team = project.teams[teamIndex];
      team.jobRoles = jobRoles;
      team.jobDescriptions = jobDescriptions;
      project.teams[teamIndex] = team;
      state.projects[projectIndex] = project;
    }
  }
};




const dispatch = useDispatch()

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

    addProject(state, action: PayloadAction<WritableDraft< Project>>) {
      state.projects.push(action.payload);
    },
    updateProject(state, action: PayloadAction<WritableDraft< Project>>) {
      const index = state.projects.findIndex((p: any) => p.id === action.payload.id);
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
        userId: WritableDraft<Member>;
        // memberId: WritableDraft<Member>;
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
      action: PayloadAction<{ projectId: string; userId: WritableDraft<Member> }>
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
        status: WritableDraft<StatusType.Pending | StatusType.InProgress | StatusType.Completed>
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
      action: PayloadAction<{
        projectId: string;
        task: WritableDraft<Task>
      }>
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

    identifyTeamNeeds(
      state,
      action: PayloadAction<{
        projectId: string;
        teamId: string;
        identifiedNeeds: WritableDraft<IdentifiedNeed[]>;
      }>
    )  { 
      const { projectId, teamId, identifiedNeeds } = action.payload;
      const projectIndex = state.projects.findIndex(
        (project) => project.id === projectId
      );
      if (projectIndex !== -1) {
        const project = state.projects[projectIndex];
        const teamIndex = project.teams.findIndex(
          (team: Team) => team.id === teamId
        );
        if (teamIndex !== -1) {
          const team = project.teams[teamIndex];
          team.identifiedNeeds = identifiedNeeds;
          project.teams[teamIndex] = team;
          state.projects[projectIndex] = project;
        }
      }
    },
    defineJobRoles: (state, action) => {
      const { projectId, teamId, jobRoles } = action.payload;
      updateJobRolesAndDescriptions(state, projectId, teamId, jobRoles, []);
    },
    
    createJobDescriptions: (state, action) => {
      const { projectId, teamId, jobRoles, jobDescriptions } = action.payload;
      updateJobRolesAndDescriptions(state, projectId, teamId, jobRoles, jobDescriptions);
    },
    
    advertisePositions: (state, action) => {
      const { projectId, teamId, jobRoles, jobDescriptions } = action.payload;
      updateJobRolesAndDescriptions(state, projectId, teamId, jobRoles, jobDescriptions);
    },
    
    reviewApplications: (state, action) => {
      const { projectId, teamId, jobRoles, jobDescriptions } = action.payload;
      updateJobRolesAndDescriptions(state, projectId, teamId, jobRoles, jobDescriptions);
    },
    
    conductInterviews: (state, action) => {
      const { projectId, teamId, jobRoles, jobDescriptions } = action.payload;
      updateJobRolesAndDescriptions(state, projectId, teamId, jobRoles, jobDescriptions);
    },

    assessCulturalFit: (state, action) => { 
      const { projectId, teamId, jobRoles, jobDescriptions } = action.payload;
      updateJobRolesAndDescriptions(state, projectId, teamId, jobRoles, jobDescriptions);
    },

    checkReferences: (state, action) => {
      const { projectId, teamId, jobRoles, jobDescriptions } = action.payload;
      updateJobRolesAndDescriptions(state, projectId, teamId, jobRoles, jobDescriptions);
    },


    coordinateSelectionProcess: (state, action) => {
      const { projectId, teamId, jobRoles, jobDescriptions } = action.payload;
      updateJobRolesAndDescriptions(state, projectId, teamId, jobRoles, jobDescriptions);
    },

    onboardNewTeamMembers: (state, action) => {
      const { projectId, teamId, jobRoles, jobDescriptions } = action.payload;
      updateJobRolesAndDescriptions(state, projectId, teamId, jobRoles, jobDescriptions);
    },



    brainstormProduct(state,
      action: PayloadAction<{
        projectId: string;
        product: WritableDraft<Product>;
        productId: string;
        productMilestones: WritableDraft<ProductMilestone[]>;
        milestones: WritableDraft<Milestone[]>;
        milestoneId: string;
        productMilestoneId: string;
      }>
    ) {
      const { projectId, product, productId, productMilestones, milestones, milestoneId, productMilestoneId } = action.payload;
      const projectIndex = state.projects.findIndex(
        (project) => project.id === projectId
      );
      if (projectIndex !== -1) {
        const project = state.projects[projectIndex];
        const productIndex = project.products.findIndex(
          (product: Product) => product.id === productId
        );
        if (productIndex !== -1) {
          const product = project.products[productIndex];
          const productMilestoneIndex = product.productMilestones.findIndex(
            (productMilestone: ProductMilestone) => productMilestone.id === productMilestoneId
          );
          if (productMilestoneIndex !== -1) {
            const productMilestone = product.productMilestones[productMilestoneIndex];
            const milestoneIndex = productMilestone.milestones.findIndex(
              (milestone: Milestone) => milestone.id === milestoneId
            );
            if (milestoneIndex !== -1) {
              const milestone = productMilestone.milestones[milestoneIndex];
              milestone.brainstorming = product;
              productMilestone.milestones[milestoneIndex] = milestone;
              product.productMilestones[productMilestoneIndex] = productMilestone;
              project.products[productIndex] = product;
              state.projects[projectIndex] = project;
            }
            else {
              productMilestone.milestones.push(milestones);
              product.productMilestones[productMilestoneIndex] = productMilestone;
              project.products[productIndex] = product;
              state.projects[projectIndex] = project;
            }
          }
        }
      }
    },




    deleteMilestone(state,
      action: PayloadAction<{
        projectId: string;
        milestoneId: string;
        project: WritableDraft<Project>;
        milestone: WritableDraft<Milestone>;
      }>
    ) {
      const { projectId, milestoneId } = action.payload;
    
      // Retrieve the project from state
      
      const updatedProject: WritableDraft<Project> | undefined = state.projects.find(project => project.id === projectId);
      if (updatedProject) {
        // Filter out the milestone with the provided milestoneId
        updatedProject.milestones = updatedProject.milestones.filter((milestone: Milestone) => milestone.id !== milestoneId);
      
        // Update the state with the modified project
        state.projects = state.projects.map(project => project.id === projectId ? updatedProject : project);
      }
    },
    

    
createDeadline(
  state,
  action: PayloadAction<WritableDraft<Project>>
) {
  const updatedProject: WritableDraft<Project> = createUpdatedProject(action.payload);
  const taskIndex = updatedProject.tasks?.findIndex(
    (task) => task.id === action.payload.taskId
  );
  if (taskIndex !== -1) {
    if (updatedProject.tasks) {
      updatedProject.tasks[taskIndex].deadline = action.payload.deadline;
    }
  }
  state.project = updatedProject;
},

updateDeadline(
  state,
  action: PayloadAction<{ taskId: string; deadline: Date }>
) {

  if (state.project !== null) {
    const updatedProject: WritableDraft<Project> = createUpdatedProject(state.project);
    const taskIndex = updatedProject.tasks.findIndex(
      (task) => task.id === action.payload.taskId
      );
      if (taskIndex !== -1) {
        updatedProject.tasks[taskIndex].deadline = action.payload.deadline;
      }
      state.project = updatedProject;
    }
},
    

    deleteDeadline(state, action: PayloadAction<string>) {

      if (state.project !== null) {
        const updatedProject = { ...state.project };

        const taskIndex = updatedProject.tasks.findIndex(
          (task) => task.id === action.payload
        );
        if (taskIndex !== -1) {
          updatedProject.tasks[taskIndex].deadline = null;
        }
        state.project = updatedProject;
      }
    },

    getProjectDetails(state, action: PayloadAction<string>) { 
      const projectIndex = state.projects.findIndex(
        (project) => project.id === action.payload
      );
      if (projectIndex !== -1) {
        state.project = state.projects[projectIndex];
      }
    },

    fetchProjectDetails(state, action: PayloadAction<{ projectId: string, project: Project, details: ProjectDetails }>) {
      const { projectId, project, details } = action.payload;
      const projectIndex = state.projects.findIndex(
        (p) => p.id === projectId
      );
      if (projectIndex !== -1) {
        // Update the state.projects assignment to ensure compatibility with WritableDraft<Project>
        state.projects[projectIndex] = { ...project, details: details } as WritableDraft<Project>;
      }
    },


    // // New reducer for getting project details
    // getProjectDetails(state: WritableDraft<ProjectState>, action: PayloadAction<string>) {
    //   // Dispatch the fetchProjectDetails action with the project ID as payload
    //   // Note: Assuming fetchProjectDetails is an asynchronous function that returns a Promise
    //   const projectId = action.payload;
    //   dispatch(ProjectActions.fetchProjectDetails({
    //     projectId,
    //     project: {} as Project,
    //     details: {} as ProjectDetails
    //   }));
    // },
    // // Reducer to handle the fetchProjectDetails action payload
    // [ProjectActions.fetchProjectDetails.type]: (state: WritableDraft<ProjectState>, action: PayloadAction<{ project: Project, details: ProjectDetails }>) => {
    //   // Update the state with the project details received from the action payload
    //   state.project = {
    //     ...action.payload.project,
    //     phase: {
    //       ...(action.payload.project.phase ?? {}),
    //       name: action.payload.project.phase?.name ?? '',
    //       startDate: action.payload.project.phase?.startDate ?? new Date(),
    //       endDate: action.payload.project.phase?.endDate ?? new Date(),
    //       subPhases: action.payload.project.phase?.subPhases ?? [],
    //       component: action.payload.project.phase?.component ?? (() => null),
    //       lessons: action.payload.project.phase?.lessons ?? [],
    //       duration: action.payload.project.phase?.duration ?? 0,
    //       tasks: action.payload.project.phase?.tasks ?? [],
    //       hooks: action.payload.project.phase?.hooks ?? {
    //         canTransitionTo: () => true,
    //         handleTransitionTo: () => {},
    //         resetIdleTimeout: () => Promise.resolve(),
    //         isActive: true,
    //       },
    //       // tasks: [...(action.payload.project.phase?.tasks ?? [])], // Assuming tasks is an array, create a shallow copy

    //       // milestones: action.payload.project.phase?.milestones ?? [],
    //     },
    //     members: action.payload.project.members.map(member => ({ ...member })),
    //     teams: action.payload.project.teams.map((team: Team) => ({ ...team })),
    //   };
    //   // Handle other details as needed
    // },



    // New reducer for getting project list
getProjectList(
  state,
  action: PayloadAction<{ projectList: WritableDraft<Project[]> }>
) {
  try {
    // Get the projectList from the action payload
    const { projectList } = action.payload;
    
    // Update the state with the fetched project list
    state.projects = projectList;
  } catch (error: any) {
    console.error('Error fetching project list:', error);
    // Handle error using the error handler function
    handleApiError(error, 'Failed to fetch project list');
  }
},

    // New reducers for additional methods
    createMilestone(state, action: PayloadAction<WritableDraft<Milestone>>) {
      // Implement logic to create a milestone for tracking project progress
      // This could involve adding the new milestone to the project's milestones array
      const newMilestone = action.payload;
      state.project?.milestones.push(newMilestone);
    },

    updateMilestone(state, action: PayloadAction<WritableDraft<Milestone>>) {
      // Implement logic to update the details of a milestone
      // This could involve finding the milestone in the project's milestones array and updating its properties
      const updatedMilestone = action.payload;
      const milestoneIndex = state.project?.milestones.findIndex(
        (milestone: Milestone) => milestone.id === updatedMilestone.id
      );
      if (milestoneIndex !== -1 && state.project !== null) {
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
