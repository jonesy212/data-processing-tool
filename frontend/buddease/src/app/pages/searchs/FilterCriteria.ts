import {
  CodingLanguageEnum,
  LanguageEnum,
} from "@/app/components/communications/LanguageEnum";
import { DocumentTypeEnum } from "@/app/components/documents/DocumentGenerator";
import { FileTypeEnum } from "@/app/components/documents/FileType";
import FormatEnum from "@/app/components/form/FormatEnum";
import AnimationTypeEnum from "@/app/components/libraries/animations/AnimationLibrary";
import { ContentManagementPhaseEnum } from "@/app/components/phases/ContentManagementPhase";
import { FeedbackPhaseEnum } from "@/app/components/phases/FeedbackPhase";
import { TaskPhaseEnum } from "@/app/components/phases/TaskProcess";
import { TenantManagementPhaseEnum } from "@/app/components/phases/TenantManagementPhase";
import { AnalysisTypeEnum } from "@/app/components/projects/DataAnalysisPhase/AnalysisType";
import { SecurityFeatureEnum } from "@/app/components/security/SecurityFeatureEnum";
import { NotificationTypeEnum } from "@/app/components/support/NotificationContext";
import { IdeaCreationPhaseEnum } from "@/app/components/users/userJourney/IdeaCreationPhase";
import { MessageType } from "@/app/generators/MessaageType";
import {
  BookmarkStatus,
  CalendarStatus,
  DataStatus,
  DevelopmentPhaseEnum,
  NotificationStatus,
  PriorityStatus,
  PriorityTypeEnum,
  PrivacySettingEnum,
  ProjectPhaseTypeEnum,
  StatusType,
  SubscriberTypeEnum,
  SubscriptionTypeEnum,
  TaskStatus,
  TeamStatus,
  TodoStatus,
} from "./../../components/models/data/StatusType";
import { CalendarEvent } from "./../../components/state/stores/CalendarEvent";
import { Data } from "@/app/components/models/data/Data";
import { Snapshot } from "@/app/components/snapshots/SnapshotStore";
import UserRoles from "@/app/components/users/UserRoles";

// .ts
interface FilterCriteria {
  startDate?: Date;
  endDate?: Date;
  status?: StatusType | null;
  priority?: PriorityStatus | null;
  assignedUser?: string | null;
  notificationType?: NotificationTypeEnum;
  todoStatus?: TodoStatus | null; // Filter by todo status
  taskStatus?: TaskStatus | null; // Filter by task status
  teamStatus?: TeamStatus | null; // Filter by team status
  dataStatus?: DataStatus | null; // Filter by data status
  calendarStatus?: CalendarStatus | null; // Filter by calendar status
  notificationStatus?: NotificationStatus | null; // Filter by notification status
  bookmarkStatus?: BookmarkStatus | null; // Filter by bookmark status
  priorityType?: PriorityTypeEnum | null; // Filter by priority type
  projectPhase?: ProjectPhaseTypeEnum | null; // Filter by project phase
  developmentPhase?: DevelopmentPhaseEnum | null; // Filter by development phase
  subscriberType?: SubscriberTypeEnum | null; // Filter by subscriber type
  subscriptionType?: SubscriptionTypeEnum | null; // Filter by subscription type
  priorityTypeE?: PriorityTypeEnum;
  analysisType?: AnalysisTypeEnum | null; // Filter by analysis type
  documentType?: DocumentTypeEnum | null; // Filter by document type
  fileType?: FileTypeEnum | null; // Filter by file type
  tenantType?: TenantManagementPhaseEnum | null;
  ideaCreateionPhaseType?: IdeaCreationPhaseEnum | null; // Filter by idea creation phase
  securityFeatureType?: SecurityFeatureEnum | null; // Filter by security feature type
  feedbackPhaseType?: FeedbackPhaseEnum | null; // Filter by feedback phase type
  contentManagementType?: ContentManagementPhaseEnum | null; // Filter by content management phase type
  taskPhaseType?: TaskPhaseEnum | null; // Filter by task phase type
  animationType?: AnimationTypeEnum | null; // Filter by animation type
  languageType?: LanguageEnum | null; // Filter by language type
  codingLanguageType?: CodingLanguageEnum | null; // Filter by coding language type
  formatType?: FormatEnum | null; // Filter by format type
  privacySettingsType?: PrivacySettingEnum | null; // Filter by privacy settings type
  messageType?: MessageType | null; // Filter by message type
  // Add more filter criteria as needed
}

const applyFilters = (
  events: CalendarEvent[],
  criteria: FilterCriteria
): CalendarEvent[] => {
  let filteredEvents = [...events];

  if (criteria.startDate !== undefined) {
    filteredEvents = filteredEvents.filter(
      (event) =>
        event.startDate &&
        event.startDate >= (criteria.startDate ?? new Date(0))
    );
  }

  if (criteria.endDate !== undefined) {
    filteredEvents = filteredEvents.filter(
      (event) =>
        event.endDate && event.endDate <= (criteria.endDate ?? new Date())
    );
  }

  if (criteria.status !== null) {
    filteredEvents = filteredEvents.filter(
      (event) => event.status === criteria.status
    );
  }

  if (criteria.priority !== null) {
    filteredEvents = filteredEvents.filter(
      (event) => event.priority === criteria.priority
    );
  }

  if (criteria.assignedUser !== null) {
    filteredEvents = filteredEvents.filter(
      (event) => event.assignedUser === criteria.assignedUser
    );
  }

  if (criteria.todoStatus !== null) {
    filteredEvents = filteredEvents.filter(
      (event) => event.todoStatus === criteria.todoStatus
    );
  }

  if (criteria.taskStatus !== null) {
    filteredEvents = filteredEvents.filter(
      (event) => event.taskStatus === criteria.taskStatus
    );
  }

  if (criteria.teamStatus !== null) {
    filteredEvents = filteredEvents.filter(
      (event) => event.teamStatus === criteria.teamStatus
    );
  }

  if (criteria.dataStatus !== null) {
    filteredEvents = filteredEvents.filter(
      (event) => event.dataStatus === criteria.dataStatus
    );
  }

  if (criteria.calendarStatus !== null) {
    filteredEvents = filteredEvents.filter(
      (event) => event.calendarStatus === criteria.calendarStatus
    );
  }

  if (criteria.notificationStatus !== null) {
    filteredEvents = filteredEvents.filter(
      (event) => event.notificationStatus === criteria.notificationStatus
    );
  }

  if (criteria.bookmarkStatus !== null) {
    filteredEvents = filteredEvents.filter(
      (event) => event.bookmarkStatus === criteria.bookmarkStatus
    );
  }

  if (criteria.priorityType !== null) {
    filteredEvents = filteredEvents.filter(
      (event) => event.priorityType === criteria.priorityType
    );
  }

  if (criteria.projectPhase !== null) {
    filteredEvents = filteredEvents.filter(
      (event) => event.projectPhase === criteria.projectPhase
    );
  }

  if (criteria.developmentPhase !== null) {
    filteredEvents = filteredEvents.filter(
      (event) => event.developmentPhase === criteria.developmentPhase
    );
  }

  if (criteria.subscriberType !== null) {
    filteredEvents = filteredEvents.filter(
      (event) => event.subscriberType === criteria.subscriberType
    );
  }

  if (criteria.subscriptionType !== null) {
    filteredEvents = filteredEvents.filter(
      (event) => event.subscriptionType === criteria.subscriptionType
    );
  }

  if (criteria.priorityType !== null) {
    filteredEvents = filteredEvents.filter(
      (event) => event.priorityType === criteria.priorityType
    );
  }
  if (criteria.analysisType !== null) {
    filteredEvents = filteredEvents.filter(
      (event) => event.analysisType === criteria.analysisType
    );
  }

  if (criteria.documentType !== null) {
    filteredEvents = filteredEvents.filter(
      (event) => event.documentType === criteria.documentType
    );
  }
  // Add more filtering logic for additional criteria as needed
  if (criteria.fileType !== null) {
    filteredEvents = filteredEvents.filter(
      (event) => event.fileType === criteria.fileType
    );
  }

  if (criteria.tenantType !== null) {
    filteredEvents = filteredEvents.filter(
      (event) => event.tenantType === criteria.tenantType
    );
  }

  if (criteria.ideaCreateionPhaseType !== null) {
    filteredEvents = filteredEvents.filter(
      (event) =>
        event.ideaCreateionPhaseType === criteria.ideaCreateionPhaseType
    );
  }
  if (criteria.securityFeatureType !== null) {
    filteredEvents = filteredEvents.filter(
      (event) => event.securityFeatureType === criteria.securityFeatureType
    );
  }
  if (criteria.feedbackPhaseType !== null) {
    filteredEvents = filteredEvents.filter(
      (event) => event.feedbackPhaseType === criteria.feedbackPhaseType
    );
  }
  if (criteria.contentManagementType !== null) {
    filteredEvents = filteredEvents.filter(
      (event) => event.contentManagementType === criteria.contentManagementType
    );
  }
  if (criteria.taskPhaseType !== null) {
    filteredEvents = filteredEvents.filter(
      (event) => event.taskPhaseType === criteria.taskPhaseType
    );
  }
  if (criteria.animationType !== null) {
    filteredEvents = filteredEvents.filter(
      (event) => event.animationType === criteria.animationType
    );
  }
  if (criteria.languageType !== null) {
    filteredEvents = filteredEvents.filter(
      (event) => event.languageType === criteria.languageType
    );
  }
  if (criteria.codingLanguageType !== null) {
    filteredEvents = filteredEvents.filter(
      (event) => event.codingLanguageType === criteria.codingLanguageType
    );
  }
  if (criteria.formatType !== null) {
    filteredEvents = filteredEvents.filter(
      (event) => event.formatType === criteria.formatType
    );
  }
  if (criteria.privacySettingsType !== null) {
    filteredEvents = filteredEvents.filter(
      (event) => event.privacySettingsType === criteria.privacySettingsType
    );
  }
  if (criteria.messageType !== null) {
    filteredEvents = filteredEvents.filter(
      (event) => event.messageType === criteria.messageType
    );
  }

  return filteredEvents;
};

// Sample CalendarEvent data
const events: CalendarEvent[] = [
  {
    startDate: new Date("2024-06-01"),
    endDate: new Date("2024-06-05"),
    status: "scheduled",
    priority: "high",
    assignedUser: "John Doe",
    todoStatus: "completed",
    taskStatus: "in progress",
    teamStatus: "active",
    dataStatus: "processed",
    calendarStatus: "approved",
    notificationStatus: "read",
    bookmarkStatus: "saved",
    priorityType: "urgent",
    projectPhase: "planning",
    developmentPhase: "coding",
    subscriberType: "premium",
    subscriptionType: "monthly",
    analysisType: AnalysisTypeEnum.STATISTICAL,
    documentType: "pdf",
    fileType: "document",
    tenantType: "tenantA",
    ideaCreateionPhaseType: "ideation",
    securityFeatureType: "encryption",
    feedbackPhaseType: "review",
    contentManagementType: "content",
    taskPhaseType: "execution",
    animationType: "2d",
    languageType: "english",
    codingLanguageType: "javascript",
    formatType: "json",
    privacySettingsType: "public",
    messageType: "email",
    id: "",
    title: "",
    content: "",
    topics: [],
    highlights: [],
    files: [],
    rsvpStatus: "yes",
    host: {
      id: "",
      username: "",
      memberName: "",
      avatarUrl: "",
      email: "",
      phone: "",
      role: UserRoles.Developer,
      status: "",
      location: "",
      date: undefined,
      then: function (callback: (newData: Snapshot<Data>) => void): void {
        throw new Error("Function not implemented.");
      }
    },
    participants: [],
    teamMemberId: "",
    date: undefined,
    then: function (callback: (newData: Snapshot<Data>) => void): void {
      throw new Error("Function not implemented.");
    }
  },
  // Add more CalendarEvent data as needed
];

// Sample filter criteria
// Sample filter criteria
const filterCriteria: FilterCriteria = {
  startDate: new Date("2024-06-01"),
  endDate: new Date("2024-06-30"),
  status: StatusType.Scheduled,
  priority: PriorityStatus.High,
  assignedUser: "John Doe",
  todoStatus: TodoStatus.Completed,
  taskStatus: TaskStatus.InProgress, // Updated to enum value
  teamStatus: TeamStatus.Active, // Updated to enum value
  dataStatus: DataStatus.Processed, // Updated to enum value
  calendarStatus: CalendarStatus.Approved, // Updated to enum value
  notificationStatus: NotificationStatus.READ, // Updated to enum value
  bookmarkStatus: BookmarkStatus.Saved, // Updated to enum value
  priorityType: PriorityTypeEnum.Urgent, // Updated to enum value
  projectPhase: ProjectPhaseTypeEnum.Planning, // Updated to enum value
  developmentPhase: DevelopmentPhaseEnum.CODING, // Updated to enum value
  subscriberType: SubscriberTypeEnum.PREMIUM, // Updated to enum value
  subscriptionType: SubscriptionTypeEnum.Monthly, // Updated to enum value
  priorityType: PriorityTypeEnum.Emergency, // Updated to enum value
  analysisType: AnalysisTypeEnum.Statistical, // Updated to enum value
  documentType: DocumentTypeEnum.PDF, // Updated to enum value
  fileType: FileTypeEnum.Document, // Updated to enum value
  tenantType: TenantManagementPhaseEnum.TenantA, // Updated to enum value
  ideaCreateionPhaseType: IdeaCreationPhaseEnum.Ideation, // Updated to enum value
  securityFeatureType: SecurityFeatureEnum.Encryption, // Updated to enum value
  feedbackPhaseType: FeedbackPhaseEnum.Review, // Updated to enum value
  contentManagementType: ContentManagementPhaseEnum.Content, // Updated to enum value
  taskPhaseType: TaskPhaseEnum.Execution, // Updated to enum value
  animationType: AnimationTypeEnum.TwoD, // Updated to enum value
  languageType: LanguageEnum.English, // Updated to enum value
  codingLanguageType: CodingLanguageEnum.JavaScript, // Updated to enum value
  formatType: FormatEnum.JSON, // Updated to enum value
  privacySettingsType: PrivacySettingEnum.Public, // Updated to enum value
  messageType: MessageType.Email, // Updated to enum value
  // Add more filter criteria as needed
};

// Applying filters
const filteredEvents = applyFilters(events, filterCriteria);

console.log(filteredEvents);
