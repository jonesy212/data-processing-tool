// ProjectOwnerEndpoints.ts
import { EndpointConfig } from '@/config/EndpointConfig';

export interface ProjectOwnerEndpoints {
  base: EndpointConfig;
  list: EndpointConfig;
  single: (ownerId: number) => EndpointConfig;
  createProject: EndpointConfig;
  addTeamMember: EndpointConfig;
  removeTeamMember: (projectId: number, memberId: number) => EndpointConfig;
  signTask: (taskId: number) => EndpointConfig;
  createMeeting: EndpointConfig;
  updateMeeting: (meetingId: number) => EndpointConfig;
  deleteMeeting: (meetingId: number) => EndpointConfig;
  manageProject: (projectId: number) => EndpointConfig;
  inviteMember: (projectId: number, memberId: number) => EndpointConfig;
  fetchProjectMembers: (projectId: string) => EndpointConfig;
  fetchProjectTasks: (projectId: string) => EndpointConfig;
  fetchProjectMeetings: (projectId: string) => EndpointConfig;
  fetchProjectComments: (projectId: string) => EndpointConfig;
  uploadFileToProject: (projectId: string) => EndpointConfig;
  fetchProjectFiles: (projectId: string) => EndpointConfig;
  generateProjectReport: (projectId: string) => EndpointConfig;
  fetchProjectAnalytics: (projectId: string) => EndpointConfig;
  manageProjectNotifications: (projectId: string) => EndpointConfig;
}