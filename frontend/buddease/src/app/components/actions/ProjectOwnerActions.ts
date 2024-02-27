// ProjectOwnerActions.ts

import { createAction } from '@reduxjs/toolkit';
import { Team } from '../models/teams/Team';
import MemberData, { TeamMember } from '../models/teams/TeamMembers';
import Project, { ProjectData } from '../projects/Project';

export const ProjectOwnerActions = {
  // Action creators for creating a project
  createProjectRequest: createAction<ProjectData>('projectOwner/createProjectRequest'),
  createProjectSuccess: createAction('projectOwner/createProjectSuccess'),
  createProjectFailure: createAction<{error: string}>('projectOwner/createProjectFailure'),

  
  inviteMemberRequest: createAction<{ projectId: Project, memberId: MemberData}>('projectOwner/inviteMemberRequest'),
  inviteMemberSuccess: createAction<{ success: string }>('projectOwner/inviteMemberSuccess'),
  inviteMemberFailure: createAction<{error: string}>('projectOwner/inviteMemberFailure'),

  fetchUpdatedProjectDetails: createAction<Project>('projectOwner/fetchUpdatedProjectDetails'),
  fetchUpdatedProjectDetailsRequest: createAction<{ projectId: Project }>('projectOwner/fetchUpdatedProjectDetailsRequest'),
  fetchUpdatedProjectSuccess: createAction<{ projectId: Project }>('projectOwner/fetchUpdatedProjectSuccess'),
  fetchUpdatedProjectFailure: createAction<{error: string}>('projectOwner/fetchUpdatedProjectFailure'),

  updatedProjectDetails: createAction<{ project: Project; type: string }>('projectOwner/updatedProjectDetails'),
  
  updateProjectFailure: createAction<{error:string}>('projectOwner/updateProjectFailure'),
  updateProjectSuccess: createAction<{project: Project, type: string }>('projectOwner/updateProjectSuccess'),
  
  deleteProject: createAction<string>('projectOwner/deleteProject'),
  deleteProjectSuccess: createAction<boolean>('projectOwner/deleteProjectSuccess'),

  updateMeeting: createAction<{meetingId: string, memberId: MemberData}>('projectOwner/updateMeeting'),
  updateMeetingRequest: createAction < { projectId: Project, memberId: MemberData }>('projectOwner/updateMeetingRequest'),
  updateMeetingSuccess: createAction<{ success: string }>('projectOwner/updateMeetingSuccess'),
  updateMeetingFailure: createAction<{ error: string }>('projectOwner/updateMeetingFailure'),
  
  
  deleeteMeeting: createAction < { success: boolean }>('projectOwner/deleteMeeting'),
  deleteMeetingRequest: createAction < { projectId: Project, memberId: MemberData }>('projectOwner/deleteMeetingRequest'),
  deleteMeetingSuccess: createAction<boolean>('projectOwner/deleteMeetingSuccess'),
  deleteMeetingFailure: createAction<{error: string}>('projectOwner/deleteMeetingFailure'),

  udpateTeamMember: createAction<{member: TeamMember[], team: Team}>('projectOwner/udpateTeamMember'),
  updateTeamMemberRequest: createAction<boolean>('projectOwner/updateteamMember'),
  updateTeamMemberSuccess: createAction<boolean>('projectOwner/updateTeamMember'),

  removeTeamMember: createAction<boolean>('projectOwner/removeTeamMember'),
  removeTeamMemberRequest: createAction<boolean>('projectOwner/removeTeamMemberRequest'),
  removeTeamMemberSuccess: createAction<boolean>('projectOwner/removeTeamMemberSuccess'),
  removeTeamMemberFailure: createAction<{error: string}>('projectOwner/removeTeamMemberFailure'),



  //batch Actions
    
  updateTeamMembers: createAction<{teamMembers: TeamMember[]}>('projectOwner/updateTeamMembers'),
  updateTeamMembersRequest: createAction<{teamMembers: TeamMember}>('projectOwner/updateTeamMembers'),
  updateTeamMembersSuccess: createAction<{ success: string}>('projectOwner/updateTeamMembers'),
  updateTeamsFailure: createAction<boolean>('projectOwner/updateTeamFailure'),

};
