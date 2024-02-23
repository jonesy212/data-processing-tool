import { Snapshot } from '../../state/stores/SnapshotStore';
import { Team } from '../models/teams/Team';

// Define the type for teamSnapshot
interface TeamSnapshot extends Snapshot<Data> {
  [teamId: string]: Team[];
}

const takeTeamSnapshot = (teamId: string, userIds?: string[]) => {
  // Ensure the teamId exists in the teams
  if (!teams[teamId]) {
    console.error(`Team with ID ${teamId} does not exist.`);
    return;
  }

  // Create a snapshot of the current teams for the specified teamId
  const teamSnapshot: TeamSnapshot = {
    timestamp: new Date(), // Add the timestamp property
    data: teams[teamId], // Add the data property with teams[teamId] as value
    [teamId]: [...teams[teamId]], // Include the team data for the specific teamId
  };

  // Store the snapshot in the SnapshotStore
  snapshotStore.takeSnapshot(teamSnapshot);

  if (userIds) {
    // Create a snapshot of the current team assignments for the specified teamId and userIds
    const teamAssignmentsSnapshot: TeamSnapshot = {
      timestamp: new Date(), // Add the timestamp property
      data: assignedTeamMemberStore.getAssignedTeamMembers(teamId, userIds), // Add the data property with assigned team members
      [teamId]: [...assignedTeamMemberStore.getAssignedTeamMembers(teamId, userIds)], // Include the team assignments for the specific teamId
    };

    // Store the teamAssignmentsSnapshot in the SnapshotStore
    snapshotStore.takeSnapshot(teamAssignmentsSnapshot);
  }
};
