
// FilterCriteria.ts
import { extractCriteria } from '@/core/api/SnapshotApi';
import { CalendarEvent } from '@/core/calendar/CalendarEvent';
import {
    CodingLanguageEnum,
    LanguageEnum,
} from "@/core/communications/LanguageEnum";
import FormatEnum from "@/core/components/form/FormatEnum";
import { ContentManagementPhaseEnum } from "@/core/components/phases/ContentManagementPhase";
import { FeedbackPhaseEnum } from "@/core/components/phases/FeedbackPhase";
import { TaskPhaseEnum } from "@/core/components/phases/TaskProcess";
import { TenantManagementPhaseEnum } from "@/core/components/phases/TenantManagementPhase";
import { BaseDataEntity, BaseDataRoot, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import { UnifiedMetadata } from '@/core/config/MetaDataOptions';
import { StructuredMetadata } from "@/core/config/StructuredMetadata";
import { Attachment } from '@/core/documents/attachment/Attachment';
import { FileTypeEnum } from "@/core/documents/FileType";
import { MessageType } from "@/core/generators/MessaageType";
import AnimationTypeEnum from "@/core/libraries/animations/AnimationLibrary";
import { CategoryIdentifier } from "@/core/libraries/categories/generateCategoryProperties";
import { StatusTrackable, Timestamped } from "@/core/models/CommonData";
import { BaseData } from '@/core/models/data/Data';
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
} from "@/core/models/data/StatusType";
import UserRoles from '@/core/models/UserRoles';
import { CategoryProperties } from "@/core/pages/personas/ScenarioBuilder";
import { Filter } from "@/core/pages/searches/Filter";
import { SecurityFeatureEnum } from "@/core/server/security/SecurityFeatureEnum";
import { createSnapshot } from '@/core/snapshots/createSnapshot';
import type { Snapshot } from '@/core/snapshots/Snapshot';
import { SnapshotWithCriteria } from '@/core/snapshots/SnapshotWithCriteria';
import { FilterState } from "@/core/state/redux/slices/FilterSlice";
import { AnalysisTypeEnum } from "@/core/typings/AnalysisType";
import {
    DocumentTypeEnum
} from "@/core/typings/documentTypes";
import { CalendarAttachment, CalendarEntity, CalendarExcludedFields, CalendarIncludedFields, CalendarK, CalendarMeta } from "@/core/typings/entities/CalendarEntity";
import { IdeaCreationPhaseEnum } from "@/core/users/userJourney/IdeaCreationPhase";
import { Pagination } from '@refinedev/core';

import { Sort } from '@/core/settings/SortCriteria';


interface FilterCriteria extends Timestamped, StatusTrackable {
  description?: string | undefined;
  startDate?: Date;
  endDate?: Date;
  filters: Filter[];
  sort: Sort[];
  pagination?: Pagination;
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

const applyFilters = <
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  events: CalendarEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
  criteria: FilterCriteria
): CalendarEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] => {
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
function matchesCriteria<
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
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
  filters: [],
  sort: [],
  date: new Date(),
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



interface DateRannge {
  to: Date,
  from: Date
}
// 1. First define your base CalendarEvent type
interface BaseCalendarEvent {
  description: string;
  startDate: Date;
  endDate: Date;
  status: StatusType;
  priority: PriorityTypeEnum;
  assignedUser: string;
  todoStatus: TodoStatus;
  taskStatus: TaskStatus;
  teamStatus: TeamStatus;
  dataStatus: DataStatus;
  calendarStatus: CalendarStatus;
  dateRange?: Range
}

// 2. Create a type that combines with Snapshot requirements
type CalendarEventWithCriteria = BaseCalendarEvent & 
  Pick<SnapshotWithCriteria<BaseData>, 
    'initialState' | 
    'isCore' | 
    'initialConfig' | 
    'onInitialize'
  > & {
    criteria: FilterCriteria;
    analysisType?: AnalysisTypeEnum;
  };





const { latestVersion = createLatestVersion<VersionEntity, VersionK, VersionMeta, VersionAttachment, VersionExcludedFields, VersionIncludedFields>(), ...rest } = data;


// Sample CalendarEvent data
const events: CalendarEvent<CalendarEntity, CalendarK, CalendarMeta, CalendarAttachment, CalendarExcludedFields, CalendarIncludedFields>[] = [
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
    latestVersion: latestVersion,
    currentMeta: currentMeta,
    currentMetadata: currentMetadata,
    
    
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
        modules: []
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
      return new Promise((resolve) => {
        const data: CalendarEventWithCriteria[] = [
          {
            // Base event properties
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
            
            // Required Snapshot properties
            initialState: {},
            isCore: true,
            initialConfig: {},
            onInitialize: () => {},
            
            // Criteria properties
            criteria: {
              // Your filter criteria implementation
              dateRange: {
                from: new Date("2024-06-01"),
                to: new Date("2024-06-05")
              },
              // other criteria fields
            },
            analysisType: AnalysisTypeEnum.EventAnalysis
          }
        ];
        resolve(data);
      });
      },
      meta: {} as UnifiedMetadata<CalendarEntity, CalendarEntity, CalendarMeta, Attachment, CalendarExcludedFields, CalendarIncludedFields>,
      getData(): Promise<Snapshot<CalendarEntity, CalendarEntity, CalendarMeta, Attachment, CalendarExcludedFields, CalendarIncludedFields>> {
      return new Promise((resolve, reject) => {
        try {
          // Sample data implementing SnapshotWithCriteria
          const data: SnapshotWithCriteria<CalendarEntity, CalendarEntity, CalendarMeta, Attachment, CalendarExcludedFields, CalendarIncludedFields>[] = [
          {
            description: "This is a sample event",
            id: "event1",
            title: "Sample Event",
            content: 'Sample Event Content',
            topics: [],
            highlights: [],
            files: [],
            rsvpStatus: "yes",
            startDate: new Date("2024-06-01"),
            endDate: new Date("2024-06-05"),

            dataObject: {}, // Must satisfy BaseData type
            deleted: false,
            initialState: {},
            isCore: true,
            initialConfig: {},
            metadata: {} as UnifiedMetadata<CalendarEntity, CalendarEntity, CalendarMeta, Attachment, CalendarExcludedFields, CalendarIncludedFields>,
            createdAt: new Date(),
            updatedAt: new Date(),
            version: "1.0.0",
    
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
    
then: function <  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T>(
  callback: (newData: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void
): Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  
  // Create base data with your calendar properties
  const baseCalendarData: T = {
    // Calendar properties
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
    // Add other required BaseDataEntity properties
    snapshotId: undefined,
    categoryProperties: undefined,
    // ... any other required properties
  } 
  // as T;

  // Create metadata
  const baseMeta: Meta = {
    createdAt: new Date(),
    updatedAt: new Date(),
    version: 1,
    // Add other metadata properties as needed
  } as Meta;

  // Use createCompleteSnapshot to create a proper snapshot
  const snapshotPromise = createSnapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(
    baseCalendarData,
    new Map(), // baseMeta map (empty for now)
    "snapshot-id", // provide a proper ID
    undefined, // category
    null, // snapshotStore
    null, // snapshotManager
    null, // snapshotStoreConfig
    false, // isSubscribed
    {
      prefix: "then",
      name: "callback-snapshot",
      type: "temporary"
    } // storeProps
  );

  // Handle the promise and call the callback
  snapshotPromise.then(snapshot => {
    if (typeof callback === 'function') {
      callback(snapshot);
    }
    return snapshot;
  });

  // Return a temporary snapshot that will be replaced by the real one
  const temporarySnapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
    id: "temp",
    data: baseData,
    metadata: baseMeta,
    // Add minimal required properties
    onInitialize: () => {},
    taskIdToAssign: undefined,
    schema: {},
    currentCategory: undefined,
    deleted: false,
    status: StatusType.Active,
    meta: {} as StructuredMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    state: {} as any,
    dataStores: [],
    auditRecords: {} as any,
    subscribed: false,
    version: '1.0',
    initialState: {},
    isCore: false,
    initialConfig: {},
    // Calendar properties (these should really be in data, not on the snapshot itself)
    description: "This is a sample event",
    // ... other calendar properties if they must be on the snapshot
  };

  return temporarySnapshot;
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
  filters: [], 
  sort: [], 
  date : new Date("2025-12-25"),
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

