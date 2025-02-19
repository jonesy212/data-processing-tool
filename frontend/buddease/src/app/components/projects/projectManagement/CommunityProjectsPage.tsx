// CommunityProjectsPage.tsx
// CommunityProjectsPage.tsx
import ListGenerator from '@/app/generators/ListGenerator';
import React, { useState } from 'react';
import { CommunityData } from '../../models/CommunityData';
import FeedbackForm from '@/app/pages/forms/FeedbackForm';

interface CommunityProjectsPageProps {
  community: CommunityData;
}

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
  );
};

export default CommunityProjectsPage;
