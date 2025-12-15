// PersonaBuilderData.tsx
// PersonaBuilderData.ts
import { RealtimeUpdates } from "@/app/components/community/ActivityFeedComponent";
import { CommonDetails } from '@/app/components/models/details/CommonDetails';
import { Task } from "@/app/components/models/tasks/Task";
import { Team } from '@/app/components/teams/Team';
import { BaseDataEntity, DefaultMeta } from '@/app/config/BaseConfig';
import { Attachment } from '@/app/documents/attachment/Attachment';
import NOTIFICATION_MESSAGES from "@/app/features/support/NotificationMessages";
import { NotificationTypeEnum } from '@/app/features/support/UnifiedNotificationTypes';
import UniqueIDGenerator from "@/app/generators/GenerateUniqueIds";
import ChatSettings from '@/app/hooks/userInterface/ChatSettings';
import { Project } from '@/app/models/projects/Project';
import generateTimeBasedCode from "@/app/models/realtime/TimeBasedCodeGenerator";
import { TeamMember } from '@/app/models/teams/TeamMembers';
import { useNotification } from "@/app/state/context/NotificationContext";
import { DocumentTree, User, UserData, VisualizationData } from "@/app/users/User";
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
export async function initializeUserData<
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = never,
  IncludedFields extends keyof T = keyof T
>(
  id: string | number,
  user: User<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
): Promise<UserData | (() => UserData | null) | null> {
  try {
    const userData: UserData = {
      id: id ? String(id) : '',
      datasets: '', // Add initialization logic for datasets
      role: undefined,
      username: '',
      storeId: 0,
      timeBasedCode: timeBasedCode,
      traits: {} as typeof CommonDetails,
      questionnaireResponses: {}, // Add initialization logic for questionnaireResponses
      chatSettings: {} as ChatSettings, // Add initialization logic for chatSettings
      teamMembers: {} as TeamMember[], // Add initialization logic for teamMembers
      yourDocuments: {} as DocumentTree, // Add initialization logic for yourDocuments
      visualizations: [] as VisualizationData[], // Add initialization logic for visualizations
      teams: {} as Team<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[], // Add initialization logic for teams
      tasks: {} as Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[], // Add initialization logic for tasks
      projects: {} as Project<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[], // Add initialization logic for projects
      realtimeUpdates: {} as RealtimeUpdates<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
    };

    return userData;
  } catch (error) {
    console.error("Error initializing user data:", error);

    // Notify using object-style
    UniqueIDGenerator.notifyFormatted({
      id: "Persona_Builder_Error",
      message: "Persona builder error when formatting",
      content: NOTIFICATION_MESSAGES.Persona.BUILDER_CREATION_ERROR,
      timestamp: new Date(),
      type: NotificationTypeEnum.ERROR
    });

    return null;
  }
}
