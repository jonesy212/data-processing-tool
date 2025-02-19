// CalendarEventPrompt.tsx
import React, { useState } from "react";
import useDynamicPromptPhaseHook, {
  generatePrompt,
} from "../hooks/phaseHooks/DynamicPromptPhaseHook";
import { generateDynamicPrompts } from "../prompts/promptGenerator";

const CalendarEventPrompt: React.FC = () => {
  const [generatedPrompts, setGeneratedPrompts] = useState<string[]>([]);
  const [userInput, setUserInput] = useState<string>("");

  const handleUserInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setUserInput(event.target.value);
  };

  const handleGeneratePrompts = async () => {
    // Assuming you have access to the calendar event data
    const calendarEventData = {}; // Initialize with an empty string or replace with actual calendar event data
    // Example usage of generateDynamicPrompts with userQuery and userIdea
    const documentContent = calendarEventData.toString(); // Convert to string
    const documentType = "calendar event"; // Replace with actual document type
    const userQuery = "Your user query goes here"; // Provide the user query
    const userIdea = "web development"; // Provide the user idea

    // Generate dynamic prompts based on the calendar event data
    const dynamicPrompts = generateDynamicPrompts(
      documentContent,
      documentType,
      userQuery,
      userIdea
    );
    setGeneratedPrompts(dynamicPrompts);

    // Generate prompts based on user input
    const userPrompt = generatePrompt(userInput);
    if (userPrompt) {
      setGeneratedPrompts((prevPrompts) => [...prevPrompts, userPrompt]);
    }
  };

  // Use the custom hook to generate prompts based on the user input
  const dynamicPrompt = useDynamicPromptPhaseHook;

  return (
    <div>
      {/* Input for user interaction */}
      <input type="text" value={userInput} onChange={handleUserInputChange} />

      {/* Button to trigger prompt generation */}
      <button onClick={handleGeneratePrompts}>Generate Prompts</button>

      {/* Display generated prompts */}
      <h2>Generated Prompts</h2>
      <ul>
        {generatedPrompts.map((prompt, index) => (
          <li key={index}>{prompt}</li>
        ))}
      </ul>

      {/* Display dynamic prompt */}
      <h2>Dynamic Prompt</h2>
      {dynamicPrompt ? (
        <p>Loading dynamic prompt...</p>
      ) : (
        <p>{dynamicPrompt}</p>
      )}
    </div>
  );
};

export default CalendarEventPrompt;
