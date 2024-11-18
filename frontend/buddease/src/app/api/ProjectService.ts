import { endpoints } from "@/app/api/ApiEndpoints";
import axiosInstance from "@/app/api/axiosInstance";
import { makeAutoObservable } from 'mobx';
import { ProjectActions } from "../components/actions/ProjectActions";
import { Task } from "../components/models/tasks/Task";
import { Phase } from "../components/phases/Phase";
import {Project, ProjectData} from "../components/projects/Project";
import { User } from "../components/users/User";
import { sendNotification } from "../components/users/UserSlice";
import NOTIFICATION_MESSAGES from "../components/support/NotificationMessages";
import { ProjectMetadata } from "../configs/StructuredMetadata";
import ProjectModel from "../../../models/ProjectModel";
import { Product } from "../components/products/Product";
import { K, T } from '../components/models/data/dataStoreMethods';

const API_BASE_URL = endpoints.projects;

class ProjectService {
  constructor() {
    makeAutoObservable(this);
  }


  // Method to save project data to the database
  static saveProjectData = async (projectData: ProjectData) => {
    try {
      // Check if the project already exists in the database
      const existingProject = await ProjectModel.findOne({
          tableName: ProjectModel.tableName,
          where: { id: projectData.id },
        // Optionally specify the tableName here
      });

      if (existingProject) {
        // If the project exists, update its data
        await ProjectModel.update(projectData, { where: { id: projectData.id } });
        console.log('Project data updated successfully:', projectData);
      } else {
        // If the project doesn't exist, create a new entry
        await ProjectModel.create(projectData);
        console.log('New project data saved successfully:', projectData);
      }
    } catch (error) {
      console.error('Error saving project data:', error);
      throw error;
    }
  }


  createProject = async (newProject: Project) => { 
    try {
      const response = await axiosInstance.post(API_BASE_URL.add as string, newProject);
      ProjectActions.createProjectSuccess({ project: response.data });
      sendNotification(`Project ${newProject.name} created successfully`);
      return response.data;
    } catch (error) {
      ProjectActions.createProjectFailure({ error: String(error) });
      sendNotification(`Error creating project: ${error}`);
      console.error('Error creating project:', error);
      throw error;
    }

  };  
  fetchProject = async (projectId: number) => {
    try {
      ProjectActions.fetchProjectsRequest({
        request: NOTIFICATION_MESSAGES.Projects.FETCH_PROJECT_DETAILS_SUCCESS,
      });
      const response = await axiosInstance.get(
        `${API_BASE_URL.single}/${projectId}`
      );
      ProjectActions.fetchProjectSuccess({ project: response.data });
      sendNotification(`Project with ID ${projectId} fetched successfully`);
      return response.data;
    } catch (error) {
      ProjectActions.fetchProjectFailure({ error: String(error) });
      sendNotification(`Error fetching project with ID ${projectId}: ${error}`);
      console.error('Error fetching project:', error);
      throw error;
    }
  };
  
  fetchProjectList = async () => {
    try {
      ProjectActions.fetchProjectsRequest({
        request: NOTIFICATION_MESSAGES.Projects.FETCH_PROJECT_LIST_SUCCESS,
      });
      const response = await axiosInstance.get(API_BASE_URL.all as string);
      ProjectActions.fetchProjectsSuccess({ projects: response.data });
      sendNotification(`Project list fetched successfully`);
      return response.data;
    } catch (error) {
      ProjectActions.fetchProjectsFailure({ error: String(error) });
      sendNotification(`Error fetching project list: ${error}`);
      console.error("Error fetching project list:", error);
      throw error;
    }
  };    
  updateProjectData = async (
    id: string,
    metadata: ProjectMetadata<T, K<T>>
  ): Promise<{ project: Project }> => {
    try {
      const response = await axiosInstance.put(`${API_BASE_URL}/${id}`, {
        metadata,
      });
      ProjectActions.updateProjectSuccess({ project: response.data });
      sendNotification(`Project with ID ${id} updated successfully`);
      return { project: response.data };
    } catch (error) {
      ProjectActions.updateProjectFailure({ error: String(error) });
      sendNotification(`Error updating project with ID ${id}: ${error}`);
      console.error('Error updating project:', error);
      throw error;
    }
  };

  deleteProject = async (id: string): Promise<{ project: Project }> => {
    try {
      const response = await axiosInstance.delete(`${API_BASE_URL}/${id}`);
      ProjectActions.deleteProjectSuccess({ projectId: response.data, project: response.data });
      sendNotification(`Project with ID ${id} deleted successfully`);
      return { project: response.data };
    } catch (error) {
      ProjectActions.deleteProjectFailure({ error: String(error) });
      sendNotification(`Error deleting project with ID ${id}: ${error}`);
      console.error('Error deleting project:', error);
      throw error;
    }
  };
    
    
    
  updateDescription = async (projectId: number, newDescription: string | null): Promise<void> => {
    try {
      const response = await axiosInstance.put(`${API_BASE_URL}/${projectId}/description`, { description: newDescription });
      ProjectActions.updateDescription({ id: projectId, newDescription });
      sendNotification(`Description updated for project with ID ${projectId}`);
    } catch (error) {
      ProjectActions.updateProjectFailure({ error: String(error) });
      sendNotification(`Error updating description for project with ID ${projectId}: ${error}`);
      console.error('Error updating description:', error);
      throw error;
    }
  }

  updateStartDate = async (projectId: number, newStartDate: Date): Promise<void> => {
    try {
      const response = await axiosInstance.put(`${API_BASE_URL}/${projectId}/startDate`, { startDate: newStartDate });
      ProjectActions.updateStartDate({ id: projectId, newStartDate });
      sendNotification(`Start date updated for project with ID ${projectId}`);
    } catch (error) {
      ProjectActions.updateProjectFailure({ error: String(error) });
      sendNotification(`Error updating start date for project with ID ${projectId}: ${error}`);
      console.error('Error updating start date:', error);
      throw error;
    }
  }

  updateEndDate = async (projectId: number, newEndDate: Date | null): Promise<void> => {
    try {
      const response = await axiosInstance.put(`${API_BASE_URL}/${projectId}/endDate`, { endDate: newEndDate });
      ProjectActions.updateEndDate({ id: projectId, newEndDate });
      sendNotification(`End date updated for project with ID ${projectId}`);
    } catch (error) {
      ProjectActions.updateProjectFailure({ error: String(error) });
      sendNotification(`Error updating end date for project with ID ${projectId}: ${error}`);
      console.error('Error updating end date:', error);
      throw error;
    }
  }

  toggleActiveStatus = async (projectId: number, isActive: boolean): Promise<void> => {
    try {
      const response = await axiosInstance.put(`${API_BASE_URL}/${projectId}/activeStatus`, { isActive });
      ProjectActions.toggleActiveStatus({ id: projectId, isActive });
      const status = isActive ? 'activated' : 'deactivated';
      sendNotification(`Project with ID ${projectId} ${status}`);
    } catch (error) {
      ProjectActions.updateProjectFailure({ error: String(error) });
      const status = isActive ? 'activating' : 'deactivating';
      sendNotification(`Error ${status} project with ID ${projectId}: ${error}`);
      console.error(`Error ${status} project:`, error);
      throw error;
    }
  }
    
    

    
  updateLeader = async (projectId: number, newLeaderId: string | null): Promise<void> => {
    try {
      const response = await axiosInstance.put(`${API_BASE_URL}/${projectId}/leader`, {
        leaderId: newLeaderId,
      });
      ProjectActions.updateLeader({ id: projectId, newLeader: response.data });
      sendNotification(`Leader updated for project with ID ${projectId}`);
    } catch (error) {
      ProjectActions.updateProjectFailure({ error: String(error) });
      sendNotification(`Error updating leader for project with ID ${projectId}: ${error}`);
      console.error('Error updating leader:', error);
      throw error;
    }
  };
  
  updateBudget = async (projectId: number, newBudget: number | null): Promise<void> => {
    try {
      const response = await axiosInstance.put(`${API_BASE_URL}/${projectId}/budget`, {
        budget: newBudget,
      });
      ProjectActions.updateBudget({ id: projectId, newBudget: response.data });
      sendNotification(`Budget updated for project with ID ${projectId}`);
    } catch (error) {
      ProjectActions.updateProjectFailure({ error: String(error) });
      sendNotification(`Error updating budget for project with ID ${projectId}: ${error}`);
      console.error('Error updating budget:', error);
      throw error;
    }
  };
  
  addMember = async (projectId: number, memberId: string): Promise<void> => {
    try {
      const response = await axiosInstance.post(`${API_BASE_URL}/${projectId}/members`, {
        memberId: memberId,
      });
      ProjectActions.addMember({ id: projectId, member: response.data });
      sendNotification(`Member added to project with ID ${projectId}`);
    } catch (error) {
      ProjectActions.updateProjectFailure({ error: String(error) });
      sendNotification(`Error adding member to project with ID ${projectId}: ${error}`);
      console.error('Error adding member:', error);
      throw error;
    }
  };
  
  removeMember = async (projectId: number, memberId: string): Promise<void> => {
    try {
      await axiosInstance.delete(`${API_BASE_URL}/${projectId}/members/${memberId}`);
      ProjectActions.removeMember({ id: projectId, memberId: memberId });
      sendNotification(`Member removed from project with ID ${projectId}`);
    } catch (error) {
      ProjectActions.updateProjectFailure({ error: String(error) });
      sendNotification(`Error removing member from project with ID ${projectId}: ${error}`);
      console.error('Error removing member:', error);
      throw error;
    }
  };

  updatePhase = async (projectId: number, phaseId: number, newPhase: Phase<Project>): Promise<void> => {
    try {
      const response = await axiosInstance.put(`${API_BASE_URL}/${projectId}/phases/${phaseId}`, newPhase);
      ProjectActions.updatePhase({ id: projectId, newPhase: response.data });
      sendNotification(`Phase updated for project with ID ${projectId}`);
    } catch (error) {
      ProjectActions.updateProjectFailure({ error: String(error) });
      sendNotification(`Error updating phase for project with ID ${projectId}: ${error}`);
      console.error('Error updating phase:', error);
      throw error;
    }
  };
  
  addPhase = async (projectId: number, newPhase: Phase<Project>): Promise<void> => {
    try {
      const response = await axiosInstance.post(`${API_BASE_URL}/${projectId}/phases`, newPhase);
      ProjectActions.addPhase({ id: projectId, newPhase: response.data });
      sendNotification(`Phase added to project with ID ${projectId}`);
    } catch (error) {
      ProjectActions.updateProjectFailure({ error: String(error) });
      sendNotification(`Error adding phase to project with ID ${projectId}: ${error}`);
      console.error('Error adding phase:', error);
      throw error;
    }
  };
  
  removePhase = async (projectId: number, phaseId: number, phaseName: string): Promise<void> => {
    try {
      await axiosInstance.delete(`${API_BASE_URL}/${projectId}/phases/${phaseId}`);
      ProjectActions.removePhase({ id: projectId, phaseId: phaseId, phaseName });
      sendNotification(`Phase removed from project with ID ${projectId}`);
    } catch (error) {
      ProjectActions.updateProjectFailure({ error: String(error) });
      sendNotification(`Error removing phase from project with ID ${projectId}: ${error}`);
      console.error('Error removing phase:', error);
      throw error;
    }
  };
  
  addTaskToProject = async (projectId: number, task: Task<T, ProjectData>): Promise<void> => {
    try {
      const response = await axiosInstance.post(`${API_BASE_URL}/${projectId}/tasks`, task);
      ProjectActions.addTaskToProject({ projectId: projectId, task: response.data });
      sendNotification(`Task added to project with ID ${projectId}`);
    } catch (error) {
      ProjectActions.updateProjectFailure({ error: String(error) });
      sendNotification(`Error adding task to project with ID ${projectId}: ${error}`);
      console.error('Error adding task:', error);
      throw error;
    }
  };
  removeTaskFromProject = async (projectId: number, taskId: number): Promise<void> => {    try {
      await axiosInstance.delete(`${API_BASE_URL}/${projectId}/tasks/${taskId}`);
      ProjectActions.removeTaskFromProject({ projectId: projectId, taskId: taskId });
      sendNotification(`Task removed from project with ID ${projectId}`);
    } catch (error) {
      ProjectActions.updateProjectFailure({ error: String(error) });
      sendNotification(`Error removing task from project with ID ${projectId}: ${error}`);
      console.error('Error removing task:', error);
      throw error;
    }
  };
  
  updateProjectStatus = async (projectId: number, newStatus: "pending" | "inProgress" | "completed"): Promise<void> => {
    try {
      const response = await axiosInstance.put(`${API_BASE_URL}/${projectId}/status`, { status: newStatus });
      ProjectActions.updateProjectStatus({ id: projectId, newStatus: response.data.status });
      sendNotification(`Project status updated for project with ID ${projectId}`);
    } catch (error) {
      ProjectActions.updateProjectFailure({ error: String(error) });
      sendNotification(`Error updating project status for project with ID ${projectId}: ${error}`);
      console.error('Error updating project status:', error);
      throw error;
    }
  };
  
  markProjectAsActive = async (projectId: number): Promise<void> => {
    try {
      await axiosInstance.put(`${API_BASE_URL}/${projectId}/status`, { status: "active" });
      ProjectActions.markProjectAsActive(projectId);
      sendNotification(`Project marked as active with ID ${projectId}`);
    } catch (error) {
      ProjectActions.updateProjectFailure({ error: String(error) });
      sendNotification(`Error marking project as active with ID ${projectId}: ${error}`);
      console.error('Error marking project as active:', error);
      throw error;
    }
  };
  
  markProjectAsInactive = async (projectId: number): Promise<void> => {
    try {
      await axiosInstance.put(`${API_BASE_URL}/${projectId}/status`, { status: "inactive" });
      ProjectActions.markProjectAsInactive(projectId);
      sendNotification(`Project marked as inactive with ID ${projectId}`);
    } catch (error) {
      ProjectActions.updateProjectFailure({ error: String(error) });
      sendNotification(`Error marking project as inactive with ID ${projectId}: ${error}`);
      console.error('Error marking project as inactive:', error);
      throw error;
    }
  };

    
  assignLeaderToProject = async (projectId: number, leaderId: string): Promise<void> => {
    try {
      await axiosInstance.put(`${API_BASE_URL}/${projectId}/leader`, { leaderId: leaderId });
      ProjectActions.assignLeaderToProject({ id: projectId, leaderId: leaderId });
      sendNotification(`Leader assigned to project with ID ${projectId}`);
    } catch (error) {
      ProjectActions.updateProjectFailure({ error: String(error) });
      sendNotification(`Error assigning leader to project with ID ${projectId}: ${error}`);
      console.error('Error assigning leader to project:', error);
      throw error;
    }
  };
  
  archiveProject = async (projectId: number): Promise<void> => {
    try {
      await axiosInstance.put(`${API_BASE_URL}/${projectId}/archive`);
      ProjectActions.archiveProject(projectId);
      sendNotification(`Project archived with ID ${projectId}`);
    } catch (error) {
      ProjectActions.updateProjectFailure({ error: String(error) });
      sendNotification(`Error archiving project with ID ${projectId}: ${error}`);
      console.error('Error archiving project:', error);
      throw error;
    }
  };
  
  unarchiveProject = async (projectId: number): Promise<void> => {
    try {
      await axiosInstance.put(`${API_BASE_URL}/${projectId}/unarchive`);
      ProjectActions.unarchiveProject(projectId);
      sendNotification(`Project unarchived with ID ${projectId}`);
    } catch (error) {
      ProjectActions.updateProjectFailure({ error: String(error) });
      sendNotification(`Error unarchiving project with ID ${projectId}: ${error}`);
      console.error('Error unarchiving project:', error);
      throw error;
    }
  };
  
  createTeam = async (projectId: number, teamMembers: User[]): Promise<void> => {
    try {
      await axiosInstance.post(`${API_BASE_URL}/${projectId}/team`, { teamMembers: teamMembers });
      ProjectActions.createTeam({ projectId: projectId, teamMembers: teamMembers });
      sendNotification(`Team created for project with ID ${projectId}`);
    } catch (error) {
      ProjectActions.updateProjectFailure({ error: String(error) });
      sendNotification(`Error creating team for project with ID ${projectId}: ${error}`);
      console.error('Error creating team for project:', error);
      throw error;
    }
  };

    
  brainstormProduct = async (projectId: number, ideas: string[]): Promise<void> => {
    try {
      await axiosInstance.post(`${API_BASE_URL}/${projectId}/brainstorm`, { ideas: ideas });
      ProjectActions.brainstormProduct({ projectId: projectId, ideas: ideas });
      sendNotification(`Product brainstormed for project with ID ${projectId}`);
    } catch (error) {
      ProjectActions.updateProjectFailure({ error: String(error) });
      sendNotification(`Error brainstorming product for project with ID ${projectId}: ${error}`);
      console.error('Error brainstorming product for project:', error);
      throw error;
    }
  };
  
  launchProduct = async (project: { projectId: string; productId: string; product: Product; }): Promise<void> => {
    try {
      await axiosInstance.put(`${API_BASE_URL}/${project}/launch`);
      ProjectActions.launchProduct(project);
      sendNotification(`Product launched for project with ID ${project.projectId}`);
    } catch (error) {
      ProjectActions.updateProjectFailure({ error: String(error) });
      sendNotification(`Error launching product for project with ID ${project.projectId}: ${error}`);
      console.error('Error launching product for project:', error);
      throw error;
    }
  };
  
  performDataAnalysis = async (project:{ projectId: string; productId: string; insights: { id: string; description: string; }[]; }): Promise<void> => {
    try {
      await axiosInstance.post(`${API_BASE_URL}/${project.projectId}/data-analysis`);
      ProjectActions.performDataAnalysis(project);
      sendNotification(`Data analysis performed for project with ID ${project.projectId}`);
    } catch (error) {
      ProjectActions.updateProjectFailure({ error: String(error) });
      sendNotification(`Error performing data analysis for project with ID ${project.projectId});}: ${error}`);
      console.error('Error performing data analysis for project:', error);
      throw error;
    }
  };
  
  rewardContributors = async (projectId: number, contributors: User[], earnings: number): Promise<void> => {
    try {
      await axiosInstance.put(`${API_BASE_URL}/${projectId}/reward-contributors`, { contributors: contributors, earnings: earnings });
      ProjectActions.rewardContributors({ projectId: projectId, contributors: contributors, earnings: earnings });
      sendNotification(`Contributors rewarded for project with ID ${projectId}`);
    } catch (error) {
      ProjectActions.updateProjectFailure({ error: String(error) });
      sendNotification(`Error rewarding contributors for project with ID ${projectId}: ${error}`);
      console.error('Error rewarding contributors for project:', error);
      throw error;
    }
  };

  
  investInCommunityCoin = async (projectId: number): Promise<void> => {
    try {
      await axiosInstance.put(`${API_BASE_URL}/${projectId}/invest-in-community-coin`);
      ProjectActions.investInCommunityCoin(projectId);
      sendNotification(`Invested in community coin for project with ID ${projectId}`);
    } catch (error) {
      ProjectActions.updateProjectFailure({ error: String(error) });
      sendNotification(`Error investing in community coin for project with ID ${projectId}: ${error}`);
      console.error('Error investing in community coin for project:', error);
      throw error;
    }
  };
  
  launchCommunityCoin = async (projectId: number): Promise<void> => {
    try {
      await axiosInstance.put(`${API_BASE_URL}/${projectId}/launch-community-coin`);
      ProjectActions.launchCommunityCoin(projectId);
      sendNotification(`Community coin launched for project with ID ${projectId}`);
    } catch (error) {
      ProjectActions.updateProjectFailure({ error: String(error) });
      sendNotification(`Error launching community coin for project with ID ${projectId}: ${error}`);
      console.error('Error launching community coin for project:', error);
      throw error;
    }
  };

  getProjectById = async (projectId: number) => {
    try {
      const response = await axiosInstance.get(`${API_BASE_URL}/${projectId}`);
      return response.data;
    } catch (error) {
      ProjectActions.updateProjectFailure({ error: String(error) });
      sendNotification(`Error getting project with ID ${projectId}: ${error}`);
      console.error("Error getting project:", error);
      throw error;
    }
  };
  
  
  // Add other methods for updating, deleting, and other project-related operations similar to the ones in ApiUser.ts

}


export const projectService = new ProjectService();
export default ProjectService;
