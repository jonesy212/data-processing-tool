import { CommunityData } from '@/app/components/models/CommunityData';
import {Team} from '@/app/components/models/teams/Team';
import React from 'react';
import ListGenerator from '@/app/generators/ListGenerator';
import { DetailsItem } from '@/app/components/state/stores/DetailsListStore';

// Utility function to transform teams into DetailsItem<Data> array
const transformTeamsToDetailsItems = (teams: Team[]): DetailsItem<Team>[] => {
  return teams.map(team => ({
    id: team._id,
    label: team.teamName,
    value: team.description || 'No description available', // Add default description if not provided
    data: team, // Assign team data to 'data' property
  }));
};

interface CommunityProjectsPageProps {
    community: CommunityData;
}

const CommunityProjectsPage: React.FC<CommunityProjectsPageProps> = ({ community }) => {
  return (
    <div>
      <h1>Community Projects</h1>
      {/* Render projects specific to the community */}
      <h2>Projects</h2>
      <ListGenerator items={community.projects} />
      
      {/* Render teams specific to the community */}
      <h2>Teams</h2>
      <ListGenerator items={transformTeamsToDetailsItems(community.teams)} />
    </div>
  );
};

export default CommunityProjectsPage;
