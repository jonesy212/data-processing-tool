// projects/ProjectActions.ts
import { createAction } from "@reduxjs/toolkit";
import Milestone from "../calendar/CalendarSlice";
import { Task } from "../models/tasks/Task";
import { Phase } from "../phases/Phase";
import { Product } from "../products/Product";
import { Project, ProjectDetails } from "../projects/Project";
import { User } from "../users/User";
import { K, T } from '@/app/components/models/data/dataStoreMethods';
export const ProjectActions = {
  // Standard actions
  add: createAction<Project>("addProject"),
  remove: createAction<number>("removeProject"),
  updateTitle: createAction<{ id: number; newTitle: string }>("updateProjectTitle"),
  updateProjectSuccess: createAction<{ project: Project }>("updateProjectSuccess"),
  updateProjectFailure: createAction<{ error: string }>("updateProjectFailure"), 
  
  performProjectActions: createAction<string | null>("performProjectActions"),
  assignedTeams: createAction<string, string>("assignedTeams"),
  deleteProjectSuccess: createAction<{projectId: string, project: Project}>("deleteProjectSuccess"),
  deleteProjectFailure: createAction<{ error: string }>("deleteProjectFailure"),
  
  // Create actions
  createProjectSuccess: createAction<{ project: Project }>("createProjectSuccess"),
  createProjectFailure: createAction<{ error: string }>("createProjectFailure"),  
  
  // Fetch actions
  fetchProject: createAction<{ project: Project }>("fetchProject"),
  fetchProjectSuccess: createAction<{ project: Project }>("fetchProjectSuccess"),
  fetchProjectFailure: createAction<{ error: string }>("fetchProjectFailure"),
  
  fetchProjectList: createAction<{ projects: Project[] }>("fetchProjectList"),
  fetchProjectListSuccess: createAction<{ projects: Project[] }>("fetchProjectListSuccess"),
  
  fetchProjectsRequest: createAction<{ request: string }>("fetchProjectsRequest"),
  fetchProjectsSuccess: createAction<{ projects: Project[] }>(
    "fetchProjectsSuccess"
    ),

    
    fetchProjectsFailure: createAction<{ error: string }>("fetchProjectsFailure"),
    
    
    fetchProjectDetails: createAction<{projectId: string, project: Project, projectDetails: ProjectDetails }>("fetchProjectDetails"),
    fetchProjectDetailsSuccess: createAction<{ project: Project }>("fetchProjectDetailsSuccess"),
    fetchProjectDetailsFailure: createAction<{ error: string }>("fetchProjectDetailsFailure"),
  updateUIWithProjectDetails: createAction<{payload: {
    projectId: string, project: Project, projectDetails:  ProjectDetails
  }, type: any}>("updateUIWithProjectDetails"),
    updateProject: createAction<{ 
      projectId: string;
      project: Project;
      type: string;
    }>("updateProject"),
    

    
    // Associated entities actions
  checkProjectCompletion: createAction<{ projectId: string, project: Project }>("checkProjectCompletion"),
  updateProjectCompletion: createAction<{ projectId: string, completion: number }>("updateProjectCompletion"),
  updateProjectPending: createAction<{ projectId: string, pending: boolean }>( "updateProjectPending"),







    // Batch actions for fetching
    batchFetchProjectsRequest: createAction("batchFetchProjectsRequest"),
    batchFetchProjectsSuccess: createAction<{ projects: Project[] }>(
      "batchFetchProjectsSuccess"
    ),
    batchFetchProjectsFailure: createAction<{ error: string }>(
      "batchFetchProjectsFailure"
    ),
  
  
  
  
  
  // Batch actions for updating
  batchUpdateProjectsRequest: createAction<{
    ids: number[];
    newTitles: string[];
  }>("batchUpdateProjectsRequest"),
  batchUpdateProjectsSuccess: createAction<{ projects: Project[] }>(
    "batchUpdateProjectsSuccess"
  ),


  generateExecutiveSummaryContent: createAction<{ projectId: string, executiveSummaryContent: string }>("generateExecutiveSummaryContent"),
  updateExecutiveSummary: createAction<{ projectId: string, executiveSummaryContent: string }>("updateExecutiveSummary"),
  shareExcecutiveSummary: createAction<{ projectId: string, recipients: string[] }>("shareExcecutiveSummary"),
  removeExecutiveSummary: createAction<{ projectId: string }>("removeExecutiveSummary"),

  


  batchUpdateProjectsFailure: createAction<{ error: string }>(
    "batchUpdateProjectsFailure"
  ),

  // Batch actions for removing
  batchRemoveProjectsRequest: createAction<number[]>(
    "batchRemoveProjectsRequest"
  ),
  batchRemoveProjectsSuccess: createAction<number[]>(
    "batchRemoveProjectsSuccess"
  ),
  batchRemoveProjectsFailure: createAction<{ error: string }>(
    "batchRemoveProjectsFailure"
  ),

  // Additional actions
  updateDescription: createAction<{
    id: number;
    newDescription: string | null;
  }>("updateProjectDescription"),
  updateStartDate: createAction<{ id: number; newStartDate: Date }>(
    "updateProjectStartDate"
  ),
  updateEndDate: createAction<{ id: number; newEndDate: Date | null }>(
    "updateProjectEndDate"
  ),
  toggleActiveStatus: createAction<{ id: number; isActive: boolean }>(
    "toggleProjectActiveStatus"
  ),
  updateLeader: createAction<{ id: number; newLeader: User | null }>(
    "updateProjectLeader"
  ),
  updateBudget: createAction<{ id: number; newBudget: number | null }>(
    "updateProjectBudget"
  ),
  addMember: createAction<{ id: number; member: User }>("addProjectMember"),
  removeMember: createAction<{ id: number; memberId: string }>(
    "removeProjectMember"
  ),
  updatePhase: createAction<{ id: number; newPhase: Phase | null }>(
    "updateProjectPhase"
  ),
  addPhase: createAction<{ id: number; newPhase: Phase }>("addProjectPhase"),
  removePhase: createAction<{ id: number; phaseId: number, phaseName: Phase["name"] }>(
    "removeProjectPhase"
  ),

  addTaskToProject: createAction<{ projectId: number; task: Task<T, K<T>> }>(
    "addTaskToProject"
  ),
  removeTaskFromProject: createAction<{ projectId: number; taskId: number }>(
    "removeTaskFromProject"
  ),
  updateProjectStatus: createAction<{
    id: number;
    newStatus: "pending" | "inProgress" | "completed";
  }>("updateProjectStatus"),
  markProjectAsActive: createAction<number>("markProjectAsActive"),
  markProjectAsInactive: createAction<number>("markProjectAsInactive"),
  assignLeaderToProject: createAction<{ id: number; leaderId: string }>(
    "assignLeaderToProject"
  ),
  archiveProject: createAction<number>("archiveProject"),
  unarchiveProject: createAction<number>("unarchiveProject"),

  // New actions
  createTeam: createAction<{ projectId: number; teamMembers: User[] }>(
    "createTeam"
  ),
  brainstormProduct: createAction<{ projectId: number; ideas: string[] }>(
    "brainstormProduct"
  ),
  launchProduct: createAction<{ projectId: string, productId: string, product: Product }>("launchProduct"),
  performDataAnalysis: createAction<{ projectId: string, productId: string, insights: { id: string, description: string }[] }>("performDataAnalysis"),
  rewardContributors: createAction<{
    projectId: number;
    contributors: User[];
    earnings: number;
  }>("rewardContributors"),
  investInCommunityCoin: createAction<number>("investInCommunityCoin"),
  launchCommunityCoin: createAction<number>("launchCommunityCoin"),
  createMilestone: createAction<{ projectId: string, milestone: Milestone }>("createMilestone"),
  updateMilestone: createAction<{ projectId: string, milestoneId: string, updates: Partial<Milestone> }>("updateMilestone"),
  deleteMilestone: createAction<{ projectId: string, milestoneId: string, project: { id: string, name: string, milestones: any[] }, milestone: { id: string, name: string } }>("deleteMilestone"),


  // Add more actions as needed
};
