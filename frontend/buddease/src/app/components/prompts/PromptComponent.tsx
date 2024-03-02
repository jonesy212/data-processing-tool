// PromptComponent.tsx
import React from 'react';

interface PromptComponentProps {
  prompts: string[]; // Array of prompts based on the phase and user input
  currentPage: number;
}

const PromptComponent: React.FC<PromptComponentProps> = ({ prompts, currentPage }) => {
  return (
    <div>
      <h2>Prompts</h2>
      <ul>
        {prompts.map((prompt, index) => (
          <li key={index}>{prompt}</li>
        ))}
      </ul>
      {/* Add additional styling or functionality as needed */}
    </div>
  );
};

export default PromptComponent;

