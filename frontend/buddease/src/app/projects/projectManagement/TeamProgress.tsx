import TeamProgressBar from './TeamProgressBar';
import React from "react";

const TeamProgress = () => {
  // Assume teamData is an array with team details
  const teamData = [
    { id: 1, name: 'Team A', progress: 70 },
    { id: 2, name: 'Team B', progress: 50 },
    // Add more teams as needed
  ];

  return (
    <div>
      <h3>Team Progress</h3>
      {teamData.map((team) => (
        <TeamProgressBar key={team.id} team={team} />
      ))}
    </div>
  );
};

export default TeamProgress;
