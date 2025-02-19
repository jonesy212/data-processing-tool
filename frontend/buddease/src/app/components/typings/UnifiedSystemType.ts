import { 
  ActivityActionEnum,
  ActivityTypeEnum, BookmarkStatus,
  BorderStyle,
  CalendarStatus, CalendarViewType, ChatType,
  CollaborationOptionType,
  ComponentStatus,
  DataStatus, DocumentPhaseEnum, DocumentSize,
  IncludeType,
  Layout, NotificationPosition, NotificationStatus,
  Orientation,
  OutcomeType,
  PrivacySettingEnum, ProductStatus, ProjectStateEnum, SortingType,
  StatusType, SubscriberTypeEnum, SubscriptionTypeEnum, TaskStatus, TeamStatus,
  TodoStatus, MeetingStatus
 } from "../models/data/StatusType";
import { TodoType, TaskType } from "../typings";



export type UnifiedSystemType = {
    // Primary Types
    calendarEventType: CalendarEventType[];
    todoType: TodoType[];
    taskType: TaskType[];
    snapshotStoreType: SnapshotStoreType<CalendarEventType | TodoType | TaskType>;
  
    // Enum Types
    activityActionType?: ActivityActionEnum;
    activityTypeType?: ActivityTypeEnum;
    bookmarkStatusType?: BookmarkStatus;
    borderStyleType?: BorderStyle;
    calendarStatusType?: CalendarStatus;
    calendarViewTypeType?: CalendarViewType;
    chatTypeType?: ChatType;
    collaborationOptionTypeType?: CollaborationOptionType;
    componentStatusType?: ComponentStatus;
    dataStatusType?: DataStatus;
    documentPhaseType?: DocumentPhaseEnum;
    documentSizeType?: DocumentSize;
    documentStatusType?: DocumentStatusEnum;
    documentTypeType?: DocumentTypeEnum;
    includeTypeType?: IncludeType;
    layoutType?: Layout;
    notificationPositionType?: NotificationPosition;
    notificationStatusType?: NotificationStatus;
    orientationType?: Orientation;
    outcomeTypeType?: OutcomeType;
    privacySettingType?: PrivacySettingEnum;
    productStatusType?: ProductStatus;
    projectStateType?: ProjectStateEnum;
    sortingTypeType?: SortingType;
    statusTypeType?: StatusType;
    subscriberTypeType?: SubscriberTypeEnum;
    subscriptionTypeType?: SubscriptionTypeEnum;
    taskStatusType?: TaskStatus;
    teamStatusType?: TeamStatus;
    todoStatusType?: TodoStatus;
    meetingStatusType?: MeetingStatus;
  };
  
// Example usage
const unifiedSystem: UnifiedSystemType = {
  calendarEvents: [],
  todos: [],
  tasks: [],
  snapshotStore: {
    id: 'snapshot-123',
    name: 'UnifiedSnapshotStore',
    data: [],
    createdAt: new Date(),
  },
};

console.log(unifiedSystem);
