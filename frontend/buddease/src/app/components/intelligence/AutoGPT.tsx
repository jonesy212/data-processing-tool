// src/app/components/AutoGPTPrompt.tsx
import React, { useState } from 'react';
import useAutoGPT from '../hooks/useAutoGPT';

const AutoGPTPrompt: React.FC = () => {
  const [enhancedPrompt, setEnhancedPrompt] = useState<string | null>(null);

  const { autoGPTResponse } = useAutoGPT();


  const userIdea = "Here is an idea for an AI assistant:";

  return (
    <div>
      <h3>AutoGPT Prompt:</h3>
      <p>{autoGPTResponse}</p>
    </div>
  );
};

export default AutoGPTPrompt;
