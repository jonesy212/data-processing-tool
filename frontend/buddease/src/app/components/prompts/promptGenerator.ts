// promptGenerator.ts

import { getAppContext } from "./AppContextHelper";

export const generatePrompt = (userIdea: any): string | null => {
  if (!userIdea) {
    console.error("Invalid user idea. Cannot generate prompt.");
    return null;
  }

  let prompt: string | null = null;

  switch (userIdea.toLowerCase()) {
    case "web development":
      prompt = "Prompt for web development";
      break;
    case "app development":
      prompt = "Prompt for app development";
      break;
    case "community":
      prompt = "Prompt for community idea";
      break;
    case "team":
      prompt = "Prompt for team idea";
      break;
    case "video":
      prompt = "Prompt for video idea";
      break;
    case "blog":
      prompt = "Prompt for blog idea";
      break;
    // Add more cases for additional idea types as needed
    default:
      prompt = `You are considering the idea of ${userIdea}.`; // Generic prompt for unrecognized ideas
      break;
  }

  return prompt;
};

// Example usage:
const userIdea = "web development"; // Replace with the actual user's idea
const generatedPrompt = generatePrompt(userIdea);

if (generatedPrompt) {
  console.log(generatedPrompt);
} else {
  console.log("Prompt generation failed. Please provide a valid user idea.");
}

// Function to extract keywords from the document content (replace with your actual extraction logic)
const extractKeywords = (documentContent: string): string[] => {
  // Implement your logic to extract keywords, entities, or relevant information
  // Example: For simplicity, split the document content into words and use them as keywords
  return documentContent.split(/\s+/);
};

export const generateDynamicPrompts = (
  documentContent: string,
  documentType: string,
  userQuery: string,
  userIdea: string
): string[] => {
  // Ensure the document content is not empty
  if (!documentContent.trim()) {
    console.error("Invalid document content. Cannot generate prompts.");
    return []; // You can handle this error case as needed
  }

  // Implement your logic to analyze the document content and generate dynamic prompts
  // Example: Extract keywords or entities from the document and use them in the prompt
  const extractedKeywords = extractKeywords(documentContent);

    // Get the user context based on their query
    const context = getAppContext(userQuery);

  // Incorporate document type into prompts
  const documentTypePrompt = `You have uploaded a ${documentType} document.`;
  const contextPrompt = context
  ? `Discuss how ${context} relates to your expertise.`
  : "I'm here to help! Please provide more details about what you're looking for in the document.";

  // Generate prompts based on keywords, document type, and user context
  const prompts = [
    documentTypePrompt,
    contextPrompt,
    ...extractedKeywords.map(
      (keyword) => `Describe the significance of ${keyword} in your expertise.`
    ),
  ];

  return prompts;
};
