// src/app/prompts/AutoGPTPromptsConfig.ts
import { Prompt } from "../prompts/PromptPage";

const fetchPrompts = async (phase: string, userContext: any): Promise<Prompt[]> => {
  // Simulate an asynchronous API call to fetch prompts based on the phase and user context
  return new Promise((resolve) => {
    // Your logic to dynamically generate prompts based on the user's context and active dashboard
    let prompts: Prompt[] = [];

    switch (phase) {
      case 'welcome':
        prompts = [
          {
            id: '1',
            text: `Welcome to the ${userContext.activeDashboard} dashboard! Please tell us a bit about yourself.`,
            type: 'text',
          },
          // Add more prompts for the welcome phase
        ];
        break;
      case 'registration':
        prompts = [
          {
            id: '2',
            text: `Great to have you in the ${userContext.activeDashboard} dashboard! What information would you like to provide during registration?`,
            type: 'text',
          },
          // Add more prompts for the registration phase
        ];
        break;
      case 'onboarding':
        prompts = [
          {
            id: '3',
            text: `Let's get started with onboarding in the ${userContext.activeDashboard} dashboard. What specific tasks or information are you looking for?`,
            type: 'text',
          },
          // Add more prompts for the onboarding phase
        ];
        break;
      case 'calendar':
        prompts = [
          {
            id: '4',
            text: `Explore the calendar functionality in the ${userContext.activeDashboard} dashboard. Any specific events or tasks you'd like assistance with?`,
            type: 'text',
          },
          // Add more prompts for the calendar phase
        ];
        break;
      // Add cases for other phases (project, data management, user management, etc.)
      default:
        prompts = [];
    }

    resolve(prompts);
  });
};

export default fetchPrompts;
