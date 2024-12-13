import Milestone, {
  ProductMilestone,
} from "@/app/components/calendar/CalendarSlice";
import { Draft, produce  } from "immer";
import { StatusType } from "@/app/components/models/data/StatusType";
import { Task } from "@/app/components/models/tasks/Task";
import { Team } from "@/app/components/models/teams/Team";
import { Contributor, Member } from "@/app/components/models/teams/TeamMembers";
import { Product } from "@/app/components/products/Product";
import { IdentifiedNeed } from "@/app/components/projects/IdentifiedNeed";
import { JobDescription } from "@/app/components/projects/JobDescription";
import { Project } from "@/app/components/projects/Project";
import { JobRole } from "@/app/components/users/UserRoles";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { useDispatch } from "react-redux";
import { WritableDraft } from "../ReducerGenerator";
import { RootState } from "./RootSlice";

import { Meeting } from "@/app/components/communications/scheduler/Meeting";
import { ProjectFeedback } from "@/app/components/support/ProjectFeedback";
import { CustomApp } from "@/app/components/web3/dAppAdapter/DApp";
import ProjectProgress from '../../../projects/projectManagement/ProjectProgress';

interface ProjectState {
  project: Project | null;
  projects: Project[];
  
  loading: boolean;
  error: string | null;
  currentProject: Project | null;
  selectedProject: Project | null;
  projectFeedback: ProjectFeedback[] | null;
}


interface Deadline {
  id: string;
  projectId: string;
  title: string;
  dueDate: Date;
  description?: string;
}


const initialState: ProjectState = {
  project: null,
  projects: [],
  loading: false,
  error: null,
  currentProject: null,
  selectedProject: null,
  projectFeedback: null,
};

interface YourStateType {
  projects: Project[];
}



export interface ProjectMetrics {
  // Define the properties of ProjectMetrics
  completionRate: number;
  // Add more properties if needed
}


function createUpdatedProject(
  payload: WritableDraft<Project>
): WritableDraft<Project> {
  return {
    _id: payload._id,
    id: payload.taskId,
    name: payload.name,
    timestamp: payload.timestamp,
    category: payload.category, 
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
    videoData: payload.videoData,
  };
}

const updateJobRolesAndDescriptions = (
  state: any,
  projectId: string,
  teamId: string,
  jobRoles: WritableDraft<JobRole[]>,
  jobDescriptions: WritableDraft<JobDescription[]>
) => {
  const projectIndex = state.projects.findIndex(
    (project: Project) => project.id === projectId
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

const dispatch = useDispatch();

export const useProjectManagerSlice = createSlice({
  name: "project",
  initialState,
  reducers: {
    fetchProjectStart(state) {
      state.loading = true;
      state.error = null;
    },


    fetchProjectSuccess(state, action: PayloadAction<Project>) {
      state.loading = false;
      state.project = produce(action.payload, (draft: Draft<Project>) => draft); // Specify the type of draft
    },

    fetchProjectFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },

    // Add Project
    addProject(state, action: PayloadAction<Project>) {
      state.projects.push(action.payload as WritableDraft<Project>); // Cast to WritableDraft
    },

    // Update Project
    updateProject(state, action: PayloadAction<Project>) {
      const index = state.projects.findIndex((p) => p.id === action.payload.id);
      if (index !== -1) {
        state.projects[index] = action.payload as WritableDraft<Project>; // Cast to WritableDraft
      }
    },

    // Set Current Project
    currentProject(state, action: PayloadAction<Project>) {
      state.project = action.payload as WritableDraft<Project>; // Cast to WritableDraft
    },
  

    deleteProject(state, action: PayloadAction<string>) {
      state.projects = state.projects.filter((p) => p.id !== action.payload);
    },

    
    assignUserToProject(
      state,
      action: PayloadAction<{ projectId: string; userId: Member }>
    ) {
      const { projectId, userId } = action.payload;
      const project = state.projects.find((project) => project.id === projectId);
      if (project) {
        project.members = [...project.members, userId as WritableDraft<Member>];
      }
    },

    removeUserFromProject(
      state,
      action: PayloadAction<{ projectId: string; userId: Member }>
    ) {
      const { projectId, userId } = action.payload;
      const project = state.projects.find((project) => project.id === projectId);
      if (project) {
        project.members = project.members.filter((memberId) => memberId !== userId);
      }
    },

    
    setProjectStatus(
      state,
      action: PayloadAction<{ projectId: string; status: StatusType }>
    ) {
      const { projectId, status } = action.payload;
      const project = state.projects.find((project) => project.id === projectId);
      if (project) {
        project.status = status;
      }
    },


    addTaskToProject(
      state,
      action: PayloadAction<{
        projectId: string;
        task: WritableDraft<Task>;
      }>
    ) {
      const { projectId, task } = action.payload;
      const project = state.projects.find((project) => project.id === projectId);
      if (project) {
        project.tasks.push(task); // Directly modify draft state
      }
    },

    removeTaskFromProject(
      state,
      action: PayloadAction<{ projectId: string; taskId: string }>
    ) {
      const { projectId, taskId } = action.payload;
      const project = state.projects.find((project) => project.id === projectId);
      if (project) {
        project.tasks = project.tasks.filter((task) => task.id !== taskId);
      }
    },

    updateTaskInProject(
      state,
      action: PayloadAction<{ projectId: string; task: WritableDraft<Task> }>
    ) {
      const { projectId, task } = action.payload;
      const project = state.projects.find((project) => project.id === projectId);
      if (project) {
        const taskIndex = project.tasks.findIndex((t) => t.id === task.id);
        if (taskIndex !== -1) {
          project.tasks[taskIndex] = task; // Update task directly
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
      const { projectId, team } = action.payload;
      const project = state.projects.find((project) => project.id === projectId);
      if (project) {
        project.teams.push(team); // Add team directly
      }
    },

    identifyTeamNeeds(
      state,
      action: PayloadAction<{
        projectId: string;
        teamId: string;
        identifiedNeeds: WritableDraft<IdentifiedNeed[]>;
      }>
    ) {
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
    
    // Your action definition should ensure you pass the correct types
    defineJobRoles: (
      state,
      action: PayloadAction<{
        project: Project;
        projectId: string;
        teamId: string;
        jobRoles: WritableDraft<JobRole[]>;
      }>
    ) => {
      const { project, projectId, teamId, jobRoles } = action.payload;

      const projectIndex = state.projects.findIndex(
        (project) => project.id === projectId
      );

      if (projectIndex !== -1) {
        const draftProject = state.projects[projectIndex];  // This will be a WritableDraft<Project>

        const teamIndex = draftProject.teams.findIndex(
          (team: Team) => team.id === teamId
        );
        
        if (teamIndex !== -1) {
          const team = draftProject.teams[teamIndex];
          // Update team job roles
          team.jobRoles = jobRoles;

          // Update project teams
          draftProject.teams[teamIndex] = team;
        }

        // Update project
        state.projects[projectIndex] = draftProject;
      }

      updateJobRolesAndDescriptions(state, projectId, teamId, jobRoles, []);
    },

    createJobDescriptions: (state,
      action) => {
      const { projectId, teamId, jobRoles, jobDescriptions } = action.payload;
      updateJobRolesAndDescriptions(
        state,
        projectId,
        teamId,
        jobRoles,
        jobDescriptions
      );
    },

    advertisePositions: (state,
      action: PayloadAction<{
        projectId: string;
        teamId: string;
        jobRoles: WritableDraft<JobRole[]>;
      }>) => {
        const { projectId, teamId, jobRoles } = action.payload;
    
        // Update job roles and descriptions
        updateJobRolesAndDescriptions(
          state,
          projectId,
          teamId,
          jobRoles,
          []
        );
    
        // Advertise positions logic
        // Add your logic here to advertise positions based on the updated job roles and descriptions
        // For example:
        const updatedProject = state.projects.find((project) => project.id === projectId);
        const updatedTeam = updatedProject?.teams.find((team: Team) => team.id === teamId);
        const advertisedPositions = updatedTeam?.jobRoles.filter((jobRole: JobRole) => jobRole.isAdvertised);
        console.log("Advertised positions:", advertisedPositions);
    
        // Return the updated state
        return state;
    },
    

    reviewApplications: (state, action) => {
      const { projectId, teamId, jobRoles, jobDescriptions } = action.payload;
      updateJobRolesAndDescriptions(
        state,
        projectId,
        teamId,
        jobRoles,
        jobDescriptions
      );
    },

    conductInterviews: (state, action) => {
      const { projectId, teamId, jobRoles, jobDescriptions } = action.payload;
      updateJobRolesAndDescriptions(
        state,
        projectId,
        teamId,
        jobRoles,
        jobDescriptions
      );
    },

    assessCulturalFit: (state, action) => {
      const { projectId, teamId, jobRoles, jobDescriptions } = action.payload;
      updateJobRolesAndDescriptions(
        state,
        projectId,
        teamId,
        jobRoles,
        jobDescriptions
      );
    },

    checkReferences: (state, action) => {
      const { projectId, teamId, jobRoles, jobDescriptions } = action.payload;
      updateJobRolesAndDescriptions(
        state,
        projectId,
        teamId,
        jobRoles,
        jobDescriptions
      );
    },

    coordinateSelectionProcess: (state, action) => {
      const { projectId, teamId, jobRoles, jobDescriptions } = action.payload;
      updateJobRolesAndDescriptions(
        state,
        projectId,
        teamId,
        jobRoles,
        jobDescriptions
      );
    },

    onboardNewTeamMembers: (state, action) => {
      const { projectId, teamId, jobRoles, jobDescriptions } = action.payload;
      updateJobRolesAndDescriptions(
        state,
        projectId,
        teamId,
        jobRoles,
        jobDescriptions
      );
    },

    brainstormProduct(
      state,
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
      const {
        projectId,
        product,
        productId,
        productMilestones,
        milestones,
        milestoneId,
        productMilestoneId,
      } = action.payload;
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
            (productMilestone: ProductMilestone) =>
              productMilestone.id === productMilestoneId
          );
          if (productMilestoneIndex !== -1) {
            const productMilestone =
              product.productMilestones[productMilestoneIndex];
            const milestoneIndex = productMilestone.milestones.findIndex(
              (milestone: Milestone) => milestone.id === milestoneId
            );
            if (milestoneIndex !== -1) {
              const milestone = productMilestone.milestones[milestoneIndex];
              milestone.brainstorming = product;
              productMilestone.milestones[milestoneIndex] = milestone;
              product.productMilestones[productMilestoneIndex] =
                productMilestone;
              project.products[productIndex] = product;
              state.projects[projectIndex] = project;
            } else {
              productMilestone.milestones.push(milestones);
              product.productMilestones[productMilestoneIndex] =
                productMilestone;
              project.products[productIndex] = product;
              state.projects[projectIndex] = project;
            }
          }
        }
      }
    },

    launchProduct(
      state,
      action: PayloadAction<{
        projectId: string;
        productId: string;
        product: WritableDraft<Product>;
      }>
    ) {
      const { projectId, productId, product } = action.payload;
      // Retrieve the project from state
      const updatedProject = state.projects.find(
        (project) => project.id === projectId
      );
      if (updatedProject) {
        const projectIndex = state.projects.findIndex(
          (project) => project.id === projectId
        );
        const productIndex = updatedProject.products.findIndex(
          (product: Product) => product.id === productId
        );
        if (productIndex !== -1) {
          updatedProject.products[productIndex].status = "launched";
          product.status = "launched";
          updatedProject.products[productIndex] = product;
          state.projects[projectIndex] = updatedProject;
        }
      }
    },

    analyzeData(
      state,
      action: PayloadAction<{
        projectId: string;
        productId: string;
        insights: Insight[];
      }>
    ) {
      const { projectId, productId, insights } = action.payload;
      // Retrieve the project from state
      const updatedProject = state.projects.find(
        (project) => project.id === projectId
      );
      if (updatedProject) {
        const projectIndex = state.projects.findIndex(
          (project) => project.id === projectId
        );
        const productIndex = updatedProject.products.findIndex(
          (product: Product) => product.id === productId
        );
      

        // Filter out the insights with the provided insights
        updatedProject.products[productIndex].insights =
          updatedProject.products[productIndex].insights.concat(insights);
        state.projects[projectIndex] = updatedProject;
        //  verifying insights are unique
        const uniqueInsights = [
          ...new Set(updatedProject.products[productIndex].insights),
        ];
        // Filter out duplicate insights
        updatedProject.products[productIndex].insights = uniqueInsights;
        // Update state with unique insights only
        state.projects[projectIndex] = updatedProject;
      }
      return state;
    },

    rewardContributors(
      state,
      action: PayloadAction<{
        projectId: string;
        contributors: Contributor[];
      }>
    ) {
      const { projectId, contributors } = action.payload;
    
      // Find the project in the state
      const projectIndex = state.projects.findIndex(project => project.id === projectId);
    
      if (projectIndex !== -1) {
        // If the project is found, update the contributors' rewards
        state.projects[projectIndex].contributors = contributors;
      }
    },

    reinvestEarnings(
      state,
      action: PayloadAction<{
        projectId: string;
        amount: number;
        milestoneId: string;
      }>
    ) {
      const { projectId, amount, milestoneId } = action.payload;
      // Find the project
      const projectIndex = state.projects.findIndex(project => project.id === projectId);
      if (projectIndex !== -1) {
        const updatedProject = state.projects[projectIndex];
        const milestoneIndex = updatedProject.milestones.findIndex((milestone: Milestone) => milestone.id === milestoneId);
        if (milestoneIndex !== -1) {
          updatedProject.milestones.splice(milestoneIndex, 1);
          state.projects[projectIndex] = updatedProject;
        }
      }
      return state;
    },

    buildCustomApp(
      state,
      action: PayloadAction<{
        projectId: string;
        app: WritableDraft<CustomApp>;
      }>
    ) {
      const { projectId, app } = action.payload;
    
      // Find the index of the project in the state
      const projectIndex = state.projects.findIndex(project => project.id === projectId);
    
      if (projectIndex !== -1) {
        // If the project is found, update the custom apps
        const updatedProject = { ...state.projects[projectIndex] };
        updatedProject.customApps = [...updatedProject.customApps, app];
        
        // Update the state with the modified project
        return {
          ...state,
          projects: [
            ...state.projects.slice(0, projectIndex),
            updatedProject,
            ...state.projects.slice(projectIndex + 1)
          ]
        };
      }
    
      // If project is not found, return state as is
      return state;
    },
 
    meetProjectMetrics(
      state,
      action: PayloadAction<{
        projectId: string;
        metrics: ProjectMetrics;
      }>
    ) {
      const { projectId, metrics } = action.payload;

      // Find and update the project in the state
      const project = state.projects.find(project => project.id === projectId);
      if (project) {
        project.metrics = metrics; // Directly modify the draft state
      }
    },
 
    generateRevenue(
      state,
      action: PayloadAction<{
        projectId: string;
        amount: number;
      }>
    ) {
      const { projectId, amount } = action.payload;
      // Find the project in state
      const projectIndex = state.projects.findIndex(project => project.id === projectId);
      if (projectIndex !== -1) {
        const updatedProject = { ...state.projects[projectIndex] };
        updatedProject.revenue = updatedProject.revenue + amount;

        return {
          ...state,
          projects: [
            ...state.projects.slice(0, projectIndex),
            updatedProject,
            ...state.projects.slice(projectIndex + 1)
          ]
        }
      }
    },

    joinCommunityProject(
      state,
      action: PayloadAction<{
        projectId: string;
        userId: WritableDraft<Member>;
      }>
    ) {
      const { projectId, userId } = action.payload;

      // Find the project in state
      const projectIndex = state.projects.findIndex(project => project.id === projectId);
      if (projectIndex !== -1) {
        const updatedProject = { ...state.projects[projectIndex] };
        updatedProject.members.push(userId);

        return {
          ...state,
          projects: [
            ...state.projects.slice(0, projectIndex),
            updatedProject,
            ...state.projects.slice(projectIndex + 1)
          ]
        }
      }
    },

    promoteUnity(
      state,
      action: PayloadAction<{
        projectId: string;
        message: string;
      }>
    ) {
      const { projectId, message } = action.payload;

      // Find the project in state
      const projectIndex = state.projects.findIndex(project => project.id === projectId);
      if (projectIndex !== -1) {
        const updatedProject = { ...state.projects[projectIndex] };
        updatedProject.messages.push(message);

        return {
          ...state,
          projects: [
            ...state.projects.slice(0, projectIndex),
            updatedProject,
            ...state.projects.slice(projectIndex + 1)
          ]
        }
      }

    },

    shareProjectProgress(
      state,
      action: PayloadAction<{
        projectId: string;
        progress: typeof ProjectProgress;
      }>
    ) {
      const { projectId, progress } = action.payload;

      // Find the project in state
      const projectIndex = state.projects.findIndex(project => project.id === projectId);
      if (projectIndex !== -1) {
        const updatedProject = { ...state.projects[projectIndex] };
        updatedProject.progress = progress;

        return {
          ...state,
          projects: [
            ...state.projects.slice(0, projectIndex),
            updatedProject,
            ...state.projects.slice(projectIndex + 1)
          ]
        }
      }
    },

    celebrateMilestones(
      state,
      action: PayloadAction<{
        projectId: string;
        milestoneId: string;
      }>
    ) {
      const { projectId, milestoneId } = action.payload;

      // Find the project in state
      const projectIndex = state.projects.findIndex(project => project.id === projectId);
      if (projectIndex !== -1) {
        const updatedProject = { ...state.projects[projectIndex] };
        updatedProject.milestones.find((m: any) => m.id === milestoneId).isCelebrated = true;
        return {
          ...state,
          projects: [
            ...state.projects.slice(0, projectIndex),
            updatedProject,
            ...state.projects.slice(projectIndex + 1)
          ]
        }
      }
      return state;
    },

    provideFeedback(
      state,
      action: PayloadAction<{
        projectId: string;
        feedback: ProjectFeedback;
      }>
    ) {
      const { projectId, feedback } = action.payload;
      // Find the project in state
      const projectIndex = state.projects.findIndex(project => project.id === projectId);
      if (projectIndex !== -1) {
        const updatedProject = { ...state.projects[projectIndex] };
        updatedProject.feedback.push(feedback);
        return {
          ...state,
          projects: [
            ...state.projects.slice(0, projectIndex),
            updatedProject,
            ...state.projects.slice(projectIndex + 1)
          ]
        }
      }
      return state;
    },

    inviteMembers(
      state,
      action: PayloadAction<{
        projectId: string;
        invitedMembers: WritableDraft<Member>[];
      }>
    ) {
      const { projectId, invitedMembers } = action.payload;
      // Find the project in state
      const projectIndex = state.projects.findIndex(project => project.id === projectId);
      if (projectIndex !== -1) {
        const updatedProject = { ...state.projects[projectIndex] };
        updatedProject.invitedMembers = invitedMembers;
        return {
          ...state,
          projects: [
            ...state.projects.slice(0, projectIndex),
            updatedProject,
            ...state.projects.slice(projectIndex + 1)
          ]
        }
      }
      return state
    },

    assignTasks(
      state,
      action: PayloadAction<{
        projectId: string;
        tasks: Task[];
      }>
    ) {
      const { projectId, tasks } = action.payload;
      
      // Find the project in state
      const project = state.projects.find(project => project.id === projectId);
      
      if (project) {
        // Mutate the project tasks directly
        project.tasks = tasks.map((task) => task as WritableDraft<Task>); // Cast each task to WritableDraft
      }
    
      return state; // `immer` automatically handles state updates
    },
    
    scheduleMeetings(
      state,
      action: PayloadAction<{
        projectId: string;
        meetings: Meeting[];
      }>
    ) {
      const { projectId, meetings } = action.payload;
      // Find the project in state
      const projectIndex = state.projects.findIndex(project => project.id === projectId);
      if (projectIndex !== -1) {
        const updatedProject = { ...state.projects[projectIndex] };
        updatedProject.meetings = meetings;
        return {
          ...state,
          projects: [
            ...state.projects.slice(0, projectIndex),
            updatedProject,
            ...state.projects.slice(projectIndex + 1)
          ]
        }
      }
      return state
    },





    updateProjectMetrics(
      state,
      action: PayloadAction<{
        projectId: string;
        metrics: Partial<ProjectMetrics>
      }>
    ) {
      const { projectId, metrics } = action.payload;

      // Find the project in state
      const projectIndex = state.projects.findIndex(project => project.id === projectId);

      if (projectIndex !== -1) {
        const updatedProject = { ...state.projects[projectIndex] };
        updatedProject.metrics = {
          ...updatedProject.metrics,
          ...metrics
        };

        return {
          ...state,
          projects: [
            ...state.projects.slice(0, projectIndex),
            updatedProject,
            ...state.projects.slice(projectIndex + 1)

          ]
        }
      }
    },

    shareResources(
      state,
      action: PayloadAction<{
        projectId: string;
        resources: any[]; // Define the type for resources
      }>
    ) {
      const { projectId, resources } = action.payload;
      const projectIndex = state.projects.findIndex(project => project.id === projectId);
      if (projectIndex !== -1) {
        const updatedProject = { ...state.projects[projectIndex] };
        // Update project with shared resources
        // Assuming the resources are stored in an array within the project object
        updatedProject.resources = resources;
        return {
          ...state,
          projects: [
            ...state.projects.slice(0, projectIndex),
            updatedProject,
            ...state.projects.slice(projectIndex + 1)
          ]
        };
      }
      return state;
    },

    trackProgress(
      state,
      action: PayloadAction<{
        projectId: string;
        progress: number;
      }>
    ) {
      const { projectId, progress } = action.payload;
      const projectIndex = state.projects.findIndex(project => project.id === projectId);
      if (projectIndex !== -1) {
        const updatedProject = { ...state.projects[projectIndex] };
        // Update project with progress
        // Assuming progress is stored within the project object
        updatedProject.progress = progress;
        return {
          ...state,
          projects: [
            ...state.projects.slice(0, projectIndex),
            updatedProject,
            ...state.projects.slice(projectIndex + 1)
          ]
        };
      }
      return state;
    },

    resolveConflicts(
      state,
      action: PayloadAction<{
        projectId: string;
        conflicts: any[]; // Define the type for conflicts
      }>
    ) {
      const { projectId, conflicts } = action.payload;
      const projectIndex = state.projects.findIndex(project => project.id === projectId);
      if (projectIndex !== -1) {
        const updatedProject = { ...state.projects[projectIndex] };
        // Update project with resolved conflicts
        // Assuming the conflicts are stored in an array within the project object
        updatedProject.conflicts = conflicts;
        return {
          ...state,
          projects: [
            ...state.projects.slice(0, projectIndex),
            updatedProject,
            ...state.projects.slice(projectIndex + 1)
          ]
        };
      }
      return state;
    },

    resolveBugs(
      state,
      action: PayloadAction<{
        projectId: string;
        bugs: any[]; // Define the type for bugs
      }>
    ) {
      const { projectId, bugs } = action.payload;
      const projectIndex = state.projects.findIndex(project => project.id === projectId);
      if (projectIndex !== -1) {
        const updatedProject = { ...state.projects[projectIndex] };
        // Update project with resolved bugs
        // Assuming the bugs are stored in an array within the project object
        updatedProject.bugs = bugs;
        return {
          ...state,
          projects: [
            ...state.projects.slice(0, projectIndex),
            updatedProject,
            ...state.projects.slice(projectIndex + 1)
          ]
        };
      }
      return state;
    },

    conductSurveys(
      state,
      action: PayloadAction<{
        projectId: string;
        surveys: any[]; // Define the type for surveys
      }>
    ) {
      const { projectId, surveys } = action.payload;
      const projectIndex = state.projects.findIndex(project => project.id === projectId);
      if (projectIndex !== -1) {
        const updatedProject = { ...state.projects[projectIndex] };
        // Update project with conducted surveys
        // Assuming the surveys are stored in an array within the project object
        updatedProject.surveys = surveys;
        return {
          ...state,
          projects: [
            ...state.projects.slice(0, projectIndex),
            updatedProject,
            ...state.projects.slice(projectIndex + 1)
          ]
        };
      }
      return state;
    },

    facilitateTraining(
      state,
      action: PayloadAction<{
        projectId: string;
        trainingSessions: any[]; // Define the type for training sessions
      }>
    ) {
      const { projectId, trainingSessions } = action.payload;
      const projectIndex = state.projects.findIndex(project => project.id === projectId);
      if (projectIndex !== -1) {
        const updatedProject = { ...state.projects[projectIndex] };
        // Update project with facilitated training sessions
        // Assuming the training sessions are stored in an array within the project object
        updatedProject.trainingSessions = trainingSessions;
        return {
          ...state,
          projects: [
            ...state.projects.slice(0, projectIndex),
            updatedProject,
            ...state.projects.slice(projectIndex + 1)
          ]
        };
      }
      return state;
    },

    provideMentorship(
      state,
      action: PayloadAction<{
        projectId: string;
        mentorshipOpportunities: any[]; // Define the type for mentorship opportunities
      }>
    ) {
      const { projectId, mentorshipOpportunities } = action.payload;
      const projectIndex = state.projects.findIndex(project => project.id === projectId);
      if (projectIndex !== -1) {
        const updatedProject = { ...state.projects[projectIndex] };
        // Update project with provided mentorship opportunities
        // Assuming the mentorship opportunities are stored in an array within the project object
        updatedProject.mentorshipOpportunities = mentorshipOpportunities;
        return {
          ...state,
          projects: [
            ...state.projects.slice(0, projectIndex),
            updatedProject,
            ...state.projects.slice(projectIndex + 1)
          ]
        };
      }
      return state;
    },

    ensureAccessibility(
      state,
      action: PayloadAction<{
        projectId: string;
        accessibilityFeatures: any[]; // Define the type for accessibility features
      }>
    ) {
      const { projectId, accessibilityFeatures } = action.payload;
      const projectIndex = state.projects.findIndex(project => project.id === projectId);
      if (projectIndex !== -1) {
        const updatedProject = { ...state.projects[projectIndex] };
        // Update project with ensured accessibility features
        // Assuming the accessibility features are stored in an array within the project object
        updatedProject.accessibilityFeatures = accessibilityFeatures;
        return {
          ...state,
          projects: [
            ...state.projects.slice(0, projectIndex),
            updatedProject,
            ...state.projects.slice(projectIndex + 1)
          ]
        };
      }
      return state;
    },



    implementSecurityMeasures(
      state,
      action: PayloadAction<{
        projectId: string;
        securityMeasures: any[]; // Define the type for security measures
      }>
    ) {
      const { projectId, securityMeasures } = action.payload;
      const projectIndex = state.projects.findIndex(project => project.id === projectId);
      if (projectIndex !== -1) {
        const updatedProject = { ...state.projects[projectIndex] };
        // Update project with implemented security measures
        // Assuming the security measures are stored in an array within the project object
        updatedProject.securityMeasures = securityMeasures;
        return {
          ...state,
          projects: [
            ...state.projects.slice(0, projectIndex),
            updatedProject,
            ...state.projects.slice(projectIndex + 1)
          ]
        };
      }
      return state;
    },

    ensurePrivacy(
      state,
      action: PayloadAction<{
        projectId: string;
        privacyFeatures: any[]; // Define the type for privacy features
      }>
    ) {
      const { projectId, privacyFeatures } = action.payload;
      const projectIndex = state.projects.findIndex(project => project.id === projectId);
      if (projectIndex !== -1) {
        const updatedProject = { ...state.projects[projectIndex] };
        // Update project with ensured privacy features
        // Assuming the privacy features are stored in an array within the project object
        updatedProject.privacyFeatures = privacyFeatures;
        return {
          ...state,
          projects: [
            ...state.projects.slice(0, projectIndex),
            updatedProject,
            ...state.projects.slice(projectIndex + 1)
          ]
        };
      }
      return state;
    },

    implementDataProtection(
      state,
      action: PayloadAction<{
        projectId: string;
        dataProtectionMeasures: any[]; // Define the type for data protection measures
      }>
    ) {
      const { projectId, dataProtectionMeasures } = action.payload;
      const projectIndex = state.projects.findIndex(project => project.id === projectId);
      if (projectIndex !== -1) {
        const updatedProject = { ...state.projects[projectIndex] };
        // Update project with implemented data protection measures
        // Assuming the data protection measures are stored in an array within the project object
        updatedProject.dataProtectionMeasures = dataProtectionMeasures;
        return {
          ...state,
          projects: [
            ...state.projects.slice(0, projectIndex),
            updatedProject,
            ...state.projects.slice(projectIndex + 1)
          ]
        };
      }
      return state;
    },

    deleteMilestone(
      state,
      action: PayloadAction<{
        projectId: string;
        milestoneId: string;
      }>
    ) {
      const { projectId, milestoneId } = action.payload;
      const projectIndex = state.projects.findIndex(project => project.id === projectId);
      if (projectIndex !== -1) {
        const updatedProject = { ...state.projects[projectIndex] };
        // Remove the milestone with the specified ID
        updatedProject.milestones = updatedProject.milestones.filter((milestone: Milestone) => milestone.id !== milestoneId);
        return {
          ...state,
          projects: [
            ...state.projects.slice(0, projectIndex),
            updatedProject,
            ...state.projects.slice(projectIndex + 1)
          ]
        };
      }
      return state;
    },
    
    createDeadline(
      state,
      action: PayloadAction<{
        projectId: string;
        deadline: Deadline;
      }>
    ) {
      const { projectId, deadline } = action.payload;
      const projectIndex = state.projects.findIndex(project => project.id === projectId);
      if (projectIndex !== -1) {
        const updatedProject = { ...state.projects[projectIndex] };
        // Add the new deadline to the project
        updatedProject.deadlines.push(deadline);
        return {
          ...state,
          projects: [
            ...state.projects.slice(0, projectIndex),
            updatedProject,
            ...state.projects.slice(projectIndex + 1)
          ]
        };
      }
      return state;
    },
    
    updateDeadline(
      state,
      action: PayloadAction<{
        projectId: string;
        deadlineId: string;
        updatedDeadline: Partial<Deadline>;
      }>
    ) {
      const { projectId, deadlineId, updatedDeadline } = action.payload;
      const projectIndex = state.projects.findIndex(project => project.id === projectId);
      if (projectIndex !== -1) {
        const updatedProject = { ...state.projects[projectIndex] };
        // Find the deadline with the specified ID and update its properties
        updatedProject.deadlines = updatedProject.deadlines.map((deadline: Deadline) => {
          if (deadline.id === deadlineId) {
            return { ...deadline, ...updatedDeadline };
          }
          return deadline;
        });
        return {
          ...state,
          projects: [
            ...state.projects.slice(0, projectIndex),
            updatedProject,
            ...state.projects.slice(projectIndex + 1)
          ]
        };
      }
      return state;
    },

    deleteDeadline: (
      state,
      action: PayloadAction<{
        projectId: string;
        deadlineId: string;
      }>
    ) => {
      const { projectId, deadlineId } = action.payload;
      const project = state.projects.find(project => project.id === projectId);

      if (project) {
        // Directly mutate the project deadlines
        project.deadlines = project.deadlines.filter((deadline: Deadline) => deadline.id !== deadlineId);
      }
    },




    getProjectDetails: (
      state,
      action: PayloadAction<string>
    ) => {
      const projectId = action.payload;
      const project = state.projects.find(
        (project) => project.id === projectId
      );
      if (project) {
        state.currentProject = project.id === state.currentProject?.id ? state.currentProject : project;
        state.selectedProject = project;
      }
    },

    getProjectList: (state) => {
      // No need to return anything as we are not changing state structure
      state.projects = state.projects || [];
    },
    
    createMilestone(
      state,
      action: PayloadAction<{
        projectId: string;
        milestone: Milestone;
      }>
    ) {
      const { projectId, milestone } = action.payload;
      const projectIndex = state.projects.findIndex(project => project.id === projectId);
      if (projectIndex !== -1) {
        const updatedProject = { ...state.projects[projectIndex] };
        // Add the new milestone to the project
        updatedProject.milestones.push(milestone);
        return {
          ...state,
          projects: [
            ...state.projects.slice(0, projectIndex),
            updatedProject,
            ...state.projects.slice(projectIndex + 1)
          ]
        };
      }
      return state;
    },
    
    updateMilestone(
      state,
      action: PayloadAction<{
        projectId: string;
        milestoneId: string;
        updatedMilestone: Partial<Milestone>;
      }>
    ) {
      const { projectId, milestoneId, updatedMilestone } = action.payload;
      const projectIndex = state.projects.findIndex(project => project.id === projectId);
      if (projectIndex !== -1) {
        const updatedProject = { ...state.projects[projectIndex] };
        // Find the milestone with the specified ID and update its properties
        updatedProject.milestones = updatedProject.milestones.map((milestone: Milestone) => {
          if (milestone.id === milestoneId) {
            return { ...milestone, ...updatedMilestone };
          }
          return milestone;
        });
        return {
          ...state,
          projects: [
            ...state.projects.slice(0, projectIndex),
            updatedProject,
            ...state.projects.slice(projectIndex + 1)
          ]
        };
      }
      return state;
    },
    

  }
});

export const {
  //Project actions
  fetchProjectStart,
  fetchProjectSuccess,
  fetchProjectFailure,
  addProject,
  updateProject,
  deleteProject,
  currentProject,
  
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

export type { ProjectState };
// Export reducer
useProjectManagerSlice.reducer;

// Selectors

export const selectProject = (state: RootState) =>
  state.projectManager.project;
export const selectProjects = (state: RootState) =>
  state.projectManager.projects;
export const selectProjectLoading = (state: RootState) =>
  state.projectManager.loading;
export const selectProjectError = (state: RootState) =>
  state.projectManager.error;
export type { Deadline };
