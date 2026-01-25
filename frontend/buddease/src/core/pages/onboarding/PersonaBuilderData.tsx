// PersonaBuilderData.tsx
import { RealtimeUpdates } from "@/core/components/community/ActivityFeedComponent";
import { CommonDetails } from '@/core/components/models/details/CommonDetails';
import { Task } from "@/core/components/models/tasks/Task";
import { Team } from '@/core/components/teams/Team';
import type { BaseDataEntity, DefaultMeta } from '@/core/config/BaseConfig';
import type { Attachment } from '@/core/documents/attachment/Attachment';
import NOTIFICATION_MESSAGES from "@/core/features/support/NotificationMessages";
import { NotificationTypeEnum } from '@/core/features/support/UnifiedNotificationTypes';
import UniqueIDGenerator from "@/core/generators/GenerateUniqueIds";
import ChatSettings from '@/core/hooks/userInterface/ChatSettings';
import { Project } from '@/core/models/projects/Project';
import generateTimeBasedCode from "@/core/models/realtime/TimeBasedCodeGenerator";
import { TeamMember } from '@/core/models/teams/TeamMembers';
import { Question } from "@/core/pages/onboarding/Question";
import { useNotification } from "@/core/state/context/NotificationContext";
import type { DocumentTree, UserData, VisualizationData } from '@/core/users/User';
import type { User } from '@/core/users/User';

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
