// CommunityDetails.tsx
import React from 'react';
import CommonDetails from '../models/CommonData';
import { CommunityData } from '../models/CommunityData';
import { Team } from '../models/teams/Team';
import { TeamMember } from '../models/teams/TeamMembers';
import Project from '../projects/Project';

interface CommunityDetailsProps {
  community: CommunityData;
}

const CommunityDetails: React.FC<CommunityDetailsProps> = ({ community }) => {
  return (
    <div>
      <h2>Community Details</h2>
      <CommonDetails
        data={{
          title: "Community Details",
          description: "Details of the community",
          data: community
        }}
      />
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
    </div>
  );
};

export default CommunityDetails;
