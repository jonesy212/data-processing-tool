// projectOwnerConfig.ts
import { BASE_URL } from '@/core/api/baseUrl';
import { ProjectOwnerEndpoints } from '@/core/typings/categories/ProjectOwnerEndpoints';

export const projectOwnerConfig: ProjectOwnerEndpoints = {
  base: { path: `${BASE_URL}/api/project/owner`, method: "GET" },
  list: { path: `${BASE_URL}/api/project-owners`, method: "GET" },
  single: (ownerId: number) => ({ path: `${BASE_URL}/api/project-owners/${ownerId}`, method: "GET" }),
  createProject: { path: `${BASE_URL}/api/project-owners/create-project`, method: "POST" },
  addTeamMember: { path: `${BASE_URL}/api/project/owner/team/members`, method: "POST" },
  removeTeamMember: (projectId: number, memberId: number) => ({ path: `${BASE_URL}/api/project/owner/team/members/${projectId}/${memberId}`, method: "DELETE" }),
  signTask: (taskId: number) => ({ path: `${BASE_URL}/api/project/owner/tasks/${taskId}/assign`, method: "POST" }),
  createMeeting: { path: `${BASE_URL}/api/project/owner/meetings`, method: "POST" },
  updateMeeting: (meetingId: number) => ({ path: `${BASE_URL}/api/project/owner/meetings/${meetingId}`, method: "PUT" }),
  deleteMeeting: (meetingId: number) => ({ path: `${BASE_URL}/api/project/owner/meetings/${meetingId}`, method: "DELETE" }),
  manageProject: (projectId: number) => ({ path: `${BASE_URL}/api/project-owners/projects/${projectId}/manage`, method: "POST" }),
  inviteMember: (projectId: number, memberId: number) => ({ path: `${BASE_URL}/api/project-owners/projects/${projectId}/invite/${memberId}`, method: "POST" }),
  fetchProjectMembers: (projectId: string) => ({ path: `${BASE_URL}/api/project/owner/${projectId}/members`, method: "GET" }),
  fetchProjectTasks: (projectId: string) => ({ path: `${BASE_URL}/api/project/owner/${projectId}/tasks`, method: "GET" }),
  fetchProjectMeetings: (projectId: string) => ({ path: `${BASE_URL}/api/project/owner/${projectId}/meetings`, method: "GET" }),
  fetchProjectComments: (projectId: string) => ({ path: `${BASE_URL}/api/project/owner/${projectId}/comments`, method: "GET" }),
  uploadFileToProject: (projectId: string) => ({ path: `${BASE_URL}/api/project/owner/${projectId}/files`, method: "POST" }),
  fetchProjectFiles: (projectId: string) => ({ path: `${BASE_URL}/api/project/owner/${projectId}/files`, method: "GET" }),
  generateProjectReport: (projectId: string) => ({ path: `${BASE_URL}/api/project/owner/${projectId}/report`, method: "POST" }),
  fetchProjectAnalytics: (projectId: string) => ({ path: `${BASE_URL}/api/project/owner/${projectId}/analytics`, method: "GET" }),
  manageProjectNotifications: (projectId: string) => ({ path: `${BASE_URL}/api/project/owner/${projectId}/notifications`, method: "POST" }),
};