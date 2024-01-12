// TeamManagerComponent.tsx
import React, { useState } from 'react';
import { useAssignTeamMemberStore } from '../state/stores/AssignTeamMemberStore';
import { useTeamManagerStore } from '../state/stores/TeamStore';

interface TeamAssignmentSnapshotProps {
  teamId: string;
}

const TeamManagerComponent: React.FC<TeamAssignmentSnapshotProps> = ({ teamId }) => {
  const teamStore = useTeamManagerStore();
  const assignStore = useAssignTeamMemberStore()
  const [assignedTo, setAssignedTo] = useState<string>(''); // You can change the type based on your user/team structure

  const assignTeamMember = () => {
    // Perform the Team member logic here
    assignStore.assignTeamMember(teamId, assignedTo);
  };

  const takeSnapshot = () => {
    // Perform the snapshot logic here
    teamStore.takeTeamSnapshot(teamId, []);
  };

  return (
    <div>
      <label>
        Assign To:
        <input type="text" value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} />
      </label>
      <button onClick={assignTeamMember}>Assign Task</button>
      <button onClick={takeSnapshot}>Take Snapshot</button>
    </div>
  );
};

export default TeamManagerComponent;
