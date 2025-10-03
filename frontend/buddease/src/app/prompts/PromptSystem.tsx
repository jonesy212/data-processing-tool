// PromptSystem.tsx
/// <reference types="react-speech-recognition" />

import React, { useState } from 'react';
import { useSpeechRecognition } from 'react-speech-recognition';
import { DocumentOptions } from '../documents/DocumentOptions';
import { generateDynamicPrompts } from '../prompts/promptGenerator';

interface PromptSystemProps {
  onUserResponse: (response: string) => void;
  documentType: DocumentOptions['documentType'];
  userIdea: DocumentOptions['userIdea'];
}

const PromptSystem: React.FC<PromptSystemProps> = ({ onUserResponse, documentType, userIdea }) => {
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const { transcript, resetTranscript, browserSupportsSpeechRecognition, isMicrophoneAvailable } = useSpeechRecognition();

  // Assuming you have the function generateDynamicPrompt defined
  const prompts = generateDynamicPrompts('User Content from the prompt',`You have uploaded a ${documentType} document.`, "userIdea", "user query", ) || [];

  const handleUserResponse = (response: string) => {
    // Process and send the user response to the parent component
    onUserResponse(response);

    // Move to the next prompt
    setCurrentPromptIndex(currentPromptIndex + 1);

       // Reset the transcript for the next prompt
       resetTranscript();
  };

  return (
    <div>
      <p>{prompts[0]}</p>
      <textarea onBlur={(e) => handleUserResponse(e.target.value)} />
      {/* Add styling and additional UI elements as needed */}
      {browserSupportsSpeechRecognition && isMicrophoneAvailable && (
        <button onClick={handleUserResponse as unknown as React.MouseEventHandler<HTMLButtonElement>}>
          Submit Spoken Response
        </button>      )}
    </div>
  );
};

export default PromptSystem;
