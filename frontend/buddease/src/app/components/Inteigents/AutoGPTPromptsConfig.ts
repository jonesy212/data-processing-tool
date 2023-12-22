// src/app/prompts/AutoGPTPromptsConfig.ts
import { Prompt } from "../prompts/PromptComponent";

const autoGPTPrompts: Prompt[] = [
  {
    id: '1',
    text: 'Please describe your experience with our product.',
    type: 'text',
  },
  {
    id: '2',
    text: 'What features do you find most useful?',
    type: 'text',
  },
  {
    id: '3',
    text: 'Rate your overall satisfaction with our service on a scale of 1 to 10.',
    type: 'text',
  },
  // Add more prompts as needed
];

export default autoGPTPrompts;
