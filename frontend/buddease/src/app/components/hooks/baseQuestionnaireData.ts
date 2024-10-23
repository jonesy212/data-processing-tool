// baseQuestionnaireData.ts
import { Question } from "@/app/pages/onboarding/Question";

const baseQuestionnaireData: {
  title: string;
  description: string;
  questions: Question[];
} = {
  title: "User Questionnaire",
  description: "Please answer the following questions to help us understand you better:",
  questions: [
    // ... (your initial set of questions)
  ],
};

export default baseQuestionnaireData;
