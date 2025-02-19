// PromptComponent.tsx
import React from "react";
import { Prompt, PromptPageProps } from "./PromptPage";

interface PromptComponentProps {
  prompts: Prompt[]; // Array of prompts based on the phase and user input
  currentPage: PromptPageProps;
  onNextPage: () => void;
  onPreviousPage: () => void;
  title: string;
  description: string;
  userIdea: string;
  // userIdea: 
}

const PromptComponent: React.FC<PromptComponentProps> = ({
  prompts,
  currentPage,
  userIdea
}) => {
  return (
    <div>
    <h2>{currentPage.title}</h2>
    <h2>{currentPage.description}</h2>
    {userIdea && <p>User Idea: {userIdea}</p>} {/* Display userIdea if provided */}
    <ul>
      {prompts.map((prompt, index) => (
        <li key={index}>{prompt.text}</li>
      ))}
    </ul>
    {/* Add additional styling or functionality as needed */}
  </div>
  );
};

export default PromptComponent;
