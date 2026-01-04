AutoGPT.tsx
src/app/components/AutoGPTPrompt.tsx
import useAutoGPT from '@/core/hooks/useAutoGPT';
import React, { useState } from 'react';

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
