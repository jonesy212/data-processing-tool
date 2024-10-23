// AssignTeamMemberStore.tsx
import { makeAutoObservable } from "mobx";
import { TeamMember } from "../../models/teams/TeamMembers";
import NOTIFICATION_MESSAGES from "../../support/NotificationMessages";
import { AssignBaseStore, useAssignBaseStore } from "../AssignBaseStore";
import { Message } from "@/app/generators/GenerateChatInterfaces";
import { NotificationType } from "../../support/NotificationContext";



export interface AssignTeamMemberStore extends AssignBaseStore {
  assignTeamMember: (teamId: string, userId: string) => void;
  
  assignNoteToTeam: Record<string, string[]>
  unassignTeamMember: (teamId: string, userId: string) => void;
  reassignTeamMember: (teamId: string, oldUserId: string, newUserId: string) => void;
  assignTeamMembersToTeams: (teamIds: string[], userId: string) => void;
  unassignTeamMembersFromTeams: (teamIds: string[], userId: string) => void;
  reassignTeamMembersToTeams: (teamIds: string[], oldUserId: string, newUserId: string) => void;
  assignTeamMemberSuccess: () => void;
  assignTeamMemberFailure: (error: string) => void;
  //bulk assignments
  assignUsersToTeams: (teamIds: string[], userId: string) => void;
  unassignUsersFromTeams: (teamIds: string[], userId: string) => void;
  reassignUsersInTeams: (teamIds: string[], oldUserId: string, newUserId: string) => void;
  getAssignedTeamMembers: (teamId: string, userIds: string[]) => (TeamMember | null)[];

  shareResource: (teamId: string, resource: string, userId: string) => void;
  unshareResource: (teamId: string, resource: string, userId: string) => void;
  trackProjectProgress: (teamId: string, projectId: string, progress: number) => void;
  updateProjectProgress: (teamId: string,  projectId: string, progress: number) => void;  
  trackTaskProgress: (teamId: string, taskId: string,  progress: number) => void;
  
}
const useAssignTeamMemberStore = (): AssignTeamMemberStore => {
  const { ...baseStore } = useAssignBaseStore();

  // Use spread operator to create a shallow copy of assignedTeams
  const assignedTeams: Record<string, string[]> = {
    ...baseStore.assignedTeams,
  };

  // Create a separate record for team members
  const assignedTeamMembers: Record<string, string[]> = {};

  const assignTeamMember = (teamId: string, userId: string) => {
    // Update assignedTeamMembers instead of assignedTeams
    if (!assignedTeamMembers[teamId]) {
      assignedTeamMembers[teamId] = [userId];
    } else {
      assignedTeamMembers[teamId].push(userId);
    }
    // TODO: Implement any additional logic needed when assigning a team member
  };

  const assignNote: Record<string, string[]> = {};

  const assignNoteToTeam: Record<string, string[]> = {};

  const unassignTeamMember = (teamId: string, userId: string) => {
    if (assignedTeamMembers[teamId]) {
      assignedTeamMembers[teamId] = assignedTeamMembers[teamId].filter(
        (id) => id !== userId
      );

      if (assignedTeamMembers[teamId].length === 0) {
        delete assignedTeamMembers[teamId];
      }
    }
    // TODO: Implement any additional logic needed when unassigning a team member
  };

  const reassignTeamMember = (
    teamId: string,
    oldUserId: string,
    newUserId: string
  ) => {
    if (assignedTeamMembers[teamId]) {
      assignedTeamMembers[teamId] = [
        ...assignedTeamMembers[teamId].filter((id) => id !== oldUserId),
        newUserId,
      ];

      if (assignedTeamMembers[teamId].length === 0) {
        delete assignedTeamMembers[teamId];
      }
    }
    // TODO: Implement any additional logic needed when reassigning a team member from old user to new user
  };

  const assignTeamMembersToTeams = (teamIds: string[], userId: string) => {
    teamIds.forEach((teamId) => {
      if (!assignedTeamMembers[teamId]) {
        assignedTeamMembers[teamId] = [userId];
      } else {
        assignedTeamMembers[teamId].push(userId);
      }
    });
    // TODO: Implement any additional logic needed when assigning a team member to multiple teams
  };

  const unassignTeamMembersFromTeams = (teamIds: string[], userId: string) => {
    teamIds.forEach((teamId) => {
      if (assignedTeamMembers[teamId]) {
        assignedTeamMembers[teamId] = assignedTeamMembers[teamId].filter(
          (id) => id !== userId
        );

        if (assignedTeamMembers[teamId].length === 0) {
          delete assignedTeamMembers[teamId];
        }
      }
    });
    // TODO: Implement any additional logic needed when unassigning a team member from multiple teams
  };

  // Bulk assignment methods
  const assignUsersToTeams = (teamIds: string[], userId: string) => {
    teamIds.forEach((teamId) => {
      assignTeamMember(teamId, userId);
    });
    // Additional logic for bulk assignment if needed
  };

  const unassignUsersFromTeams = (teamIds: string[], userId: string) => {
    teamIds.forEach((teamId) => {
      unassignTeamMember(teamId, userId);
    });
    // Additional logic for bulk unassignment if needed
  };

  const reassignUsersInTeams = (
    teamIds: string[],
    oldUserId: string,
    newUserId: string
  ) => {
    teamIds.forEach((teamId) => {
      reassignTeamMember(teamId, oldUserId, newUserId);
    });
    // Additional logic for bulk reassignment if needed
  };

  //todo fix password showing as being apart of this
  const getAssignedTeamMembers = (teamId: string, userIds: string[]) => {
    return userIds
      .map((userId) => {
        const team = assignedTeamMembers[teamId];
        if (team && team.includes(userId)) {
          return {
            teamId,
            userId,
          } as unknown as TeamMember;
        }
        return null;
      })
      .filter((member) => member);
  };

  const reassignTeamMembersToTeams = (
    teamIds: string[],
    oldUserId: string,
    newUserId: string
  ) => {
    teamIds.forEach((teamId) => {
      if (assignedTeamMembers[teamId]) {
        assignedTeamMembers[teamId] = [
          ...assignedTeamMembers[teamId].filter((id) => id !== oldUserId),
          newUserId,
        ];

        if (assignedTeamMembers[teamId].length === 0) {
          delete assignedTeamMembers[teamId];
        }
      }
    });
    // TODO: Implement any additional logic needed when reassigning a team member from old user to new user for multiple teams
  };

  const assignTeamMemberSuccess = () => {
    console.log("Assign team member success!");
    setDynamicNotificationMessage(
      NOTIFICATION_MESSAGES.OperationSuccess.DEFAULT
    );
  };

  const assignTeamMemberFailure = (error: string) => {
    console.error("Assign team member failure:", error);
    setDynamicNotificationMessage(

      NOTIFICATION_MESSAGES.Team.ASSIGN_TEAM_MEMBER_FAILURE,
      NotificationType.ERROR
    );
  };

  const setDynamicNotificationMessage = (message: Message, type: NotificationType) => {
    setDynamicNotificationMessage(message, type);
  };

  const shareResource = (teamId: string, resourceId: string) => {
    if (!assignNote[teamId]) {
      assignNote[teamId] = [resourceId];
    } else {
      assignNote[teamId].push(resourceId);
    }
  };

  const shareResources = (teamId: string, resourceIds: string[]) => {
    resourceIds.forEach((resourceId) => {
      shareResource(teamId, resourceId);
    });
  };

  const unshareResource = (teamId: string, resourceId: string) => {
    if (assignNote[teamId]) {
      assignNote[teamId] = assignNote[teamId].filter((id) => id !== resourceId);

      if (assignNote[teamId].length === 0) {
        delete assignNote[teamId];
      }
      // Implement any additional logic needed when unsharing a resource from a team
    }
  };

  const trackProjectProgress = (
    teamId: string,
    projectId: string,
    progress: number
  ) => {
    const projectProgress: Record<string, Record<string, number>> = {};
    if (!projectProgress[teamId]) {
      projectProgress[teamId] = {};
    }

    projectProgress[teamId][projectId] = progress;
  };

  const trackTaskProgress = (
    teamId: string,
    taskId: string,
    progress: number
  ) => {
    const projectTasks: Record<string, Record<string, Record<string, number>>> = {};
    if(!projectTasks[teamId]) {
      projectTasks[teamId] = {};
    }

    if(!projectTasks[teamId][taskId]) {
      projectTasks[teamId][taskId] = {};
    }

    projectTasks[teamId][taskId].progress = progress;
  }

  const updateProjectProgress = (
    teamId: string,
    projectId: string,
    progress: number
  ) => {
    trackProjectProgress(teamId, projectId, progress);
  }

  const useAssignTeamMemberStore = makeAutoObservable({
    ...baseStore,
    assignedTeams,
    assignedTeamMembers,
    assignNote,
    assignNoteToTeam,
    assignTeamMember,
    unassignTeamMember,
    reassignTeamMember,
    assignTeamMemberSuccess,
    assignTeamMemberFailure,
    setDynamicNotificationMessage,
    assignTeamMembersToTeams,
    unassignTeamMembersFromTeams,
    reassignTeamMembersToTeams,
    ...assignedTeamMembers,
    assignUsersToTeams,
    unassignUsersFromTeams,
    reassignUsersInTeams,
    // Add more properties or methods as needed
    getAssignedTeamMembers,
    shareResource,
    shareResources,
    unshareResource,
    trackProjectProgress,
    trackTaskProgress,
    updateProjectProgress
  });

  return useAssignTeamMemberStore;
};

export { useAssignTeamMemberStore }
