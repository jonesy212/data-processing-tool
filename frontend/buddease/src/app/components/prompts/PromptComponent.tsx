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
}

const PromptComponent: React.FC<PromptComponentProps> = ({
  prompts,
  currentPage,
}) => {
  return (
    <div>
      <h2>{currentPage.title}</h2>
      <h2>{currentPage.description}</h2>
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
