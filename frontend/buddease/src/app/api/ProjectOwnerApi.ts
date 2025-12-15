// ProjectOwnerApi.ts

import { ProjectOwnerActions } from "@/app/actions/ProjectOwnerActions";
import { handleApiError } from '@/app/api/ApiLogs';
import axiosInstance from "@/app/api/csrfToken";
import { endpoints } from "@/app/api/endpointConfigurations";
import { BaseDataEntity, DefaultMeta } from '@/app/config/BaseConfig';
import { Attachment } from '@/app/documents/attachment/Attachment';
import NOTIFICATION_MESSAGES from "@/app/features/support/NotificationMessages";
import { NotificationTypeEnum } from '@/app/features/support/UnifiedNotificationTypes';
import { Project, ProjectData } from '@/app/models/projects/Project';
import { useNotification } from '@/app/state/context/NotificationContext';
import MemberData from '@/app/typings/entities/MemberEntity';
import { AxiosError, AxiosResponse } from "axios";
import { observable, runInAction } from "mobx";

const API_BASE_URL = endpoints.projectOwner.base;

const { notify } = useNotification();

export const projectOwnerApiService = observable({
  createProject: async <
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = never,
    IncludedFields extends keyof T = keyof T
  >(
    projectData: ProjectData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): Promise<any> => {
    try {
      const response = await axiosInstance.post(`${API_BASE_URL}`, projectData);
      runInAction(() => {
        // Update state or perform other MobX-related actions
        ProjectOwnerActions.createProjectSuccess(response.data); // Dispatch success action with response data
      });
      useNotification().notify({
        id: "createProjectSuccess",
        message: NOTIFICATION_MESSAGES.ProjectOwner.CREATE_PROJECT_SUCCESS,
        data: { 
          extra: {
            operation: "Create project",
            projectData: projectData
          }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_SUCCESS,
        level: 'success'
      });
      return response.data;
    } catch (error) {
      handleApiError(error as AxiosError<unknown>, "Failed to create project");
      useNotification().notify({
        id: "createProjectError",
        message: NOTIFICATION_MESSAGES.ProjectOwner.CREATE_PROJECT_ERROR,
        data: { 
          originalError: error instanceof Error ? error.message : 'Unknown error',
          extra: {
            errorMessage: "Failed to create project",
            projectData: projectData
          }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_ERROR,
        level: 'error'
      });
      throw error;
    }
  },

  inviteMember: async <
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = never,
    IncludedFields extends keyof T = keyof T
  >(
    projectId: Project<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
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

      useNotification().notify({
        id: "inviteMemberSuccess",
        message: NOTIFICATION_MESSAGES.ProjectOwner.INVITE_MEMBER_SUCCESS,
        data: { 
          extra: {
            projectId,
            memberId,
            operation: "Invite member"
          }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_SUCCESS,
        level: 'success'
      });
    } catch (error) {
      handleApiError(error as AxiosError<unknown>, "Failed to invite member");
      // Dispatch inviteMemberFailure action with error message
      ProjectOwnerActions.inviteMemberFailure({
        error: NOTIFICATION_MESSAGES.Member.INVITE_MEMBER_ERROR,
      });

      useNotification().notify({
        id: "inviteMemberError",
        message: NOTIFICATION_MESSAGES.ProjectOwner.INVITE_MEMBER_ERROR,
        data: { 
          originalError: error instanceof Error ? error.message : 'Unknown error',
          extra: {
            errorMessage: "Failed to invite member",
            projectId,
            memberId
          }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_ERROR,
        level: 'error'
      });

      throw error;
    }
  },

  fetchUpdatedProjectDetails: async <
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = never,
    IncludedFields extends keyof T = keyof T
  >(projectId: Project<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): Promise<any> => {
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
      useNotification().notify({
        id: "fetchProjectDetailsSuccess",
        message: NOTIFICATION_MESSAGES.ProjectOwner.FETCH_PROJECT_DETAILS_SUCCESS,
        data: { 
          extra: {
            projectId,
            operation: "Fetch project details"
          }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_SUCCESS,
        level: 'success'
      });
      return response.data;
    } catch (error) {
      handleApiError(
        error as AxiosError<unknown>,
        "Failed to fetch project details"
      );
      ProjectOwnerActions.fetchUpdatedProjectFailure({
        error: NOTIFICATION_MESSAGES.Projects.FETCH_PROJECT_DETAILS,
      });
      useNotification().notify({
        id: "fetchProjectDetailsError",
        message: NOTIFICATION_MESSAGES.ProjectOwner.FETCH_PROJECT_DETAILS_ERROR,
        data: { 
          originalError: error instanceof Error ? error.message : 'Unknown error',
          extra: {
            errorMessage: "Failed to fetch project details",
            projectId
          }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_ERROR,
        level: 'error'
      });
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
      useNotification().notify({
        id: "deleteProjectSuccess",
        message: NOTIFICATION_MESSAGES.ProjectOwner.DELETE_PROJECT_SUCCESS,
        data: { 
          extra: {
            projectId,
            operation: "Delete project"
          }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_SUCCESS,
        level: 'success'
      });
    } catch (error) {
      handleApiError(error as AxiosError<unknown>, "Failed to delete project");
      useNotification().notify({
        id: "deleteProjectError",
        message: NOTIFICATION_MESSAGES.ProjectOwner.DELETE_PROJECT_ERROR,
        data: { 
          originalError: error instanceof Error ? error.message : 'Unknown error',
          extra: {
            errorMessage: "Failed to delete project",
            projectId
          }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_ERROR,
        level: 'error'
      });
      throw error;
    }
  },

  // Add runInAction for updateProject
  updateProject: async <
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = never,
    IncludedFields extends keyof T = keyof T
  >(
    projectId: string,
    updatedProjectData: Partial<Project<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>
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
      useNotification().notify({
        id: "updateProjectSuccess",
        message: NOTIFICATION_MESSAGES.ProjectOwner.UPDATE_PROJECT_SUCCESS,
        data: { 
          extra: {
            projectId,
            operation: "Update project",
            updatedData: updatedProjectData
          }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_SUCCESS,
        level: 'success'
      });
      return response;
    } catch (error) {
      handleApiError(error as AxiosError<unknown>, "Failed to update project");
      useNotification().notify({
        id: "updateProjectError",
        message: NOTIFICATION_MESSAGES.ProjectOwner.UPDATE_PROJECT_ERROR,
        data: { 
          originalError: error instanceof Error ? error.message : 'Unknown error',
          extra: {
            errorMessage: "Failed to update project",
            projectId,
            updatedData: updatedProjectData
          }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_ERROR,
        level: 'error'
      });
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
      useNotification().notify({
        id: "addTeamMemberSuccess",
        message: NOTIFICATION_MESSAGES.ProjectOwner.ADD_TEAM_MEMBER_SUCCESS,
        data: { 
          extra: {
            projectId,
            memberId,
            operation: "Add team member"
          }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_SUCCESS,
        level: 'success'
      });
    } catch (error) {
      handleApiError(error as AxiosError<unknown>, "Failed to add team member");
      useNotification().notify({
        id: "addTeamMemberError",
        message: NOTIFICATION_MESSAGES.ProjectOwner.ADD_TEAM_MEMBER_ERROR,
        data: { 
          originalError: error instanceof Error ? error.message : 'Unknown error',
          extra: {
            errorMessage: "Failed to add team member",
            projectId,
            memberId
          }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_ERROR,
        level: 'error'
      });
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

      useNotification().notify({
        id: "removeTeamMemberSuccess",
        message: NOTIFICATION_MESSAGES.ProjectOwner.REMOVE_TEAM_MEMBER_SUCCESS,
        data: { 
          extra: {
            projectId,
            memberId,
            operation: "Remove team member"
          }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_SUCCESS,
        level: 'success'
      });
    } catch (error) {
      handleApiError(
        error as AxiosError<unknown>,
        "Failed to remove team member"
      );
      useNotification().notify({
        id: "removeTeamMemberError",
        message: NOTIFICATION_MESSAGES.ProjectOwner.REMOVE_TEAM_MEMBER_ERROR,
        data: { 
          originalError: error instanceof Error ? error.message : 'Unknown error',
          extra: {
            errorMessage: "Failed to remove team member",
            projectId,
            memberId
          }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_ERROR,
        level: 'error'
      });
      throw error;
    }
  },

  assignTask: async (taskId: number, teamMemberId: number): Promise<void> => {
    try {
      await axiosInstance.post(`${API_BASE_URL}/tasks/${taskId}/assign`, {
        teamMemberId,
      });
      useNotification().notify({
        id: "assignTaskSuccess",
        message: NOTIFICATION_MESSAGES.ProjectOwner.ASSIGN_TASK_SUCCESS,
        data: { 
          extra: {
            taskId,
            teamMemberId,
            operation: "Assign task"
          }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_SUCCESS,
        level: 'success'
      });
    } catch (error) {
      handleApiError(error as AxiosError<unknown>, "Failed to assign task");
      useNotification().notify({
        id: "assignTaskError",
        message: NOTIFICATION_MESSAGES.ProjectOwner.ASSIGN_TASK_ERROR,
        data: { 
          originalError: error instanceof Error ? error.message : 'Unknown error',
          extra: {
            errorMessage: "Failed to assign task",
            taskId,
            teamMemberId
          }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_ERROR,
        level: 'error'
      });
      throw error;
    }
  },

  updateMeeting: async <
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = never,
    IncludedFields extends keyof T = keyof T
  >(
    projectId: Project<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
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
      useNotification().notify({
        id: "updateMeetingSuccess",
        message: NOTIFICATION_MESSAGES.ProjectOwner.UPDATE_MEETING_SUCCESS,
        data: { 
          extra: {
            projectId,
            meetingId,
            operation: "Update meeting"
          }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_SUCCESS,
        level: 'success'
      });
      return response.data;
    } catch (error) {
      handleApiError(error as AxiosError<unknown>, "Failed to update meeting");
      ProjectOwnerActions.updateMeetingFailure({error: NOTIFICATION_MESSAGES.ProjectOwner.UPDATE_MEETING_ERROR});
      useNotification().notify({
        id: "updateMeetingError",
        message: NOTIFICATION_MESSAGES.ProjectOwner.UPDATE_MEETING_ERROR,
        data: { 
          originalError: error instanceof Error ? error.message : 'Unknown error',
          extra: {
            errorMessage: "Failed to update meeting",
            projectId,
            meetingId
          }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_ERROR,
        level: 'error'
      });
      throw error;
    }
  },

  deleteMeeting: async (meetingId: number): Promise<void> => {
    try {
      await axiosInstance.delete(`${API_BASE_URL}/meetings/${meetingId}`);
      runInAction(() => {
        ProjectOwnerActions.deleteMeetingSuccess(true); // Dispatch success action
      });
      useNotification().notify({
        id: "deleteMeetingSuccess",
        message: NOTIFICATION_MESSAGES.ProjectOwner.DELETE_MEETING_SUCCESS,
        data: { 
          extra: {
            meetingId,
            operation: "Delete meeting"
          }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_SUCCESS,
        level: 'success'
      });
    } catch (error) {
      handleApiError(error as AxiosError<unknown>, "Failed to delete meeting");
      useNotification().notify({
        id: "deleteMeetingError",
        message: NOTIFICATION_MESSAGES.ProjectOwner.DELETE_MEETING_ERROR,
        data: { 
          originalError: error instanceof Error ? error.message : 'Unknown error',
          extra: {
            errorMessage: "Failed to delete meeting",
            meetingId
          }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_ERROR,
        level: 'error'
      });
      throw error;
    }
  },

  // Add more API methods for project owner actions as needed
});

export default projectOwnerApiService;
