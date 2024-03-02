// PromptGeneratorService.ts

export interface Scenario {
  description: string;
  keyComponents: string[];
}

export interface PromptOptions {
  scenario: Scenario;
  userQuery: string;
}





const scenario: Scenario = {
  description: "Brainstorm and discuss ideas for a scenario involving users who appreciate and purchase various types of art from artists.",
  keyComponents: [
    "Define the scenario and outline the key components:",
    "Users who are art enthusiasts and buyers.",
    "Artists who create and share different forms of art.",
    "Interaction between users and artists for discovering, purchasing, and enjoying art."
  ]
};

export const generatePrompts = (options: PromptOptions): string[] => {
  const { scenario, userQuery } = options;
  const { description, keyComponents } = scenario;

  // Generate prompts based on the provided scenario and user query
  const prompts: string[] = [];


  
  // Add introductory prompt based on the scenario description
  prompts.push(`Idea Generation: ${description}`);

  // Add prompts for brainstorming based on key components
  prompts.push("Formulating the Idea:");
  keyComponents.forEach((component) => {
    prompts.push(`- ${component}`);
  });

  // Add prompts for creating files and code
  prompts.push("Creating Files and Code:");
  prompts.push("Decide whether to proceed with creating the files and code based on the formulated idea.");
  prompts.push("Creating Files:");
  prompts.push("- Use the following files to create the scenario:");
  prompts.push("  - generateComponent.ts: Script to generate React component files based on category properties.");
  prompts.push("  - PersonaBuilderData.ts: TypeScript file for initializing user data and questionnaire.");
  prompts.push("  - RandomWalkVisualization.tsx: React component for visualizing random walks and suggesting related documents.");
  prompts.push("Creating Code:");
  prompts.push("- Write TypeScript code for the scenario based on the formulated idea:");
  prompts.push("  - Define types and interfaces for users, artists, artworks, purchases, etc.");
  prompts.push("  - Implement logic for artists to plan and share their art through various media (video, music, documents).");
  prompts.push("  - Design interactions for users to discover, listen to previews, and purchase art from artists' pages.");
  prompts.push("  - Handle data management and communication between frontend and backend systems.");
  prompts.push("  - Include features for users to play music on their pages or in their collections.");

  // Add user query prompt
  prompts.push(`User Query: ${userQuery}`);


// Extend features based on the type of application
if (userQuery === "online marketplace") {
  prompts.push("- Implement features for managing product listings, transactions, and user accounts.");
  prompts.push("- Integrate payment gateways for secure online transactions.");
} else if (userQuery === "social media platform") {
  prompts.push("- Implement features for user profiles, posts, comments, and interactions.");
  prompts.push("- Design algorithms for personalized content recommendations and user engagement metrics.");
} else if (userQuery === "educational platform") {
  prompts.push("- Develop features for course management, student enrollment, and progress tracking.");
  prompts.push("- Incorporate interactive learning tools such as quizzes, assignments, and discussions.");
}
  // Add offer to proceed prompt
  prompts.push("Offer to Proceed:");
  prompts.push("Would you like to proceed with creating the code based on the outlined steps? If yes, we can start implementing the scenario by writing the necessary TypeScript files and then proceed to write the TypeScript code for the scenario. If you have any specific preferences or additional details to include, please let me know!");

  return prompts;
};
