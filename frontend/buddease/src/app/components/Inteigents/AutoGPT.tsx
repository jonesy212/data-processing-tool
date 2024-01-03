// src/app/components/AutoGPTPrompt.tsx
import React from 'react';
import useAutoGPT from '../hooks/useAutoGPT';

const AutoGPTPrompt: React.FC = () => {
  const { autoGPTResponse } = useAutoGPT();

  return (
    <div>
      <h3>AutoGPT Prompt:</h3>
      <p>{autoGPTResponse}</p>
    </div>
  );
};

export default AutoGPTPrompt;
