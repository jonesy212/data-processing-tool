// PromptSystem.tsx
import React, { useState } from 'react';
import { DocumentOptions } from '../documents/DocumentOptions';

interface PromptSystemProps {
  onUserResponse: (response: string) => void;
  documentType: DocumentOptions['documentType'];
  userIdea: DocumentOptions['userIdea'];
}

const PromptSystem: React.FC<PromptSystemProps> = ({ onUserResponse, documentType, userIdea }) => {
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);

  // Assuming you have the function generateDynamicPrompt defined
  const prompts = generateDynamicPrompts(`You have uploaded a ${documentType} document.`, userIdea) || [];

  const handleUserResponse = (response: string) => {
    // Process and send the user response to the parent component
    onUserResponse(response);

    // Move to the next prompt
    setCurrentPromptIndex(currentPromptIndex + 1);
  };

  return (
    <div>
      <p>{prompts[0]}</p>
      <textarea onBlur={(e) => handleUserResponse(e.target.value)} />
      {/* Add styling and additional UI elements as needed */}
    </div>
  );
};

export default PromptSystem;
