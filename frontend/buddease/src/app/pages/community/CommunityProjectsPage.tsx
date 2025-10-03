// app/pages/community/CommunityProjectsPage.tsx
import RootLayout from '@/app/RootLayout';
import { CommunityData } from '@/app/components/models/CommunityData';
import { Team } from '@/app/components/models/teams/Team';
import { DetailsItem } from '@/app/state/stores/DetailsListStore';
import ListGenerator from '@/app/generators/ListGenerator';
import FeedbackForm from '@/app/pages/forms/FeedbackForm';
import React, { useState } from 'react';

interface CommunityProjectsPageProps {
    community: CommunityData;
}

// Utility function to transform teams into DetailsItem<Data> array
const transformTeamsToDetailsItems = (teams: Team[]): DetailsItem<Team>[] => {
  return teams.map(team => ({
    id: team.id,
    title: team._id || 'No title',
    label: team.teamName,
    value: team.description || 'No description available',
    data: team,
  }));
};

const CommunityProjectsPage: React.FC<CommunityProjectsPageProps> = ({ community }) => {
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedback, setFeedback] = useState('');

  const handleSubmitFeedback = (feedback: string) => {
    // Logic to submit feedback to backend
    setFeedback(feedback);
    setShowFeedbackForm(false);
    // Additional logic as needed
  };

  return (
    <RootLayout>
      <div>
        <h1>Community Projects</h1>
        
        {/* Render projects specific to the community */}
        <h2>Projects</h2>
        <ListGenerator items={community.projects} />
        
        {/* Render teams specific to the community */}
        <h2>Teams</h2>
        <ListGenerator items={transformTeamsToDetailsItems(community.teams)} />
        
        {/* Feedback Form */}
        <h2>Provide Feedback</h2>
        <button onClick={() => setShowFeedbackForm(true)}>Give Feedback</button>
        {showFeedbackForm && <FeedbackForm onSubmit={handleSubmitFeedback} />}
        {feedback && <p>Thank you for your feedback: {feedback}</p>}
      </div>
    </RootLayout>
  );
};

export default CommunityProjectsPage;