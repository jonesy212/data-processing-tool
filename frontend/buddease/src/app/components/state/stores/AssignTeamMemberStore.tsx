// AssignTeamMemberStore.tsx
import { makeAutoObservable } from "mobx";
import { TeamMember } from "../../models/teams/TeamMembers";
import NOTIFICATION_MESSAGES from "../../support/NotificationMessages";
import { AssignBaseStore, useAssignBaseStore } from "../AssignBaseStore";

export interface AssignTeamMemberStore extends AssignBaseStore {
  assignTeamMember: (teamId: string, userId: string) => void;

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
}
const useAssignTeamMemberStore = (): AssignTeamMemberStore => {
  const { ...baseStore } = useAssignBaseStore();

  // Use spread operator to create a shallow copy of assignedTeams
  const assignedTeams: Record<string, string[]> = { ...baseStore.assignedTeams };

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

  const unassignTeamMember = (teamId: string, userId: string) => {
    if (assignedTeamMembers[teamId]) {
      assignedTeamMembers[teamId] = assignedTeamMembers[teamId].filter((id) => id !== userId);

      if (assignedTeamMembers[teamId].length === 0) {
        delete assignedTeamMembers[teamId];
      }
    }
    // TODO: Implement any additional logic needed when unassigning a team member
  };

  const reassignTeamMember = (teamId: string, oldUserId: string, newUserId: string) => {
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
        assignedTeamMembers[teamId] = assignedTeamMembers[teamId].filter((id) => id !== userId);

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

const reassignUsersInTeams = (teamIds: string[], oldUserId: string, newUserId: string) => {
  teamIds.forEach((teamId) => {
    reassignTeamMember(teamId, oldUserId, newUserId);
  });
  // Additional logic for bulk reassignment if needed
};

  //todo fix password showing as being apart of this
  const getAssignedTeamMembers = (teamId: string, userIds: string[]) => {
    return userIds.map(userId => {
      const team = assignedTeamMembers[teamId];
      if(team && team.includes(userId)) {
        return {
          teamId,
          userId
        } as unknown as TeamMember;
      }
      return null;
    }).filter(member => member);

};


  const reassignTeamMembersToTeams = (teamIds: string[], oldUserId: string, newUserId: string) => {
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
    setDynamicNotificationMessage(NOTIFICATION_MESSAGES.OperationSuccess.DEFAULT);
  };

  const assignTeamMemberFailure = (error: string) => {
    console.error("Assign team member failure:", error);
    setDynamicNotificationMessage(NOTIFICATION_MESSAGES.Team.ASSIGN_TEAM_MEMBER_FAILURE);
  };

  const setDynamicNotificationMessage = (message: string) => {
    setDynamicNotificationMessage(message);
  };

  makeAutoObservable({
    assignedTeams,
    assignedTeamMembers,
    assignTeamMember,
    unassignTeamMember,
    reassignTeamMember,
    assignTeamMemberSuccess,
    assignTeamMemberFailure,
    setDynamicNotificationMessage,
    assignTeamMembersToTeams,
    unassignTeamMembersFromTeams,
    reassignTeamMembersToTeams,
  });

  return {
    ...baseStore,
    ...assignedTeamMembers,
    assignTeamMember,
    assignUsersToTeams,
    unassignUsersFromTeams,
    reassignUsersInTeams,
    unassignTeamMember,
    reassignTeamMember,
    assignTeamMembersToTeams,
    unassignTeamMembersFromTeams,
    reassignTeamMembersToTeams,
    assignTeamMemberSuccess,
    assignTeamMemberFailure,
    setDynamicNotificationMessage,
    // Add more properties or methods as needed
    getAssignedTeamMembers
  };
};

export { useAssignTeamMemberStore };
