// TeamSumaryStep.tsx
import React from 'react';

const TeamSummaryStep: React.FC<{ teamData: any }> = ({ teamData }) => {
  return (
    <div>
      <h2>Team Summary</h2>
      <p>Basic Information:</p>
      <ul>
        <li>Name: {teamData.basicInfo.name}</li>
        <li>Description: {teamData.basicInfo.description}</li>
        {/* Add more basic info fields as needed */}
      </ul>
      <p>Members:</p>
      <ul>
        {teamData.members.map((member: string, index: number) => (
          <li key={index}>{member}</li>
        ))}
      </ul>
      <p>Preferences:</p>
      <ul>
        <li>Preference 1: {teamData.preferences.preference1}</li>
        <li>Preference 2: {teamData.preferences.preference2}</li>
        {/* Add more preference fields as needed */}
      </ul>
    </div>
  );
};

export default TeamSummaryStep;
