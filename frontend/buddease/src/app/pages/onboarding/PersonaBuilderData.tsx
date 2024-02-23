// PersonaBuilderData.ts
import { endpoints } from "@/app/api/ApiEndpoints";
import axiosInstance from "@/app/api/axiosInstance";
import { Team } from "@/app/components/models/teams/Team";
import { TeamMember } from "@/app/components/models/teams/TeamMembers";
import Project from "@/app/components/projects/Project";
import { NotificationType, useNotification } from "@/app/components/support/NotificationContext";
import NOTIFICATION_MESSAGES from "@/app/components/support/NotificationMessages";
import { User } from "@/app/components/users/User";
import axios from "axios";
import generateTimeBasedCode from "../../../../models/realtime/TimeBasedCodeGenerator";
import { Question } from "./Question";

const { notify } = useNotification();  // Destructure notify from useNotification

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

export async function initializeUserData(id: string | number, user: User) {
  try {
    const response = await axiosInstance.get(endpoints.tasks.initializeUserData, {
      params: {
        id: id ? String(id) : '',
        userData: user,
      },
    });

    // Move the logic inside the try block to handle the case when user.data is present
    const timeBaseCode = generateTimeBasedCode()


    if (response.status === 200) {
      const userData = response.data; // Assuming the response data contains the user data

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
          id: id ? String(id) : '',
          traits: {},
          timeBasedCode: timeBaseCode
        };
      }
    }

    return {
      datasets: '',
      tasks: '',
      id: id ? String(id) : '',
      questionnaireResponses: {},
      projects: {} as Project[],
      traits: {},
      teams: {} as Team[],
      teamMembers: {} as TeamMember[],
    };
  } catch (error) {
    console.error("Error initializing user data:", error);
    notify("Persona Buider Error", NOTIFICATION_MESSAGES.Persona.DEFAULT, new Date(), {} as NotificationType);

    return null;
  }
}

export async function handleQuestionnaireSubmit(userResponses: any, userData: any, setCurrentPhase: any) {
  try {
    const axiosResponse = { status: 200, data: {} };
    (axios.post as any).mockResolvedValue(axiosResponse);

    const response = await axiosInstance.post(endpoints.tasks.handleQuestionnaireSubmit, {
      userResponses,
    });

    if (response.status === 200) {
      setCurrentPhase("OFFER");
    }
  } catch (error) {
    console.error("Error submitting questionnaire:", error);
  }
}
