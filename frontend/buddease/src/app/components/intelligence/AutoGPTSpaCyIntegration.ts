import { generatePrompt } from "../prompts/promptGenerator";

// AutoGPTSpaCyIntegration.ts
export const processTextWithSpaCy = async (text: any, appTree: any[]) => {
    const response = await fetch('http://localhost:5000/process-text', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
    });

    if (response.ok) {
        const data = await response.json();
        return data.result;
    } else {
        console.error('Error processing text');
        return null;
    }
};

// Function to process AutoGPT output with spaCy
export const processAutoGPTOutputWithSpaCy = async (userIdea: string): Promise<string | null> => {
    // Generate prompt using userIdea
    const prompt = generatePrompt(userIdea);
  
    if (!prompt) {
      return null;
    }
  
    try {
      // Use processTextWithSpaCy to process the prompt and extract relevant entities
      //[] = appTree
      const spaCyOutput = await processTextWithSpaCy(prompt, []);
  
      // Process spaCy output and enhance the prompt or perform other actions as needed
      // Example: Extracting entities and enhancing the prompt
      const extractedEntities = spaCyOutput.entities;
      const enhancedPrompt = enhancePromptWithEntities(prompt, extractedEntities, [], {});
  
      return enhancedPrompt;
    } catch (error) {
      console.error('Error processing AutoGPT output with spaCy:', error);
      return null;
    }
  };
  
    
  // Function to enhance the prompt with spaCy extracted entities
  const enhancePromptWithEntities = (prompt: string, entities: any, appTree: any[], userContext: any): string => {
    // Your logic to enhance the prompt based on spaCy entities
    // Make sure to handle different types of entities and customize as needed
  
 // Placeholder replacement logic (replace with your actual logic)
  const enhancedPrompt = prompt
    .replace('{entity1}', entities.entity1)
    .replace('{activeDashboard}', userContext.activeDashboard);
  // Add more enhancements as needed

  return enhancedPrompt;
};
  