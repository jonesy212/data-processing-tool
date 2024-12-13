
import { extractCriteria } from '@/app/api/SnapshotApi';
import { CalendarEvent } from '@/app/components/calendar/CalendarEvent';
import {
    CodingLanguageEnum,
    LanguageEnum,
} from "@/app/components/communications/LanguageEnum";
import { DocumentTypeEnum } from "@/app/components/documents/DocumentGenerator";
import { FileTypeEnum } from "@/app/components/documents/FileType";
import FormatEnum from "@/app/components/form/FormatEnum";
import AnimationTypeEnum from "@/app/components/libraries/animations/AnimationLibrary";
import { Category, CategoryIdentifier } from "@/app/components/libraries/categories/generateCategoryProperties";
import { StatusTrackable, Timestamped } from "@/app/components/models/CommonData";
import { BaseData, Data } from "@/app/components/models/data/Data";
import { ContentManagementPhaseEnum } from "@/app/components/phases/ContentManagementPhase";
import { FeedbackPhaseEnum } from "@/app/components/phases/FeedbackPhase";
import { TaskPhaseEnum } from "@/app/components/phases/TaskProcess";
import { TenantManagementPhaseEnum } from "@/app/components/phases/TenantManagementPhase";
import { AnalysisTypeEnum } from "@/app/components/projects/DataAnalysisPhase/AnalysisType";
import { SecurityFeatureEnum } from "@/app/components/security/SecurityFeatureEnum";
import { SnapshotData, SnapshotStoreConfig, SnapshotWithCriteria } from '@/app/components/snapshots';
import { Snapshot } from "@/app/components/snapshots/LocalStorageSnapshotStore";
import SnapshotStore from "@/app/components/snapshots/SnapshotStore";
import { FilterState } from "@/app/components/state/redux/slices/FilterSlice";
import { NotificationTypeEnum } from "@/app/components/support/NotificationContext";
import UserRoles from "@/app/components/users/UserRoles";
import { IdeaCreationPhaseEnum } from "@/app/components/users/userJourney/IdeaCreationPhase";
import { StructuredMetadata } from "@/app/configs/StructuredMetadata";
import { MessageType } from "@/app/generators/MessaageType";
import { CategoryProperties } from "../personas/ScenarioBuilder";
import {
    BookmarkStatus,
    CalendarStatus,
    DataStatus,
    DevelopmentPhaseEnum,
    NotificationStatus,
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
import { CriteriaType } from "./CriteriaType";



interface FilterCriteria extends Timestamped, StatusTrackable {
  description?: string | null | undefined;
  startDate?: Date;
  endDate?: Date;
  status?: StatusType | null | null;
  priority?: string | PriorityTypeEnum | null;
  assignedUser?: string | null;
  notificationType?: NotificationTypeEnum | null;
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
  categoryCriteria?: CategoryIdentifier | CategoryProperties; // Add categoryCriteria here
}

type CalendarEventWithCriteria = SnapshotWithCriteria<CalendarEvent, CalendarEvent> & CriteriaType;

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
      (event) => event.ideaCreateionPhaseType === criteria.ideaCreateionPhaseType
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




// Utility function to check if a snapshot matches the provided criteria
function matchesCriteria<T, K>(
  snapshot: Snapshot<T, K>,
  criteria: Partial<FilterState>
): boolean {
  // Extract criteria properties from the snapshot
  const snapshotCriteria = extractCriteria(snapshot, Object.keys(criteria) as Array<keyof FilterState>);
  
  // Compare each property in criteria to the corresponding property in snapshotCriteria
  return Object.entries(criteria).every(([key, value]) => {
    return snapshotCriteria[key as keyof FilterState] === value;
  });
}

const criteria: FilterCriteria = {
  description: "Sample Event",
  startDate: new Date("2023-08-01"),
  endDate: new Date("2023-08-05"),
  status: StatusType.Scheduled,
  priority: PriorityTypeEnum.High,
  assignedUser: "John Doe",
  todoStatus: TodoStatus.Completed,
  taskStatus: TaskStatus.InProgress,
  teamStatus: TeamStatus.Active,
  dataStatus: DataStatus.Processed,
  calendarStatus: CalendarStatus.Approved,
  notificationStatus: NotificationStatus.READ,
  bookmarkStatus: BookmarkStatus.Saved,
  priorityType: PriorityTypeEnum.Urgent,
  projectPhase: ProjectPhaseTypeEnum.Planning,
  developmentPhase: DevelopmentPhaseEnum.CODING,
  subscriberType: SubscriberTypeEnum.PREMIUM,
  subscriptionType: SubscriptionTypeEnum.Monthly,
  analysisType: AnalysisTypeEnum.STATISTICAL,
  documentType: DocumentTypeEnum.PDF,
  fileType: FileTypeEnum.Document,
  tenantType: TenantManagementPhaseEnum.TenantA,
  ideaCreateionPhaseType: IdeaCreationPhaseEnum.IDEATION,
  securityFeatureType: SecurityFeatureEnum.Encryption,
  feedbackPhaseType: FeedbackPhaseEnum.FEEDBACK_REVIEW,
  contentManagementType: ContentManagementPhaseEnum.CONTENT_CREATION,
  taskPhaseType: TaskPhaseEnum.TASK_CREATING,
  animationType: AnimationTypeEnum.Notification,
}



// Sample CalendarEvent data
const events: CalendarEvent[] = [
  {
    description: "This is a sample event",
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
      roles: [], 
      followers: [],
      bannerUrl: "",
      preferences: {
        refreshUI: () => {},
      }, 
      storeId: 0,
      username: "",
      memberName: "",
      avatarUrl: "",
      email: "",
      role: UserRoles.Developer,
      location: "",
      bio: "",
      skills: [],
      interests: [],
      socialLinks: {
        github: "",
        linkedin: "",
        twitter: "",
        website: "",
        devpost: "",
        youtube: "",
        medium: "",
        facebook: "",
        twitch: "",
        instagram: "",
        discord: "",
        dribble: "",
        behance: "",
        tiktok: "",
        telegram: "",
        reddit: "",
        quora: "",
        stackoverflow: "",
        gitlab: ""
      },
      teamId: "",
      roleInTeam: "",
      firstName: "",
      lastName: "",
      tier: "",
      token: null,
      uploadQuota: 0,
      createdAt: undefined,
      updatedAt: undefined,
      fullName: null,
      userType: "",
      hasQuota: false,
      profilePicture: null,
      processingTasks: [],
      persona: null,
      friends: [],
      blockedUsers: [],
      settings: null,
      privacySettings: undefined,
      notifications: undefined,
      activityLog: [],
      relationshipStatus: null,
      hobbies: [],
      achievements: [],
      profileVisibility: "",
      profileAccessControl: undefined,
      activityStatus: "",
      isAuthorized: false,
      childIds: [],
      relatedData: []
    },
    participants: [],
    teamMemberId: "",
    date: new Date(),
    getSnapshotStoreData(): Promise<CalendarEventWithCriteria[]> {
      return new Promise((resolve, reject) => {
        try {
          // Your logic to retrieve data goes here
          const data: CalendarEventWithCriteria[] = [
            {
              description: "This is a sample event",
              startDate: new Date("2024-06-01"),
              endDate: new Date("2024-06-05"),
              status: StatusType.Scheduled,
              priority: PriorityTypeEnum.High,
              assignedUser: "<NAME>",
              todoStatus: TodoStatus.Completed,
              taskStatus: TaskStatus.InProgress,
              teamStatus: TeamStatus.Active,
              dataStatus: DataStatus.Processed,
              calendarStatus: CalendarStatus.IDLE,



              initialState, isCore, initialConfig, onInitialize,
              
            }
            ]
          resolve(data);
          } catch(error) {
            reject(error);
          }
        })
      },
    meta:{} as Data<T>,
      getData(): Promise<SnapshotWithCriteria<BaseData, BaseData>> {
      return new Promise((resolve, reject) => {
        try {
          // Sample data implementing SnapshotWithCriteria
          const data: SnapshotWithCriteria<BaseData, BaseData>[] = [
          {
              description: "This is a sample event",
              startDate: new Date("2024-06-01"),
              endDate: new Date("2024-06-05"),
              status: StatusType.Scheduled,
              priority: PriorityTypeEnum.High,
              assignedUser: "John Doe",
              todoStatus: TodoStatus.Completed,
              taskStatus: TaskStatus.InProgress,
              teamStatus: TeamStatus.Active,
              dataStatus: DataStatus.Processed,
              calendarStatus: CalendarStatus.Approved,
              notificationStatus: NotificationStatus.READ,
              bookmarkStatus: BookmarkStatus.Saved,
              priorityType: PriorityTypeEnum.Urgent,
              projectPhase: ProjectPhaseTypeEnum.Planning,
              developmentPhase: DevelopmentPhaseEnum.CODING,
              subscriberType: SubscriberTypeEnum.PREMIUM,
              subscriptionType: SubscriptionTypeEnum.Monthly,
              analysisType: AnalysisTypeEnum.STATISTICAL,
              documentType: DocumentTypeEnum .PDF,
              fileType: FileTypeEnum.Document,
              tenantType: TenantManagementPhaseEnum.TenantA,
              ideaCreationPhaseType: IdeaCreationPhaseEnum.IDEATION,
              securityFeatureType: SecurityFeatureEnum.Encryption,
              feedbackPhaseType: FeedbackPhaseEnum.FEEDBACK_REVIEW,
              contentManagementType: ContentManagementPhaseEnum.CONTENT_EDITING,
              taskPhaseType: TaskPhaseEnum.EXECUTION,
              animationType: AnimationTypeEnum.TwoD,
              languageType: LanguageEnum.English,
              codingLanguageType: CodingLanguageEnum.Javascript,
              formatType: FormatEnum.DOC,
              privacySettingsType: PrivacySettingEnum.Public,
              messageType: MessageType.Email,
              id: "event1",
              title: "Sample Event",
              content: "This is a sample event content",
              topics: [],
              highlights: [],
              files: [],
              rsvpStatus: "yes"
            }
          ]; // Example data, replace with actual logic
    
          // Resolve the promise with the data
          resolve(data);
        } catch (error) {
          // In case of an error, you can call reject with an error message
          reject(new Error("Something went wrong"));
        }
      })
    },
    
    then: function <T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
      callback: (newData: Snapshot<T, K>) => void
    ): Snapshot<T, K> {
     
      // Simulate fetching data
      const snapshot: Snapshot<T, K>  = {
        description: "This is a sample event",
        // startDate: new Date("2024-06-01"),
        // endDate: new Date("2024-06-05"),
        status: StatusType.Scheduled,
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
        getData: function (id: number | string, 
          snapshotStore: SnapshotStore<T, K>
        ): Data<T> | Map<string, Snapshot<T, K>> | null | undefined {
          // Simulate fetching data
          // Fetch or create the snapshot data
          const snapshot: Snapshot<T, K> = {
            description: "This is a sample event",
            startDate: new Date("2024-06-01"),
            endDate: new Date("2024-06-05"),
            status: StatusType.Scheduled,
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
          } as Snapshot<T, K>;

          if (typeof callback === 'function') {
            callback(snapshot);
          }

          // If you have specific logic for creating or fetching data based on the id, implement it here
          if (snapshot) {
            return snapshot; // Return the found snapshot or any data you wish to return
          }
          
          return null; // Or some other default value
      
        },
        createSnapshot(
          id: string,
          snapshotData: SnapshotData<T, K>,
          additionalData: any,
          category?: string | symbol | Category,
          callback?: (snapshot: Snapshot<T, K>) => void,
          snapshotStore?: SnapshotStore<T, K>,
          snapshotStoreConfig?: SnapshotStoreConfig<T, K, StructuredMetadata<T, K>, never> ,
        ): Snapshot<T, K> | null {
          const newSnapshot: Snapshot<T, K> = {
            id,
            ...snapshotData,  // Assuming you want to include data from the existing snapshotData
            additionalData,
            category,
            // Include any other necessary properties
          };
        
          // Optionally call the callback with the new snapshot
          if (callback) {
            callback(newSnapshot);
          }
        
          return newSnapshot; // Return the created snapshot
        },
        callback(snapshot: any) { },
      }
      return snapshot as unknown as Snapshot<T, K>
    },

  },
  // Add more CalendarEvent data as needed
];
 


// Sample filter criteria
const filterCriteria: FilterCriteria = {
  startDate: new Date("2024-06-01"),
  endDate: new Date("2024-06-30"),
  status: StatusType.Scheduled,
  priority: PriorityTypeEnum.High,
  assignedUser: "John Doe",
  description: "This is a sample event",
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
  analysisType: AnalysisTypeEnum.STATISTICAL, // Updated to enum value
  documentType: DocumentTypeEnum.PDF, // Updated to enum value
  fileType: FileTypeEnum.Document, // Updated to enum value
  tenantType: TenantManagementPhaseEnum.TenantA, // Updated to enum value
  ideaCreateionPhaseType: IdeaCreationPhaseEnum.IDEATION, // Updated to enum value
  securityFeatureType: SecurityFeatureEnum.Encryption, // Updated to enum value
  feedbackPhaseType: FeedbackPhaseEnum.FEEDBACK_REVIEW, // Updated to enum value
  contentManagementType: ContentManagementPhaseEnum.CONTENT_ITEM_SELECTION, // Updated to enum value
  taskPhaseType: TaskPhaseEnum.EXECUTION, // Updated to enum value
  animationType: AnimationTypeEnum.TwoD, // Updated to enum value
  languageType: LanguageEnum.English, // Updated to enum value
  codingLanguageType: CodingLanguageEnum.Javascript, // Updated to enum value
  formatType: FormatEnum.JSON, // Updated to enum value
  privacySettingsType: PrivacySettingEnum.Public, // Updated to enum value
  messageType: MessageType.Email, // Updated to enum value
  // Add more filter criteria as needed
};


// Applying filters
const filteredEvents = applyFilters(events, filterCriteria);

console.log(filteredEvents);
export { criteria, matchesCriteria };
export type { CalendarEventWithCriteria, FilterCriteria };

