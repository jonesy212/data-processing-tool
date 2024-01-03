import React, { ReactNode, useState } from "react";
import PromptSystem from "../prompts/PromptSystem";
import TextEditor from "./TextEditor"; // Assuming the correct path
import { ToolbarOptionsProps } from "./ToolbarOptions";

interface EditorWithPromptProps {
  userId: string; // Add other necessary identifiers
  teamId: string;
  project: string;
}

const EditorWithPrompt: React.FC<EditorWithPromptProps> = ({
  userId,
  teamId,
  project,
}) => {
  const [text, setText] = useState<string>("");
  const [prompts, setPrompts] = useState<string[]>([]);

  const handleTextChange = (content: string) => {
    setText(content);
  };

  const handlePromptResponse = (response: string) => {
    // Handle the response, e.g., add it to tasks or send a message
    // For demonstration, just log the response
    console.log("Received response:", response);

    // Clear the text editor after processing the response
    setText("");

    // Add the response to a list of prompts (assuming you want to display them)
    setPrompts((prevPrompts) => [...prevPrompts, response]);
  };

  return (
    <div>
      <h1>Editor with Prompt System</h1>

      {/* Text Editor */}
      <TextEditor
        id="text-editor"
        onChange={handleTextChange}
        toolbarOptions={(
          props: ToolbarOptionsProps,
          context?: any
        ): ReactNode => props as ReactNode}
        fontSize={false}
        bold={false}
        italic={false}
        underline={false}
        strike={false}
        code={false}
        link={false}
        image={false}
      />

      {/* Prompt System */}
      <PromptSystem
        onUserResponse={handlePromptResponse}
        documentType="document" // Provide necessary information
        userIdea="idea"
      />

      {/* Display prompts */}
      {prompts.length > 0 && (
        <div>
          <h2>Recent Prompts</h2>
          <ul>
            {prompts.map((prompt, index) => (
              <li key={index}>{prompt}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default EditorWithPrompt;
