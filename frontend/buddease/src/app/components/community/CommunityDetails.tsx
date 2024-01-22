// CommunityDetails.tsx
import React from 'react';
import { Team } from '../models/teams/Team';
import { TeamMember } from '../models/teams/TeamMembers';
import Project from '../projects/Project';

interface CommunityDetailsProps {
  community: {
    projects: any[]; // Replace 'any' with the actual type for projects
    teams: any[]; // Replace 'any' with the actual type for teams
    teamMembers: any[]; // Replace 'any' with the actual type for teamMembers
    products: any[]; // Replace 'any' with the actual type for products
  };
}

interface CommunityData {
  projects: Project[];
  teams: Team[];
  teamMembers: TeamMember[];
}

const CommunityDetails: React.FC<CommunityDetailsProps & { community: CommunityData }> = ({ community }) => {
  return (
    <div>
      <h2>Community Details</h2>
      <p>Number of Projects: {community.projects.length}</p>
      <p>Number of Teams: {community.teams.length}</p>
      <p>Number of Team Members: {community.teamMembers.length}</p>
      <p>Number of Products: {community.products.length}</p>
      {/* Add more details based on your actual data structure */}
    </div>
  );
};

export default CommunityDetails;
export type { CommunityData };
