// DynamicFormConfig.ts

interface QuestionOption {
    value: string;
    label: string;
  }
  
  interface QuestionConfig {
    id: string;
    text: string;
    type: 'text' | 'multipleChoice' | 'boolean' | 'multiAnswer';
    options?: QuestionOption[];
    allowCommentary: boolean;
    maxMessageLength?: number;
  }
  
  interface DynamicFormConfig {
    questions: QuestionConfig[];
  }
  
  export default DynamicFormConfig;
  