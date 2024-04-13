// ApiProject.ts
import { AxiosError } from "axios";
import { observable } from "mobx";
import { MeetingData } from "../components/calendar/MeetingData";
import { Meeting } from "../components/communications/scheduler/Meeting";
import FileData from "../components/models/data/FileData";
import { Task } from "../components/models/tasks/Task";
import { Project, ProjectData } from "../components/projects/Project";
import { endpoints } from "./ApiEndpoints";
import { handleApiError } from "./ApiLogs";
import axiosInstance from "./axiosInstance";

const API_BASE_URL = endpoints.projectOwner.base;

export const ApiProject = observable({
  fetchProjectOwner: async (projectId: string): Promise<any> => {
    try {
      const response = await axiosInstance.get(
        `${API_BASE_URL}/owner/${projectId}`
      );
      return response.data;
    } catch (error: any) {
      handleApiError(error, "Failed to fetch project owner");
      throw error;
    }
  },

  fetchProjectDetails: async (projectId: string): Promise<any> => {
    try {
      const response = await axiosInstance.get(`${API_BASE_URL}/${projectId}`);
      return response.data;
    } catch (error) {
      handleApiError(
        error as AxiosError<unknown>,
        "Failed to fetch project details"
      );
      throw error;
    }
  },

  addProject: async (projectData: Project): Promise<any> => {
    try {
      const response = await axiosInstance.post(`${API_BASE_URL}`, projectData);
      return response.data;
    } catch (error) {
      handleApiError(error as AxiosError<unknown>, "Failed to add project");
      throw error;
    }
  },

  updateProject: async (
    projectId: string,
    updatedProjectData: Partial<ProjectData>
  ): Promise<any> => {
    try {
      const response = await axiosInstance.put(
        `${API_BASE_URL}/${projectId}`,
        updatedProjectData
      );
      return response.data;
    } catch (error) {
      handleApiError(error as AxiosError<unknown>, "Failed to update project");
      throw error;
    }
  },

  createProject: async (projectData: Project): Promise<any> => {
    try {
      const response = await axiosInstance.post(`${API_BASE_URL}`, projectData);
      return response.data;
    } catch (error) {
      handleApiError(error as AxiosError<unknown>, "Failed to create project");
      throw error;
    }
  },

  updateProjectDetails: async (
    projectId: string,
    updatedProjectData: Partial<Project>
  ): Promise<any> => {
    try {
      const response = await axiosInstance.put(
        `${API_BASE_URL}/${projectId}`,
        updatedProjectData
      );
      return response.data;
    } catch (error) {
      handleApiError(
        error as AxiosError<unknown>,
        "Failed to update project details"
      );
      throw error;
    }
  },

  deleteProject: async (projectId: string): Promise<void> => {
    try {
      await axiosInstance.delete(`${API_BASE_URL}/${projectId}`);
    } catch (error) {
      handleApiError(error as AxiosError<unknown>, "Failed to delete project");
      throw error;
    }
  },

  inviteMemberToProject: async (
    projectId: string,
    memberId: string
  ): Promise<void> => {
    try {
      await axiosInstance.post(`${API_BASE_URL}/${projectId}/members`, {
        memberId,
      });
    } catch (error) {
      handleApiError(
        error as AxiosError<unknown>,
        "Failed to invite member to project"
      );
      throw error;
    }
  },

  removeMemberFromProject: async (
    projectId: string,
    memberId: string
  ): Promise<void> => {
    try {
      await axiosInstance.delete(
        `${API_BASE_URL}/${projectId}/members/${memberId}`
      );
    } catch (error) {
      handleApiError(
        error as AxiosError<unknown>,
        "Failed to remove member from project"
      );
      throw error;
    }
  },

  assignTaskToMember: async (
    projectId: string,
    taskId: string,
    memberId: string
  ): Promise<void> => {
    try {
      await axiosInstance.put(
        `${API_BASE_URL}/${projectId}/tasks/${taskId}/assign`,
        { memberId }
      );
    } catch (error) {
      handleApiError(
        error as AxiosError<unknown>,
        "Failed to assign task to member"
      );
      throw error;
    }
  },

  updateTaskDetails: async (
    projectId: string,
    taskId: string,
    updatedTaskData: Partial<Task>
  ): Promise<void> => {
    try {
      await axiosInstance.put(
        `${API_BASE_URL}/${projectId}/tasks/${taskId}`,
        updatedTaskData
      );
    } catch (error) {
      handleApiError(
        error as AxiosError<unknown>,
        "Failed to update task details"
      );
      throw error;
    }
  },

  deleteTask: async (projectId: string, taskId: string): Promise<void> => {
    try {
      await axiosInstance.delete(
        `${API_BASE_URL}/${projectId}/tasks/${taskId}`
      );
    } catch (error) {
      handleApiError(error as AxiosError<unknown>, "Failed to delete task");
      throw error;
    }
  },

  createMeetingForProject: async (
    projectId: string,
    meetingData: MeetingData
  ): Promise<void> => {
    try {
      await axiosInstance.post(
        `${API_BASE_URL}/${projectId}/meetings`,
        meetingData
      );
    } catch (error) {
      handleApiError(
        error as AxiosError<unknown>,
        "Failed to create meeting for project"
      );
      throw error;
    }
  },

  updateMeetingDetails: async (
    projectId: string,
    meetingId: string,
    updatedMeetingData: Partial<Meeting>
  ): Promise<void> => {
    try {
      await axiosInstance.put(
        `${API_BASE_URL}/${projectId}/meetings/${meetingId}`,
        updatedMeetingData
      );
    } catch (error) {
      handleApiError(
        error as AxiosError<unknown>,
        "Failed to update meeting details"
      );
      throw error;
    }
  },

  deleteMeetingFromProject: async (
    projectId: string,
    meetingId: string
  ): Promise<void> => {
    try {
      await axiosInstance.delete(
        `${API_BASE_URL}/${projectId}/meetings/${meetingId}`
      );
    } catch (error) {
      handleApiError(
        error as AxiosError<unknown>,
        "Failed to delete meeting from project"
      );
      throw error;
    }
  },

  fetchProjects: async (): Promise<any> => {
    try {
      const response = await axiosInstance.get(`${API_BASE_URL}`);
      return response.data;
    } catch (error) {
      handleApiError(error as AxiosError<unknown>, "Failed to fetch projects");
      throw error;
    }
  },

  fetchProjectMembers: async (projectId: string): Promise<any> => {
    try {
      const response = await axiosInstance.get(
        `${API_BASE_URL}/${projectId}/members`
      );
      return response.data;
    } catch (error) {
      handleApiError(
        error as AxiosError<unknown>,
        "Failed to fetch project members"
      );
      throw error;
    }
  },

  fetchProjectTasks: async (projectId: string): Promise<any> => {
    try {
      const response = await axiosInstance.get(
        `${API_BASE_URL}/${projectId}/tasks`
      );
      return response.data;
    } catch (error) {
      handleApiError(
        error as AxiosError<unknown>,
        "Failed to fetch project tasks"
      );
      throw error;
    }
  },

  fetchProjectMeetings: async (projectId: string): Promise<any> => {
    try {
      const response = await axiosInstance.get(
        `${API_BASE_URL}/${projectId}/meetings`
      );
      return response.data;
    } catch (error) {
      handleApiError(
        error as AxiosError<unknown>,
        "Failed to fetch project meetings"
      );
      throw error;
    }
  },

  fetchProjectComments: async (projectId: string): Promise<any> => {
    try {
      const response = await axiosInstance.get(
        `${API_BASE_URL}/${projectId}/comments`
      );
      return response.data;
    } catch (error) {
      handleApiError(
        error as AxiosError<unknown>,
        "Failed to fetch project comments"
      );
      throw error;
    }
  },

  uploadFileToProject: async (
    projectId: string,
    fileData: FileData
  ): Promise<void> => {
    try {
      await axiosInstance.post(`${API_BASE_URL}/${projectId}/files`, fileData);
    } catch (error) {
      handleApiError(
        error as AxiosError<unknown>,
        "Failed to upload file to project"
      );
      throw error;
    }
  },

  fetchProjectFiles: async (projectId: string): Promise<any> => {
    try {
      const response = await axiosInstance.get(
        `${API_BASE_URL}/${projectId}/files`
      );
      return response.data;
    } catch (error) {
      handleApiError(
        error as AxiosError<unknown>,
        "Failed to fetch project files"
      );
      throw error;
    }
  },

  generateProjectReport: async (projectId: string): Promise<any> => {
    try {
      const response = await axiosInstance.get(
        `${API_BASE_URL}/${projectId}/report`
      );
      return response.data;
    } catch (error) {
      handleApiError(
        error as AxiosError<unknown>,
        "Failed to generate project report"
      );
      throw error;
    }
  },

  fetchProjectAnalytics: async (projectId: string): Promise<any> => {
    try {
      const response = await axiosInstance.get(
        `${API_BASE_URL}/${projectId}/analytics`
      );
      return response.data;
    } catch (error) {
      handleApiError(
        error as AxiosError<unknown>,
        "Failed to fetch project analytics"
      );
      throw error;
    }
  },

  manageProjectNotifications: async (
    projectId: string,
    notificationSettings: NotificationSettings
  ): Promise<void> => {
    try {
      await axiosInstance.put(
        `${API_BASE_URL}/${projectId}/notifications`,
        notificationSettings
      );
    } catch (error) {
      handleApiError(
        error as AxiosError<unknown>,
        "Failed to manage project notifications"
      );
      throw error;
    }
  },

  // Example function for non-project owner to submit task
  submitTask: async (projectId: string, taskData: any): Promise<any> => {
    try {
      const response = await axiosInstance.post(
        `${API_BASE_URL}/${projectId}/tasks`,
        taskData
      );
      return response.data;
    } catch (error) {
      handleApiError(error as AxiosError<unknown>, "Failed to submit task");
      throw error;
    }
  },

  // Example function for non-project owner to update task status
  updateTaskStatus: async (
    projectId: string,
    taskId: string,
    status: string
  ): Promise<void> => {
    try {
      await axiosInstance.put(`${API_BASE_URL}/${projectId}/tasks/${taskId}`, {
        status,
      });
    } catch (error) {
      handleApiError(
        error as AxiosError<unknown>,
        "Failed to update task status"
      );
      throw error;
    }
  },

  // Add more functions as needed
});

export default ApiProject;
