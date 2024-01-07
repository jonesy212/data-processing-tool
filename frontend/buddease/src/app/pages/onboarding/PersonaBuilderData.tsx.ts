// PersonaBuilderData.ts
import axios from "axios";
import { Question } from "./Question";

export interface PersonaData {
  [key: string]: string[];
}

export const onboardingQuestionnaireData: {
  title: string;
  description: string;
  questions: Question[];
} = {
  title: "User Questionnaire",
  description: "Please answer the following questions to know you better:",
  questions: [
    // ... (your questionnaire questions)
  ],
};

export function initializeUserData(user: any) {
  if (user.data) {
    return {
      datasets: '',
      tasks: user.data.tasks,
      questionnaireResponses: {
        "1": "",
        "2": "",
        "3": "",
        "4": "",
        "5": "",
        "6": "",
        "7": "",
      },
    };
  }

  return {
    datasets: '',
    tasks: '',
    questionnaireResponses: {},
  };
}

export async function handleQuestionnaireSubmit(userResponses: any, userData: any, setCurrentPhase: any) {
  try {
    const axiosResponse = { status: 200, data: {} };
    (axios.post as any).mockResolvedValue(axiosResponse);

    const response = await axios.post("/api/questionnaire-submit", {
      userResponses,
    });

    if (response.status === 200) {
      setCurrentPhase("OFFER");
    }
  } catch (error) {
    console.error("Error submitting questionnaire:", error);
  }
}
