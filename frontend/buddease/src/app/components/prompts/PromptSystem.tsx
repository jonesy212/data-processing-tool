// PromptSystem.tsx
import React, { useState } from 'react';

interface PromptSystemProps {
  onUserResponse: (response: string) => void;
}

const PromptSystem: React.FC<PromptSystemProps> = ({ onUserResponse }) => {
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);

  // Assuming you have the function generateDynamicPrompt defined
  const prompts = generatePrompt(userIdea) || [];

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
