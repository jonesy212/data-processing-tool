//FeedbackLoop.tsx
import React from 'react';

interface FeedbackLoopProps {
  feedback: string;
  feedbackType: string
}

const FeedbackLoop: React.FC<FeedbackLoopProps> = ({ feedback, feedbackType }) => {
  return (
    <div>
      <h2>Feedback Loop</h2>
      <p>{feedback}</p>
      {/* Render additional content based on feedback type */}
      {feedbackType === 'audio' && <audio controls src={feedback} />}
      {feedbackType === 'video' && <video controls src={feedback} />}
      {/* Add more conditions for different feedback types */}
    
    </div>
  );
};

export default FeedbackLoop;
