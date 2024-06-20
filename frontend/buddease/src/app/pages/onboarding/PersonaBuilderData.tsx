// PersonaBuilderData.ts
import ChatSettings from "@/app/components/communications/chat/ChatSettingsPanel";
import { RealtimeUpdates } from "@/app/components/community/ActivityFeedComponent";
import { Team } from "@/app/components/models/teams/Team";
import { TeamMember } from "@/app/components/models/teams/TeamMembers";
import { Project } from "@/app/components/projects/Project";
import { NotificationTypeEnum, useNotification } from "@/app/components/support/NotificationContext";
import NOTIFICATION_MESSAGES from "@/app/components/support/NotificationMessages";
import { DocumentTree, User, UserData, VisualizationData } from "@/app/components/users/User";
import CommonDetails from '../../components/models/CommonDetails';
import generateTimeBasedCode from "../../components/models/realtime/TimeBasedCodeGenerator";
import { Question } from "./Question";

const { notify } = useNotification(); 

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

const timeBasedCode = generateTimeBasedCode()
export async function initializeUserData(id: string | number, user: User): Promise<UserData | (() => UserData | null) | null> {
  try {
    const userData: UserData = {
      id: id ? String(id) : '',
      datasets: '', // Add initialization logic for datasets
      tasks: '', // Add initialization logic for tasks
      questionnaireResponses: {}, // Add initialization logic for questionnaireResponses
      chatSettings: {} as ChatSettings, // Add initialization logic for chatSettings
      projects: {} as Project[], // Add initialization logic for projects
      teams: {} as Team[], // Add initialization logic for teams
      teamMembers: {} as TeamMember[], // Add initialization logic for teamMembers
      yourDocuments: {} as DocumentTree, // Add initialization logic for yourDocuments
      visualizations: [] as VisualizationData[], // Add initialization logic for visualizations
      traits: {} as typeof CommonDetails,
      timeBasedCode: timeBasedCode,
      realtimeUpdates: {} as RealtimeUpdates[],
      role: undefined
    };

    return userData;
  } catch (error) {
    console.error("Error initializing user data:", error);
    notify(
      "Persona Builder Error",
      NOTIFICATION_MESSAGES.Persona.BUILDER_CREATION_ERROR,
      {},
      new Date(),
      NotificationTypeEnum.Error);
    return null;
  }
}
