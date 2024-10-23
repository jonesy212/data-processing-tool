// FeedbackAggregator.tsx
import React, { useState } from 'react';
import { Feedback } from './Feedback';
import FeedbackService from './FeedbackService';
import FeedbackForm from '@/app/pages/forms/FeedbackForm';

const FeedbackAggregator: React.FC = () => {
  const [feedbackData, setFeedbackData] = useState<Feedback[]>([]);
  const feedbackService = FeedbackService.getInstance();

  const handleSubmitFeedback = async (feedbackText: string) => {
    try {
      // Assuming the user ID and timestamp are generated dynamically
      const newFeedback: Feedback = {
        userId: 'user123',
        comment: feedbackText,
        rating: 0, // Set rating as needed
        timestamp: new Date(),
      };

      // Add the new feedback to the existing feedback data
      const updatedFeedbackData = [...feedbackData, newFeedback];
      setFeedbackData(updatedFeedbackData);

      // Gather and process the feedback
      await feedbackService.gatherFeedback(updatedFeedbackData, 'text');
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  return (
    <div>
      <h2>Feedback Aggregator</h2>
      <FeedbackForm onSubmit={handleSubmitFeedback} />
      {/* Additional UI for displaying aggregated feedback if needed */}
    </div>
  );
};

export default FeedbackAggregator;
