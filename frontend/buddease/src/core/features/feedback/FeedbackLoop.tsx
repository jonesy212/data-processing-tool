FeedbackLoop.tsx
FeedbackLoop.tsx
import { Feedback } from '@/core/features/support/Feedback';
import React from 'react';

interface FeedbackLoopProps {
  feedback: Feedback[];
  feedbackType: string
  audioUrl?: string
  videoUrl?: string
}

const FeedbackLoop: React.FC<FeedbackLoopProps> = ({
  feedback,
  feedbackType,
  audioUrl,
  videoUrl,
}) => {
  return (
    <div>
      <h2>Feedback Loop</h2>
      <p>{feedback.toString()}</p>
      {/* Render additional content based on feedback type */}
      {feedbackType === "audio" && audioUrl && (
        <audio controls src={audioUrl} />
      )}
      {feedbackType === "video" && videoUrl && (
        <video controls src={videoUrl} />
      )}
      {/* Add more conditions for different feedback types */}
    </div>
  );
};

export default FeedbackLoop;
