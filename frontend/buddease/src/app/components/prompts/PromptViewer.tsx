import React from "react";
import { Prompt } from "./PromptPage";

interface PromptViewerProps{
    prompts: Prompt[];
    children: React.ReactNode
}

const PromptViewer: React.FC<PromptViewerProps>  = ({prompts}: {prompts: Prompt[]}) => (
    <div>
      {/* Display generated prompts */}
      <ul>
        {prompts.map((prompt, index) => (
          <li key={index}>{prompt.text}</li>
        ))}
      </ul>
    </div>
  );
  

export default PromptViewer;
  export type { PromptViewerProps };
