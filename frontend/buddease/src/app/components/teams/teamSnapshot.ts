// teamSnapshot.ts
import { Team } from '@/app/components/teams/Team';
import useSnapshotManager from '@/app/hooks/useSnapshotManager';
import { Data } from '@/app/models/data/Data';
import type {  Snapshot } from '@/app/snapshots/Snapshot'; // Removed snapshotStore import as it's not used
import { useAssignTeamMemberStore } from '@/app/state/stores/AssignTeamMemberStore';

interface TeamSnapshot extends Snapshot<Team[]> {
  // Remove the 'data' property as it conflicts with the index signature
  [teamId: string]: Team[]; // Index signature mapping string keys to arrays of Team objects
}



const takeTeamSnapshot = (teamId: string, userIds?: string[], teams?: Team[]) => {
  // Ensure teams is defined and teamId exists in teams
  if (!teams || !teams[teamId]) {
    console.error(`Team with ID ${teamId} does not exist.`);
    return;
  }

  // Create a snapshot of the current teams for the specified teamId
  const teamSnapshot: TeamSnapshot = {
    timestamp: new Date, // Add a timestamp to the snapshot
    data: {
      [teamId]: [...(teams[teamId] || [])], // Ensure teams[teamId] is not undefined
      // Add properties from the Data interface here
      _id: "",
      id: 0,
      title: "",
      status: "pending",
      // Add other properties from Data interface as needed
    },
  };

  // Store the snapshot in the SnapshotStore
  useSnapshotManager().takeSnapshot(teamSnapshot);

  if (userIds) {
    const teamAssignmentsSnapshot: Snapshot<Data, Data> = {
      timestamp: new Date(), // Add a timestamp to the snapshot
      data: {
        [teamId]: [
          ...useAssignTeamMemberStore().getAssignedTeamMembers(teamId, userIds),
        ],
        // Add properties from the Data interface here
        _id: "",
        id: 0,
        title: "",
        status: "pending",
        // Add other properties from Data interface as needed
      },
    };
    useSnapshotManager().takeSnapshot(teamAssignmentsSnapshot);
  }
};
