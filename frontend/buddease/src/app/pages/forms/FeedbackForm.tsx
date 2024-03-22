// FeedbackForm.tsx
import React, { useState } from 'react';

const FeedbackForm: React.FC<{ onSubmit: (feedback: string) => void }> = ({ onSubmit }) => {
  const [feedbackText, setFeedbackText] = useState('');

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(feedbackText);
    setFeedbackText('');
  };

  return (
    <form onSubmit={handleFormSubmit}>
      <textarea value={feedbackText} onChange={(e) => setFeedbackText(e.target.value)} />
      <button type="submit">Submit Feedback</button>
    </form>
  );
};

export default FeedbackForm;
