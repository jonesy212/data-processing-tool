//FeedbackLoop.tsx
import React from 'react';

interface FeedbackLoopProps {
  feedback: string;
}

const FeedbackLoop: React.FC<FeedbackLoopProps> = ({ feedback }) => {
  return (
    <div>
      <h2>Feedback Loop</h2>
      <p>{feedback}</p>
    </div>
  );
};

export default FeedbackLoop;
