// components/EmailCard.tsx
import React from 'react';

interface EmailCardProps {
  sender: string;
  subject: string;
  content: string;
}

const EmailCard: React.FC<EmailCardProps> = ({ sender, subject, content }) => {
  return (
    <div>
      <h3>{sender}</h3>
      <p><strong>Subject:</strong> {subject}</p>
      <p>{content}</p>
    </div>
  );
};

export default EmailCard;
