// dynamicFormGenerator.ts

import { Question } from '@/app/pages/onboarding/Question'; // Import the Question interface
import generateDynamicQuestions from './dynamicQuestionGenerator';

interface FormQuestion {
    id: string;
    question: string; // Corrected to match the 'text' property of the Question interface
    type: 'text' | 'multipleChoice' | 'boolean' | 'multiAnswer'; // Add 'multiAnswer' type
    options?: Array<{ value: string; label: string }>; // Update to accept an array of objects with value and label properties
    allowCommentary?: boolean; // Flag to indicate if commentary is allowed
    maxMessageLength?: number; // Maximum length allowed for the message
  }
  

const generateDynamicFormQuestions = (userResponses: any): FormQuestion[] => {
  // Generate dynamic questions based on user responses using the existing dynamic questionnaire generator
  const dynamicQuestions: Question[] = generateDynamicQuestions(userResponses);

  // Convert dynamic questions to form questions
  const formQuestions: FormQuestion[] = dynamicQuestions.map((question) => {
    let type: 'text' | 'multipleChoice' | 'boolean' | 'multiAnswer' = 'text'; // Default type is text

    // Logic to determine the question type based on the dynamic question
    // You can customize this logic based on your requirements

    // Example: If the question contains the word "option" or "choice", it's a multiple choice question
    if (question.text.toLowerCase().includes('option') || question.text.toLowerCase().includes('choice')) {
      type = 'multipleChoice';
    } else if (question.text.toLowerCase().includes('agree') || question.text.toLowerCase().includes('disagree')) {
      type = 'boolean'; // If the question is about agreement, it's a boolean (yes/no) question
    } else if (question.text.toLowerCase().includes('answer') || question.text.toLowerCase().includes('answers')) {
      type = 'multiAnswer'; // If the question is about multiple answers, set type to 'multiAnswer'
    }

    // Customize the question type and options based on your logic
    // You can add more conditions to handle different types of questions

    return {
      id: question.id,
      question: question.text, // Use 'text' property instead of 'question'
      type,
      options: question.options, // Use the 'options' property directly
    };
  });

  return formQuestions;
};

export default generateDynamicFormQuestions;
