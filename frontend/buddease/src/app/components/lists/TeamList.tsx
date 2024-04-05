import { observer } from 'mobx-react-lite';
import React from 'react';
import { Team,  TeamDetails } from '../models/teams/Team';

interface TeamListProps{
  teams?: Team[];
}

const TeamList: React.FC<TeamListProps> = observer(({ teams = [] }) => {
  // Explicitly type team as an array of Team

  return (
    <div>
      <h2>Team List</h2>
      <ul>
        {teams.map((team: Team) => (
          <li key={team.id}>
            {team.teamName} - {team.isActive? 'Active' : 'Inactive'}
            <TeamDetails team={team} />
          </li>
        ))}
      </ul>
    </div>
  );
});

export default TeamList;
