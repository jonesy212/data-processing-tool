import React, { useState } from "react";
import { generateDynamicPrompts } from "./promptGenerator";

const DynamicPromptingLogic: React.FC = () => {
  const [generatedPrompts, setGeneratedPrompts] = useState<string[]>([]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      const documentContent = await readFileAsync(file);
      const documentType = 'CSV'; // Replace with the actual document type
      const userQuery = 'Generate prompts for document summarization';
      const userIdea = '';
      const dynamicPrompts = generateDynamicPrompts(documentContent, documentType, userQuery, userIdea);

      setGeneratedPrompts(dynamicPrompts);
    }
  };

  const readFileAsync = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e?.target?.result as string;
        resolve(content);
      };
      reader.onerror = (error) => reject(error);
      reader.readAsText(file);
    });
  };

  return (
    <div>
      {/* Input for file selection */}
      <input type="file" onChange={handleFileChange} />

      {/* Render or utilize the generated prompts as needed */}
      {generatedPrompts.map((prompt, index) => (
        <p key={index}>{prompt}</p>
      ))}
    </div>
  );
};

export default DynamicPromptingLogic;
