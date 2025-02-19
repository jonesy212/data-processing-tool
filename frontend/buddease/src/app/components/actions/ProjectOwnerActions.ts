import { createAction } from '@reduxjs/toolkit';
import { Team } from '../models/teams/Team';
import MemberData, { TeamMember } from '../models/teams/TeamMembers';
import  { ProjectData , Project} from '../projects/Project';
import { User } from '../users/User';

export const ProjectOwnerActions = {
  // Action creators for creating a project
  createProjectRequest: createAction<ProjectData>('projectOwner/createProjectRequest'),
  createProjectSuccess: createAction('projectOwner/createProjectSuccess'),
  createProjectFailure: createAction<{error: string}>('projectOwner/createProjectFailure'),

  // Action creators for inviting members to a project
  inviteMemberRequest: createAction<{ projectId: Project, memberId: MemberData}>('projectOwner/inviteMemberRequest'),
  inviteMemberSuccess: createAction<{ success: string }>('projectOwner/inviteMemberSuccess'),
  inviteMemberFailure: createAction<{error: string}>('projectOwner/inviteMemberFailure'),

  // Action creators for fetching updated project details
  fetchUpdatedProjectDetails: createAction<Project>('projectOwner/fetchUpdatedProjectDetails'),
  fetchUpdatedProjectDetailsRequest: createAction<{ projectId: Project }>('projectOwner/fetchUpdatedProjectDetailsRequest'),
  fetchUpdatedProjectSuccess: createAction<{ projectId: Project }>('projectOwner/fetchUpdatedProjectSuccess'),
  fetchUpdatedProjectFailure: createAction<{error: string}>('projectOwner/fetchUpdatedProjectFailure'),

  // Action creators for updating project details
  updatedProjectDetails: createAction<{ project: Project; type: string }>('projectOwner/updatedProjectDetails'),
  updateProjectFailure: createAction<{error:string}>('projectOwner/updateProjectFailure'),
  updateProjectSuccess: createAction<{project: Project, type: string }>('projectOwner/updateProjectSuccess'),

  // Action creators for deleting a project
  deleteProject: createAction<string>('projectOwner/deleteProject'),
  deleteProjectSuccess: createAction<boolean>('projectOwner/deleteProjectSuccess'),

  // Action creators for updating meeting details
  updateMeeting: createAction<{meetingId: string, memberId: MemberData}>('projectOwner/updateMeeting'),
  updateMeetingRequest: createAction < { projectId: Project, memberId: MemberData }>('projectOwner/updateMeetingRequest'),
  updateMeetingSuccess: createAction<{ success: string }>('projectOwner/updateMeetingSuccess'),
  updateMeetingFailure: createAction<{ error: string }>('projectOwner/updateMeetingFailure'),

  // Action creators for deleting a meeting
  deleeteMeeting: createAction < { success: boolean }>('projectOwner/deleteMeeting'),
  deleteMeetingRequest: createAction < { projectId: Project, memberId: MemberData }>('projectOwner/deleteMeetingRequest'),
  deleteMeetingSuccess: createAction<boolean>('projectOwner/deleteMeetingSuccess'),
  deleteMeetingFailure: createAction<{error: string}>('projectOwner/deleteMeetingFailure'),

  // Action creators for updating team members
  udpateTeamMember: createAction<{member: TeamMember[], team: Team}>('projectOwner/udpateTeamMember'),
  updateTeamMemberRequest: createAction<boolean>('projectOwner/updateteamMember'),
  updateTeamMemberSuccess: createAction<boolean>('projectOwner/updateTeamMember'),

  // Action creators for removing team members
  removeTeamMember: createAction<boolean>('projectOwner/removeTeamMember'),
  removeTeamMemberRequest: createAction<boolean>('projectOwner/removeTeamMemberRequest'),
  removeTeamMemberSuccess: createAction<boolean>('projectOwner/removeTeamMemberSuccess'),
  removeTeamMemberFailure: createAction<{error: string}>('projectOwner/removeTeamMemberFailure'),

  // Batch actions for updating team members
  updateTeamMembers: createAction<{teamMembers: TeamMember[]}>('projectOwner/updateTeamMembers'),
  updateTeamMembersRequest: createAction<{teamMembers: TeamMember}>('projectOwner/updateTeamMembers'),
  updateTeamMembersSuccess: createAction<{ success: string}>('projectOwner/updateTeamMembers'),
  updateTeamsFailure: createAction<boolean>('projectOwner/updateTeamFailure'),

  // Additional actions specific to Project Owner
  assignOwnership: createAction<{ projectId: number; ownerId: string }>(
    "assignOwnership"
  ),
  manageContributors: createAction<{ projectId: number; contributors: User[] }>(
    "manageContributors"
  ),
  archiveProject: createAction<{ projectId: number }>("archiveProject"),
  unarchiveProject: createAction<{ projectId: number }>("unarchiveProject"),
  rewardContributors: createAction<{
    projectId: number;
    contributors: User[];
    earnings: number;
  }>("rewardContributors"),
  performDataAnalysis: createAction<{ projectId: number }>("performDataAnalysis"),
  manageCommunityCoin: createAction<{ projectId: number }>("manageCommunityCoin"),
  // Add more actions as needed
};
