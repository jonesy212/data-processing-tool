import React, { ReactNode, useState } from "react";

import { Prompt } from "../prompts/PromptPage";
import PromptSystem from "../prompts/PromptSystem";
import { generatePrompt } from "../prompts/promptGenerator";
import { DocumentTypeEnum } from "./DocumentGenerator";
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
  const [contentVariation, setContentVariation] = useState<string>("");
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [accessInformation, setAccessInformation] = useState<string>("");
  const [generatedPrompts, setGeneratedPrompts] = useState<Prompt[]>([]);

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

  const handleContentVariationChange = (variation: string) => {
    setContentVariation(variation);
    setSelectedOption(null); // Reset selected option when content variation changes
  };

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
  };

  const handleAccessInformationChange = (info: string) => {
    setAccessInformation(info);
  };


  const getCurrentDocumentType = (): DocumentTypeEnum => {
    // Assuming you have some way of storing and retrieving the current document type,
    // such as using state management like Redux, React context, or local storage
  
    // For demonstration purposes, let's say we are retrieving the current document type from local storage
    const storedDocumentType = localStorage.getItem('currentDocumentType');
  
    // Check if the stored document type exists
    if (storedDocumentType) {
      // Parse the stored document type (assuming it's stored as a string)
      return JSON.parse(storedDocumentType);
    } else {
      // If no document type is stored, return a default value or handle the absence of a document type
      return DocumentTypeEnum.Default;
    }
  };
  
  const setCurrentDocumentType = (documentType: DocumentTypeEnum) => { 
    localStorage.setItem('currentDocumentType', JSON.stringify(documentType));
  }

  const handleDocumentTypeChange = (documentType: DocumentTypeEnum) => {
    // Add your logic to handle the document type change
    // Assuming you have a variable to store the current document type
    let currentDocumentType: DocumentTypeEnum = getCurrentDocumentType();
  
    // Check if the document type has changed
    if (documentType !== currentDocumentType) {
      // Update the current document type with the new value
      setCurrentDocumentType(documentType);
  
      // Perform actions based on the new document type
      switch (documentType) {
        case DocumentTypeEnum.Text:
          // Logic for handling text document type
          console.log("Handling text document type...");
          break;
        case DocumentTypeEnum.Image:
          // Logic for handling image document type
          console.log("Handling image document type...");
          break;
        case DocumentTypeEnum.PDF:
          // Logic for handling PDF document type
          console.log("Handling PDF document type...");
          break;
        default:
          // Default logic if document type is not recognized
          console.log("Unknown document type:", documentType);
          break;
      }
  
      // Log the change
      console.log("Document type changed to:", documentType);
    } else {
      // If the document type remains the same, log a message
      console.log("Document type remains the same:", documentType);
    }
  };
  
  
  

  const renderOptions = () => {
    switch (contentVariation) {
      case "social media":
        return (
          <>
            <label>
              Select Social Media Platform:
              <select
                value={selectedOption || ""}
                onChange={(e) => handleOptionSelect(e.target.value)}
              >
                <option value="" disabled>
                  Choose a platform
                </option>
                <option value="facebook">Facebook</option>
                <option value="twitter">Twitter</option>
                <option value="tiktok">TikTok</option>
                {/* Add more social media platforms as needed */}
              </select>
            </label>
            <label>
              Access Information:
              <input
                type="text"
                value={accessInformation}
                onChange={(e) => handleAccessInformationChange(e.target.value)}
              />
            </label>
          </>
        );
      // Add more cases for other content variations if needed
      default:
        return null;
    }
  };

  const renderPromptButton = () => {
    if (contentVariation) {
      return <button onClick={handleGeneratePrompts}>Show Prompts</button>;
    }
    return null;
  };

  const handleGeneratePrompts = async () => {
    // Assuming you have a function like generatePrompt or AutoGPT to get prompts
    const generatedPrompts: Prompt[] | null = generatePrompt("userIdea") as
      | Prompt[]
      | null;

    // Process the AutoGPT output or other dynamic generation if needed

    // For demonstration purposes, use static prompts if generatedPrompts is falsy
    const staticGeneratedPrompts: Prompt[] = generatedPrompts ?? [
      { id: "3", text: "What is your favorite color?", type: "text" },
      {
        id: "4",
        text: "Choose a pet:",
        type: "multipleChoice",
        options: [
          { value: "dog", label: "Dog" },
          { value: "cat", label: "Cat" },
        ],
      },
    ];

    setGeneratedPrompts(staticGeneratedPrompts);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // Add your form submission logic here
  };

  return (
    <div>
      <h1>Editor with Prompt System</h1>

      {/* Text Editor */}
      <TextEditor
        id="text-editor"
        onChange={handleTextChange}
        type= {DocumentTypeEnum.Text}
        onEditorStateChange={(editorState) => {
          const content = editorState.getCurrentContent().getPlainText('\u0001');
          setText(content);
        }}
        handleEditorStateChange={(editorState) => {
          const content = editorState.getCurrentContent().getPlainText('\u0001');
          setText(content);
        }}
        toolbarOptions={(props: ToolbarOptionsProps, context?: any): ReactNode => {
          return (
            <div>
              <b>Bold</b>
              <i>Italic</i>
              <u>Underline</u>
              <s>Strike</s> 
              <code>Code</code>
              <a href="#">Link</a>
              <img src="#" alt="Image" />
            </div>
          );
        }}
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
        documentType={DocumentTypeEnum.Text} // Provide the appropriate document type here
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

      {/* Content Variations */}
      <h2>Content Variations</h2>
      <label>
        Choose a content variation:
        <select
          value={contentVariation}
          onChange={(e) => handleContentVariationChange(e.target.value)}
        >
          <option value="web development">Web Development</option>
          <option value="design">Design</option>
          {/* Add more options as needed */}
        </select>
      </label>

      {/* Social Media Options */}
      {renderOptions()}

      {/* Prompt Button */}
      {renderPromptButton()}

      {/* Display generated prompts */}
      {generatedPrompts.length > 0 && (
        <div>
          <h2>Generated Prompts</h2>
          <ul>
            {generatedPrompts.map((prompt) => (
              <li key={prompt.id}>{prompt.text}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default EditorWithPrompt;
