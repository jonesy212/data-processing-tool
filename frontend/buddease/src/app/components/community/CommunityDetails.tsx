// CommunityDetails.tsx
import { Team } from '@/app/components/teams/Team';
import { CommonData } from "@/app/models/CommonData";
import { CommonDetails } from "@/app/models/details/CommonDetails";
import { CommunityData } from '@/app/models/CommunityData';
import { TeamMember } from '@/app/models/teams/TeamMembers';
import React, { useState } from 'react';

interface CommunityDetailsProps {
  community: CommunityData;
}

const CommunityDetails: React.FC<CommunityDetailsProps> = ({ community }) => {
  const [showDetails, setShowDetails] = useState(false);

  const toggleDetails = () => {
    setShowDetails((prev) => !prev);
  };

  // Define the CommonData object with appropriate title, description, and data
  const commonData: CommonData<CommunityData> = {
    title: "Community Details",
    description: "Details of the community",
    date: new Date(),
    data: community
  };

  return (
    <div>
      <h2>Community Details</h2>
      <CommonDetails
        data={commonData}
        details={}
      /> {/* Pass commonData as prop to CommonDetails */}
      {/* Render additional details specific to the community */}
      <h3>Projects</h3>
      {community.projects.map((project: Project) => (
        <div key={project.id}>
          <h4>{project.name}</h4>
          {/* Render project details */}
        </div>
      ))}
      <h3>Teams</h3>
      {community.teams.map((team: Team) => (
        <div key={team.id}>
          <h4>{team.teamName}</h4>
          {/* Render team details */}
        </div>
      ))}
      <h3>Team Members</h3>
      {community.teamMembers.map((member: TeamMember) => (
        <div key={member.id}>
          <h4>{member.username}</h4>
          {/* Render team member details */}
        </div>
      ))}

      {/* Button to toggle additional details */}
      <button onClick={toggleDetails}>Toggle Details</button>
      {/* Render additional details when showDetails is true */}
      {showDetails && commonData.data && (
        <div>
          <h3>Details</h3>
          {/* Handle different data types here */}
          {Object.entries(commonData.data).map(([key, value]) => (
            <p key={key}>
              {key}: {value}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommunityDetails;
