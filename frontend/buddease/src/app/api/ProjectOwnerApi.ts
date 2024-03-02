// projectOwnerApi.ts
import {
  NotificationTypeEnum,
  useNotification,
} from "@/app/components/support/NotificationContext";
import NOTIFICATION_MESSAGES from "@/app/components/support/NotificationMessages";
import { AxiosError, AxiosResponse } from "axios";
import { observable, runInAction } from "mobx";
import { ProjectOwnerActions } from "../components/actions/ProjectOwnerActions";
import MemberData from "../components/models/teams/TeamMembers";
import Project, { ProjectData } from "../components/projects/Project";
import { endpoints } from "./ApiEndpoints";
import { handleApiError } from "./ApiLogs";
import axiosInstance from "./axiosInstance";

const API_BASE_URL = endpoints.projectOwner.base;

const { notify } = useNotification();

export const projectOwnerApiService = observable({
  createProject: async (projectData: ProjectData): Promise<any> => {
    try {
      const response = await axiosInstance.post(API_BASE_URL, projectData);
      runInAction(() => {
        // Update state or perform other MobX-related actions
        ProjectOwnerActions.createProjectSuccess(response.data); // Dispatch success action with response data
      });
      useNotification().notify(
        "Create Project Success",
        NOTIFICATION_MESSAGES.ProjectOwner.CREATE_PROJECT_SUCCESS,
        {},
        new Date(),
        NotificationTypeEnum.OperationSuccess
      );
      return response.data;
    } catch (error) {
      handleApiError(error as AxiosError<unknown>, "Failed to create project");
      notify(
        NOTIFICATION_MESSAGES.ProjectOwner.CREATE_PROJECT_ERROR,
        "Create Project Error",
        new Date(),
        NotificationTypeEnum.OperationError
      );
      throw error;
    }
  },

  inviteMember: async (
    projectId: Project,
    memberId: MemberData
  ): Promise<void> => {
    try {
      // Dispatching inviteMemberRequest action
      ProjectOwnerActions.inviteMemberRequest({ projectId, memberId });

      const response: AxiosResponse = await axiosInstance.post(
        `${API_BASE_URL}/${projectId}/invite`,
        { memberId }
      );

      runInAction(() => {
        // Update state or perform other MobX-related actions
        ProjectOwnerActions.inviteMemberSuccess(response.data); // Dispatch success action with response data
      });

      notify(
        NOTIFICATION_MESSAGES.ProjectOwner.INVITE_MEMBER_SUCCESS,
        "Invite Member Success",
        new Date(),
        NotificationTypeEnum.OperationSuccess
      );
    } catch (error) {
      handleApiError(error as AxiosError<unknown>, "Failed to invite member");
      // Dispatch inviteMemberFailure action with error message
      ProjectOwnerActions.inviteMemberFailure({
        error: NOTIFICATION_MESSAGES.Member.INVITE_MEMBER_ERROR,
      });

      notify(
        NOTIFICATION_MESSAGES.ProjectOwner.INVITE_MEMBER_ERROR,
        "Invite Member Error",
        new Date(),
        NotificationTypeEnum.OperationError
      );

      throw error;
    }
  },

  fetchUpdatedProjectDetails: async (projectId: Project): Promise<any> => {
    try {
      ProjectOwnerActions.fetchUpdatedProjectDetailsRequest({
        projectId: projectId,
      });
      const response = await axiosInstance.get(`${API_BASE_URL}/${projectId}`); // Adjust the API endpoint as per your backend
      runInAction(() => {
        // Update state or perform other MobX-related actions
        ProjectOwnerActions.fetchUpdatedProjectDetails(response.data);
        ProjectOwnerActions.fetchUpdatedProjectSuccess(response.data);
      });
      notify(
        NOTIFICATION_MESSAGES.ProjectOwner.FETCH_PROJECT_DETAILS_SUCCESS,
        "Fetch Project Details Success",
        new Date(),
        NotificationTypeEnum.OperationSuccess
      );
      return response.data;
    } catch (error) {
      handleApiError(
        error as AxiosError<unknown>,
        "Failed to fetch project details"
      );
      ProjectOwnerActions.fetchUpdatedProjectFailure({
        error: NOTIFICATION_MESSAGES.Projects.FETCH_PROJECT_DETAILS,
      });
      notify(
        NOTIFICATION_MESSAGES.ProjectOwner.FETCH_PROJECT_DETAILS_ERROR,
        "Fetch Project Details Error",
        new Date(),
        NotificationTypeEnum.OperationError
      );
      throw error;
    }
  },

  // Add runInAction for deleteProject
  deleteProject: async (projectId: string): Promise<void> => {
    try {
      await axiosInstance.delete(`${API_BASE_URL}/${projectId}`);
      runInAction(() => {
        ProjectOwnerActions.deleteProject(projectId);
        ProjectOwnerActions.deleteProjectSuccess(true);
        // Update state or perform other MobX-related actions
      });
      notify(
        NOTIFICATION_MESSAGES.ProjectOwner.DELETE_PROJECT_SUCCESS,
        "Delete Project Success",
        new Date(),
        NotificationTypeEnum.OperationSuccess
      );
    } catch (error) {
      handleApiError(error as AxiosError<unknown>, "Failed to delete project");
      notify(
        id,
        NOTIFICATION_MESSAGES.ProjectOwner.DELETE_PROJECT_ERROR,
        "Delete Project Error",
        {},
        new Date(),
        NotificationTypeEnum.OperationError
      );
      throw error;
    }
  },

  // Add runInAction for updateProject
  updateProject: async (
    projectId: string,
    updatedProjectData: Partial<Project>
  ): Promise<AxiosResponse> => {
    try {
      const response = await axiosInstance.put(
        `${API_BASE_URL}/${projectId}`,
        updatedProjectData
      );
      runInAction(() => {
        // Update state or perform other MobX-related actions
        ProjectOwnerActions.updateProjectSuccess(response.data); // Dispatch success action with updated project data
      });
      notify(
        NOTIFICATION_MESSAGES.ProjectOwner.UPDATE_PROJECT_SUCCESS,
        "Update Project Success",
        new Date(),
        NotificationTypeEnum.OperationSuccess
      );
      return response;
    } catch (error) {
      handleApiError(error as AxiosError<unknown>, "Failed to update project");
      notify(
        NOTIFICATION_MESSAGES.ProjectOwner.UPDATE_PROJECT_ERROR,
        "Update Project Error",
        new Date(),
        NotificationTypeEnum.OperationError
      );
      throw error;
    }
  },

  addTeamMember: async (projectId: string, memberId: string): Promise<void> => {
    try {
      const response: AxiosResponse = await axiosInstance.post(
        `${API_BASE_URL}/${projectId}/team/members`,
        { memberId }
      );
      runInAction(() => {
        ProjectOwnerActions.updateTeamMembersRequest(response.data);
        // Update state or perform other MobX-related actions
        ProjectOwnerActions.updateTeamMembers(response.data);
        
        ProjectOwnerActions.updateTeamMembersSuccess({
          success: NOTIFICATION_MESSAGES.Team.UPDATE_TEAM_MEMBERS_SUCCESS
        });
      });
      notify(
        NOTIFICATION_MESSAGES.ProjectOwner.ADD_TEAM_MEMBER_SUCCESS,
        "Add Team Member Success",
        new Date(),
        NotificationTypeEnum.OperationSuccess
      );
    } catch (error) {
      handleApiError(error as AxiosError<unknown>, "Failed to add team member");
      notify(
        NOTIFICATION_MESSAGES.ProjectOwner.ADD_TEAM_MEMBER_ERROR,
        "Add Team Member Error",
        new Date(),
        NotificationTypeEnum.OperationError
      );
      throw error;
    }
  },

  removeTeamMember: async (
    projectId: string,
    memberId: string
  ): Promise<void> => {
    try {
      const response: AxiosResponse = await axiosInstance.delete(
        `${API_BASE_URL}/${projectId}/team/members/${memberId}`
      );
      runInAction(() => {
        // Update state or perform other MobX-related actions
        ProjectOwnerActions.removeTeamMember(response.data);
        ProjectOwnerActions.removeTeamMemberSuccess(response.data); // Dispatch success action
      });

      notify(
        NOTIFICATION_MESSAGES.ProjectOwner.REMOVE_TEAM_MEMBER_SUCCESS,
        "Remove Team Member Success",
        new Date(),
        NotificationTypeEnum.OperationSuccess
      );
    } catch (error) {
      handleApiError(
        error as AxiosError<unknown>,
        "Failed to remove team member"
      );
      notify(
        NOTIFICATION_MESSAGES.ProjectOwner.REMOVE_TEAM_MEMBER_ERROR,
        "Remove Team Member Error",
        new Date(),
        NotificationTypeEnum.OperationError
      );
      throw error;
    }
  },

  assignTask: async (taskId: number, teamMemberId: number): Promise<void> => {
    try {
      await axiosInstance.post(`${API_BASE_URL}/tasks/${taskId}/assign`, {
        teamMemberId,
      });
      notify(
        NOTIFICATION_MESSAGES.ProjectOwner.ASSIGN_TASK_SUCCESS,
        "Assign Task Success",
        new Date(),
        NotificationTypeEnum.OperationSuccess
      );
    } catch (error) {
      handleApiError(error as AxiosError<unknown>, "Failed to assign task");
      notify(
        NOTIFICATION_MESSAGES.ProjectOwner.ASSIGN_TASK_ERROR,
        "Assign Task Error",
        new Date(),
        NotificationTypeEnum.OperationError
      );
      throw error;
    }
  },

  updateMeeting: async (
    projectId: Project,
    meetingId: number,
    updatedMeetingDetails: any
  ): Promise<void> => {
    try {
      

      ProjectOwnerActions.updateMeetingRequest({ projectId, memberId: updatedMeetingDetails });
      const response = await axiosInstance.put(
        `${API_BASE_URL}/meetings/${meetingId}`,
        updatedMeetingDetails
      );
      runInAction(() => {
        ProjectOwnerActions.updateMeetingSuccess({success: NOTIFICATION_MESSAGES.ProjectOwner.UPDATE_MEETING_SUCCESS}); // Dispatch success action
      });
      notify(
        NOTIFICATION_MESSAGES.ProjectOwner.UPDATE_MEETING_SUCCESS,
        "Update Meeting Success",
        new Date(),
        NotificationTypeEnum.OperationSuccess
      );
      return response.data;
    } catch (error) {
      handleApiError(error as AxiosError<unknown>, "Failed to update meeting");
      ProjectOwnerActions.updateMeetingFailure({error: NOTIFICATION_MESSAGES.ProjectOwner.UPDATE_MEETING_ERROR});
      notify(
        NOTIFICATION_MESSAGES.ProjectOwner.UPDATE_MEETING_ERROR,
        "Update Meeting Error",
        new Date(),
        NotificationTypeEnum.OperationError
      );
      throw error;
    }
  },

  deleteMeeting: async (meetingId: number): Promise<void> => {
    try {
      await axiosInstance.delete(`${API_BASE_URL}/meetings/${meetingId}`);
      runInAction(() => {
        ProjectOwnerActions.deleteMeetingSuccess(true); // Dispatch success action
      });
      notify(
        NOTIFICATION_MESSAGES.ProjectOwner.DELETE_MEETING_SUCCESS,
        "Delete Meeting Success",
        new Date(),
        NotificationTypeEnum.OperationSuccess
      );
    } catch (error) {
      handleApiError(error as AxiosError<unknown>, "Failed to delete meeting");
      notify(
        NOTIFICATION_MESSAGES.ProjectOwner.DELETE_MEETING_ERROR,
        "Delete Meeting Error",
        new Date(),
        NotificationTypeEnum.OperationError
      );
      throw error;
    }
  },

  // Add more API methods for project owner actions as needed
});

export default projectOwnerApiService;
