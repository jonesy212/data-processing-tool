import React, { useState } from 'react';
import PromptPage, { Prompt, PromptPageProps } from './PromptPage';

interface PromptComponentProps extends Omit<PromptPageProps, "prompts"> {
  currentPage: {
    title: string;
    description: string;
    prompts: {
      id: string;
      text: string;
      type: string;
    }[];
  };
  onNextPage: () => void;
  onPreviousPage:() => void;
}

const PromptComponent: React.FC<PromptComponentProps> = ({
  title,
  description,
  // userIdea,
  currentPage,
  onNextPage,
  onPreviousPage
}) => {

  const [generatedPrompts, setGeneratedPrompts] = useState<Prompt[]>([]);

  const handleGeneratePrompts = async () => {
    // Generate prompts

    setGeneratedPrompts(generatedPrompts);
    onNextPage();
  };

  const handlePageSubmit = () => {
    // Submit page
    onNextPage();
  };

  return (
    <div>
      <PromptPage
        id={0}
        title={currentPage.title}
        description={currentPage.description}
        prompts={currentPage.prompts as Prompt[]}
        onGeneratePrompts={handleGeneratePrompts}
        // userIdea={userIdea}
      />
      <button onClick={onPreviousPage}>Previous</button>
      <button onClick={handlePageSubmit}>Next</button>
    </div>
  );
};

export default PromptComponent;









