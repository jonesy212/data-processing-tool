import { fetchUserAreaDimensions, UnifiedMetaDataOptions } from "@/app/configs/database/MetaDataOptions";
import { StructuredMetadata } from "@/app/configs/StructuredMetadata";
import { useMetadata } from "@/app/configs/useMetadata";
import userSettings from "@/app/configs/UserSettings";
import { Message } from "@/app/generators/GenerateChatInterfaces";
import { Persona } from "@/app/pages/personas/Persona";
import PersonaTypeEnum from "@/app/pages/personas/PersonaBuilder";
import { CategoryProperties } from "@/app/pages/personas/ScenarioBuilder";
import { AxiosResponse } from "axios";
import React from "react";
import { CustomTransaction } from "../../crypto/SmartContractInteraction";
import { Attachment } from "../../documents/Attachment/attachment";
import { createCustomTransaction } from "../../hooks/dynamicHooks/createCustomTransaction";
import { FakeData } from "../../intelligence/FakeDataGenerator";
import { CollaborationOptions } from "../../interfaces/options/CollaborationOptions";
import { Category } from "../../libraries/categories/generateCategoryProperties";
import { Label } from "../../projects/branding/BrandingSettings";
import { AnalysisTypeEnum } from "../../projects/DataAnalysisPhase/AnalysisType";
import { DataAnalysisResult } from "../../projects/DataAnalysisPhase/DataAnalysisResult";
import { EventManager, InitializedState } from "../../projects/DataAnalysisPhase/DataProcessing/DataStore";
import { Snapshot, Snapshots, SnapshotsArray } from "../../snapshots/LocalStorageSnapshotStore";
import SnapshotStore, {  SnapshotStoreReference} from "../../snapshots/SnapshotStore";
import {
  SnapshotWithCriteria,
  TagsRecord,
} from "../../snapshots/SnapshotWithCriteria";
import { ExtendedTodo } from "../../state/AssignBaseStore";
import { CustomComment } from "../../state/redux/slices/BlogSlice";
import { Stroke } from "../../state/redux/slices/DrawingSlice";
import { ReassignEventResponse } from "../../state/stores/AssignEventStore";
import { AuthStore } from "../../state/stores/AuthStore";
import BrowserCheckStore from "../../state/stores/BrowserCheckStore";
import { AllStatus, DetailsItem } from "../../state/stores/DetailsListStore";
import { HighlightColor } from '../../styling/Palette';
import { NotificationSettings } from "../../support/NotificationSettings";
import { taskService } from "../../tasks/TaskService";
import TodoImpl, { Todo, UserAssignee } from "../../todos/Todo";
import { AllTypes } from "../../typings/PropTypes";
import { Idea } from "../../users/Ideas";
import { User } from "../../users/User";
import UserRoles from "../../users/UserRoles";
import { cleanEmptyStrings } from "../../utils/cleanEmptyStrings";
import { version } from "../../versions/Version";
import { VideoData } from "../../video/Video";
import CommonDetails, { CommonData } from "../CommonData";
import { Phase, PhaseData, PhaseData } from '@/app/components/phases/Phase';
import { Task } from "../tasks/Task";
import { Team } from "../teams/Team";
import { Collaborator, Member } from "../teams/TeamMembers";
import { TrackerProps } from "../tracker/Tracker";
import { Comment } from "./Comments";
import { K, Meta, T } from "./dataStoreMethods";
import FileData from "./FileData";
import {
  PriorityTypeEnum,
  ProjectPhaseTypeEnum,
  StatusType,
  SubscriptionTypeEnum,
} from "./StatusType";
import { useMeta } from "@/app/configs/useMeta";
import { SnapshotStoreConfig } from '@/app/components/snapshots/SnapshotStoreConfig';
import { ScheduledData } from "../../calendar/ScheduledData";

interface SharedBaseData<K> {
  childIds?: K[] | undefined;
  relatedData?: K[] | undefined,
}

interface SharedPhaseData {
  phase: Phase<any, any> | null;
  priority: PriorityTypeEnum
}


type DataWithOmittedFields<
  T extends BaseData<any, any, StructuredMetadata<any, any>, Attachment>,
  K extends T = T,
  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>,
  ExcludedFields extends keyof T = never
> = Omit<Data<T, K, Meta>, ExcludedFields>;

// Define the interface for DataDetails
interface DataDetails<
  T extends  BaseData<any>,
  K extends T = T,
  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>,
  ExcludedFields extends keyof T = never
> extends CommonData<T> {
  _id?: string;
  title?: string;
  description?: string | null;
  details?: DetailsItem<T>;
  completed?: boolean | undefined;
  startDate?: string | Date;
  endDate?: string | Date;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  type?: AllTypes;
  tags?: TagsRecord<T, K> | string[] | undefined; 
  isActive?: boolean;
  status?: AllStatus | null;
  uploadedAt?: Date | undefined; //
  phase?: Phase<PhaseData<BaseData<any>>, K> | null;
  fakeData?: FakeData;
  comments?: number | (Comment<T, K, Meta> | CustomComment)[] | undefined;
  todos?: Todo<T, K>[];
  analysisData?: {
    snapshots?: SnapshotStore<T, K>[];
    analysisResults?: DataAnalysisResult<T>[];
  };

  data?: DataWithOmittedFields<T, K, Meta, ExcludedFields>;
  snapshots?: Snapshots<T, K>;
  snapshotArray?: SnapshotsArray<T, K, Meta>;
  analysisType?: AnalysisTypeEnum | null;
  analysisResults?: string | DataAnalysisResult<T>[] | undefined;
  todo?: Todo<T, K>;
  // Add other properties as needed
}

// Define the props for the DataDetails component
interface DataDetailsProps<T> {
  data: T;
}

type CommonRelationship<T extends BaseData<any, any> = any,
K extends T = T> = {
  childIds?: K[] | undefined,
  relatedData?: K[],
}

type TodoSubtasks = Array<
  | Todo<BaseData<any>, BaseData<any>, StructuredMetadata<BaseData<any>, BaseData<any>>>
  | Task<any, any>
  >;

  
interface BaseData<
  T extends BaseData<any, any> = any,
  K extends T = T,
  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>,
  AttachmentType extends Attachment = Attachment
> extends SharedBaseData<K>{
  childIds?: Meta['childIds'];
  _id?: string;
  id?: string | number | undefined;
  type?: AllTypes;
  title?: string;
  data?: any;
  size?: number;
  description?: string | null;
  startDate?: Date;
  label?: string | Label | null;
  endDate?: Date;
  scheduled?: ScheduledData<T>;
  isScheduled?: boolean;
  status?: AllStatus | null;
  timestamp?: string | number | Date | undefined;
  isActive?: boolean;
  tags?: TagsRecord<T, K> | string[] | undefined; // Update as needed based on your schema
  phase?: Phase<PhaseData<BaseData<any>>, K> | null;
  phaseType?: ProjectPhaseTypeEnum;
  key?: string;
  value?: number | string | Snapshot<T, K, Meta> | null;
  initialState?: InitializedState<T, K>;
  dueDate?: Date | null;
  priority?: string | AllStatus | null;
  assignee?: UserAssignee | null;
  collaborators?: Collaborator[];
  comments?: number | (Comment<T, K, Meta> | CustomComment)[] | undefined;
  attachments?: AttachmentType[];
  subtasks?: TodoImpl<T, K>[];
  createdAt?: string | Date | undefined;
  updatedAt?: string | Date | undefined;
  createdBy?: string | undefined;
  updatedBy?: string;
  updatedDetails?: DetailsItem<T>;
  isArchived?: boolean;
  isCompleted?: boolean;
  isBeingEdited?: boolean;
  isBeingDeleted?: boolean;
  isBeingCompleted?: boolean;
  isBeingReassigned?: boolean;
  analysisType?: AnalysisTypeEnum | null;
  analysisResults?: DataAnalysisResult<T>[] | string;

  audioUrl?: string;
  videoUrl?: string;
  videoThumbnail?: string;
  videoDuration?: number;
  collaborationOptions?: CollaborationOptions[]; // Or whatever type is appropriate
  videoData?: VideoData<T, K>;
  additionalData?: any;
  ideas?: Idea[];
  members?: number[] | string[] | Member[];
  leader?: User | null;
  snapshotStores?: SnapshotStoreReference<T, K>[];
  snapshots?: Snapshots<BaseData<T, K>>;
  text?: string;
  category?: symbol | string | Category | undefined;

  notificationTypes?: NotificationSettings;
  categoryProperties?: CategoryProperties;
  [key: string]: any;
  // getData?: (id: number) => Promise<Snapshot<
  //   SnapshotWithCriteria<Data<T>>,
  //   SnapshotWithCriteria<Data<T>>>>;

  // // Implement the `then` function using the reusable function
  // then?: <T extends  BaseData<any>, K extends Data<T>>(callback: (newData: Snapshot<BaseData, K>) => void) => Snapshot<Data, K> | undefined;
}

interface Data<
  T extends BaseData<any> = BaseData<any, any>,
  K extends T = T,
  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>,
> extends BaseData<any> {
  category?: symbol | string | Category | undefined;
  categoryProperties?: CategoryProperties;
  subtasks?: TodoImpl<any, any>[];
  actions?: SnapshotStoreConfig<T, K>[];
  snapshotWithCriteria?: SnapshotWithCriteria<T, K>;
  value?: any;
  label?: any;
  metadata?: UnifiedMetaDataOptions<T, K, StructuredMetadata<T, K>, keyof T> | {};
  major?: number;
  minor?: number;
  patch?: number;
  [key: string]: any;
}


// Define the UserDetails component
const DataDetailsComponent: React.FC<DataDetailsProps<T>> = ({ data }) => {
  
  const getTagNames = (tags: TagsRecord<T, K<T>> | string[]): string[] => {
    if (Array.isArray(tags)) {
      return tags; // If it's an array, return it directly
    }
    return Object.values(tags).map((tag) => tag.name); // If it's a TagsRecord
  };

  return (
    <CommonDetails
      data={{
        id: data.id ? data.id.toString() : "",
        title: "Data Details",
        description: "Data descriptions",
        details: data.details,
        completed: !!data.completed,
        label: typeof data.label === 'string' ? { text: data.label, color: "" } : (data.label || { text: "", color: "" }),
        currentMetadata: data.currentMetadata,
        date: data.date,
        createdBy: data.createdBy,
        currentMeta: data.currentMeta,
    
      }}
      details={{
        _id: data._id,
        id: data.id ? data.id.toString() : "",
        title: data.title,
        createdBy: data.createdBy,
        description: data.description,
        phase: data.phase,
        isActive: data.isActive,
        tags: data.tags ? getTagNames(data.tags) : [], // Now tags is a string array
        status: data.status,
        type: data.type,
        analysisType: data.analysisType,
        analysisResults: data.analysisResults,
        updatedAt: data.updatedAt ? new Date(data.updatedAt) : new Date(),
        currentMetadata: data.currentMetadata,
        currentMeta: data.currentMeta,
      }}
    />
  );
};



const area = fetchUserAreaDimensions().toString()
const currentMetadata: UnifiedMetaDataOptions<T, K<T>> = useMetadata<T, K<T>>(area)
const currentMeta: StructuredMetadata<T, K<T>> = useMeta<T, K<T>>(area)

const coreData: Data<BaseData, K<BaseData>, StructuredMetadata<BaseData>> = {
  _id: "1",
  id: "data1",
  title: "Sample Data",
  description: "Sample description",
  timestamp: new Date(),
  category: "Sample category",
  startDate: new Date(),
  endDate: new Date(),
  isScheduled: true,
  scheduled: {
    scheduledDate: new Date(),
    createdBy: "user1",
  },
  status: StatusType.Pending,
  isActive: true,
  tags: {
    tag1: {
      id: "tag1",
      name: "Tag 1",
      color: "#000000",
      description: "Tag 1 description",
      enabled: true,
      type: "Category",
      relatedTags: [], // This should match the type defined in Tag
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: "creator1",
      timestamp: new Date().getTime(),
    },
  },
  phase: {
    label: {
      text: "",
      color: "",
    },
    currentMetadata: currentMetadata,
    currentMeta: currentMeta,
    date: "",
    id: "phase1",
    name: "Phase 1",
    description: "Phase 1 description",
    startDate: new Date(),
    endDate: new Date(),
    status: "Active",
    isActive: true,
    tags: {
      tag1: {
        id: "tag1",
        name: "Tag 1",
        color: "#000000",
        description: "Tag 1 description",
        enabled: true,
        type: "Category",
        relatedTags: [], // This should match the type defined in Tag
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: "creator1",
        timestamp: new Date().getTime(),
      },
    }, // This should match the type defined in Tag
    subPhases: [],
    createdBy: "creator1",
  },
  phaseType: ProjectPhaseTypeEnum.Ideation,
  dueDate: new Date(),
  priority: "High",
  assignee: {
    id: "assignee1",
    username: "Assignee Name",
    firstName: "",
    lastName: "",
    email: "",
    tier: "",
  } as unknown as User,



  collaborators: ["collab1", "collab2"],
  comments: [],
  attachments: [],
  subtasks: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  createdBy: "creator1",
  updatedBy: "updater1",
  analysisResults: [],
  audioUrl: "sample-audio-url",
  videoUrl: "https://example.com/sample-video-url",
  videoThumbnail: "https://example.com/sample-thumbnail-url",
  videoDuration: 60,
  collaborationOptions: [],
  videoData: {
    label: {
      text: '',
      color: ''
    },
    date: new Date(),
    id: "video1",
    campaignId: 123,
    resolution: "1080p",
    size: "100MB",
    aspectRatio: "16:9",
    language: "en",
    subtitles: [],
    duration: 60,
    codec: "H.264",
    frameRate: 30,
    url: "https://example.com/sample-video-url",
    thumbnailUrl: "https://example.com/sample-thumbnail-url",
    uploadedBy: "uploader1",
    viewsCount: 1000,
    likesCount: 100,
    dislikesCount: 10,
    commentsCount: 20,
    title: "Sample Video Title",
    description: "Sample video description",
    tags: {
      tag1: {
        id: "tag1",
        name: "Tag 1",
        color: "#000000",
        description: "Tag 1 description",
        enabled: true,
        type: "Category",
        relatedTags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: "creator1",
        timestamp: new Date().getTime(),
      },
    },
    createdBy: "uploader1",
    createdAt: new Date(),
    uploadedAt: new Date(),
    updatedAt: new Date(),
    videoDislikes: 10,
    videoAuthor: "Author Name",
    videoDurationInSeconds: 60,
    uploadDate: new Date(),
    videoLikes: 100,
    videoViews: 1000,
    videoComments: 20,
    videoThumbnail: "https://example.com/sample-thumbnail-url",
    videoUrl: "https://example.com/sample-video-url",
    videoTitle: "Sample Video Title",
    videoDescription: "Sample video description",
    videoTags: ["sample", "video"],
    videoSubtitles: [],
    category: "Sample Category",
    closedCaptions: [],
    license: "Sample License",
    isLive: false,
    isPrivate: false,
    isUnlisted: false,
    isProcessingCompleted: true,
    isProcessingFailed: false,
    isProcessingStarted: false,
    channel: "Sample Channel",
    channelId: "channel123",
    isLicensedContent: true,
    isFamilyFriendly: true,
    isEmbeddable: true,
    isDownloadable: true,
    playlists: ["playlist1", "playlist2"],
    thumbnail: "https://example.com/sample-thumbnail-url",
    isProcessing: false,
    isCompleted: true,
    isUploading: false,
    isDownloading: false,
    isDeleting: false,
    video: {
      id: "video1",
      title: "Sample Video Title",
      description: "Sample video description",
      url: "https://example.com/sample-video-url",
      thumbnailUrl: "https://example.com/sample-thumbnail-url",
      duration: 60,
      createdAt: new Date(),
      updatedAt: new Date(),
      category: "Sample Category",
    },
    currentMetadata: currentMetadata,
    currentMeta: currentMeta, 
  }, additionalData: {},  ideas: [],
  members: [],
  leader: {
    id: "leader1",
    roles: [],
    storeId: 0,
    username: "Leader Name",
    email: "leader@example.com",
    fullName: "Leader Full Name",
    bio: "Leader Bio",
    userType: "Admin",
    hasQuota: true,
    tier: "0",
    token: "leader-token",
    uploadQuota: 100,
    usedQuota: 50,
    avatarUrl: "avatar-url",
    createdAt: new Date(),
    updatedAt: new Date(),
    isVerified: false,
    isAdmin: false,
    isActive: true,
    profilePicture: null,
    processingTasks: [],
    role: UserRoles.TeamLeader,
    firstName: "",
    lastName: "",
    friends: [],
    blockedUsers: [],
    persona: new Persona(PersonaTypeEnum.Default),
    followers: [],
    activityStatus: "Active",
    isAuthorized: false,

    preferences: {
      id: "",
      name: "",
      phases: [],
      trackFileChanges: (file: FileData<T>): FileData<T> => {
        return {
          id: file.id,
          title: file.title,
          description: file.description,
          
          fileName: file.fileName,
          fileSize: file.fileSize,
          fileType: file.fileType,
          filePath: file.filePath,
          uploader: file.uploader,
          uploadDate: file.uploadDate,
          scheduledDate: file.scheduledDate,
          createdBy: file.createdBy,
          childIds: file.childIds,
          relatedData: file.relatedData,
          major:  file.major,
          minor:  file.minor,
          patch:  file.patch,
        };
      },
      stroke: {
        width: 0,
        color: "black",
      },
      strokeWidth: 0,
      fillColor: "",
      isFlippedX: false,
      isFlippedY: false,
      x: 0,
      y: 0,
      // Update the method signature to match the expected type
      updateAppearance: (
        newStroke: { width: number; color: string; },
        newFillColor: string,
        updates: {
          stroke?: Stroke;
          fillColor?: string;
          borderColor?: string;
          textColor?: string;
          highlightColor?: HighlightColor;
          backgroundColor?: string;
          fontSize?: string;
          fontFamily?: string;
        },
        newBorderColor?: string, // Optional new border color
        newHighlightColor?: string
      ) => {
        // Implement your logic here
        // Example implementation (adjust as necessary):
        (this as typeof coreData.preferences).stroke = newStroke;
        (this as typeof coreData.preferences).fillColor = newFillColor;
      },
      refreshUI: () => { },
    },

    settings: {
      ...userSettings,
      calendarEvents: [],
      todos: [],
      tasks: [],
      snapshotStores: [],

      currentPhase: {
        id: "",
        name: "",
        description: "",
        startDate: new Date(),
        endDate: new Date(),
        subPhases: []
      },
      comment: "",
      browserCheckStore: {} as BrowserCheckStore,
      trackerStore: {
        trackers: {},
        addTracker: (newTracker: TrackerProps) => { },
        getTracker: (id: string): TrackerProps => {
          // Ensure you return a valid TrackerProps object
          const tracker = coreData.settings.trackerStore.trackers[id];
          if (!tracker) {
            throw new Error(`Tracker with id ${id} not found.`);
          }
          return tracker; // Return the tracker found
        },
        getTrackers: (filter?: { id?: string | undefined; name?: string | undefined; } | undefined) => [],

        removeTracker: (trackerToRemove: TrackerProps) => { },
        dispatch: (action: any) => { },
      },

      todoStore: {
        dispatch: (action: any) => { },
        todos: {},
        todoList: [],
        toggleTodo: (id: string) => { },

        assignedTaskStore: "",
        updateTaskTitle: "",
        updateTaskDescription: "",
        updateTaskStatus: "",
      },
      taskManagerStore: {
        tasks: {},
        taskTitle: "",
        taskDescription: "",
        taskStatus: {},


        fetchTasksSuccess: (payload: { tasks: Task<T, K<T>>[]; }) => { },
        fetchTasksFailure: (payload: { error: string; }) => { },
        fetchTasksRequest: () => { },
        completeAllTasksSuccess: (success: string) => { },

        completeAllTasks: (payload: { task: Task<T, K<T>>[]; }) => { },
        completeAllTasksFailure: (payload: { error: string; }) => { },
        NOTIFICATION_MESSAGE: "",
        NOTIFICATION_MESSAGES: {},

        setDynamicNotificationMessage: (message: string) => { },
        takeTaskSnapshot: (taskId: string) => { },
        markTaskAsComplete: (taskId: string) => { },
        updateTaskPositionSuccess: (payload: { task: Task<T, K<T>>; }) => { },

        batchFetchTaskSnapshotsRequest: (snapshotData: Record<string, Task<T, K<T>>[]>) => { },
        batchFetchTaskSnapshotsSuccess: (taskId: Record<string, Task<T, K<T>>[]>) => { },
        batchFetchUserSnapshotsRequest: (snapshotData: Record<string, User[]>) => { },


        assignedTaskStore: {
          snapshotStore: undefined,
          assignedUsers: {},
          assignedItems: {},
          assignedTodos: {},
          assignedTasks: {},
          assignedTeams: {},
          events: {},
          assignItem: {},
          assignUser: {},
          assignTeam: {},
          unassignUser: {},
          reassignUser: {},
          assignUsersToItems: {},
          unassignUsersFromItems: {},
          assignNote: {},
          reassignUsersToItems: {},
          assignTeamsToTodos: {},
          unassignTeamsFromTodos: {},
          assignNoteToTeam: {},
          assignFileToTeam: {},
          assignContactToTeam: {},
          assignEventToTeam: {},
          assignGoalToTeam: {},
          assignBookmarkToTeam: {},
          assignCalendarEventToTeam: {},
          assignBoardItemToTeam: {},
          assignBoardColumnToTeam: {},
          assignBoardListToTeam: {},
          assignBoardCardToTeam: {},
          assignBoardViewToTeam: {},
          assignBoardCommentToTeam: {},
          assignBoardActivityToTeam: {},
          assignBoardLabelToTeam: {},
          assignBoardMemberToTeam: {},
          assignBoardSettingToTeam: {},
          assignBoardPermissionToTeam: {},
          assignBoardNotificationToTeam: {},
          assignBoardIntegrationToTeam: {},
          assignBoardAutomationToTeam: {},
          assignBoardCustomFieldToTeam: {},

          assignTask: (task: Task<T, K<T>, StructuredMetadata<T, K<T>>>) => {
            // Logic to assign a task
          },
          assignUsersToTasks: (taskId: string, userIds: string[]) => {
            // Logic to assign users
          },
          unassignUsersFromTasks: (taskId: string, userIds: string[]) => {
            // Logic to unassign users
          },
          setDynamicNotificationMessage: (message: Message) => {
            // Logic to set notification message
          },

          reassignUsersToTasks: function (taskIds: string[], oldUserId: string, newUserId: string): void {
            throw new Error("Function not implemented.");
          },
          assignUserToTodo: function (todoId: string, userId: string): void {
            throw new Error("Function not implemented.");
          },
          unassignUserFromTodo: function (todoId: string, userId: string): void {
            throw new Error("Function not implemented.");
          },
          reassignUserInTodo: function (todoId: string, oldUserId: string, newUserId: string): void {
            throw new Error("Function not implemented.");
          },
          assignUsersToTodos: function (todoIds: string[], userId: string): void {
            throw new Error("Function not implemented.");
          },
          unassignUsersFromTodos: function (todoIds: string[], userId: string): void {
            throw new Error("Function not implemented.");
          },
          reassignUsersInTodos: function (todoIds: string[], oldUserId: string, newUserId: string): void {
            throw new Error("Function not implemented.");
          },
          assignUserSuccess: function (): void {
            throw new Error("Function not implemented.");
          },
          assignUserFailure: function (error: string): void {
            throw new Error("Function not implemented.");
          },

          assignMeetingToTeam: function (meetingId: string, teamId: string): Promise<AxiosResponse> {
            throw new Error("Function not implemented.");
          },
          assignProjectToTeam: function (projectId: string, teamId: string): Promise<AxiosResponse> {
            throw new Error("Function not implemented.");
          },
          connectResponsesToTodos: function (todoIds: string[], assignees: string[], todos: ExtendedTodo[], eventId: string, responses: ReassignEventResponse[]): void {
            throw new Error("Function not implemented.");
          },
          reassignTeamsInTodos: function (todoIds: string[], oldTeamId: string, newTeamId: string): Promise<AxiosResponse> {
            throw new Error("Function not implemented.");
          },

          assignTaskToTeam: function (taskId: string, userId: string): Promise<void> {
            throw new Error("Function not implemented.");
          },
          assignTodoToTeam: function (todoId: string, teamId: string): Promise<void> {
            throw new Error("Function not implemented.");
          },
          assignTodosToUsersOrTeams: function (todoIds: string[], assignees: string[]): Promise<void> {
            throw new Error("Function not implemented.");
          },
          assignTeamMemberToTeam: function (teamId: string, userId: string): void {
            throw new Error("Function not implemented.");
          },
          unassignTeamMemberFromItem: function (itemId: string, userId: string): void {
            throw new Error("Function not implemented.");
          },
          getAuthStore: function (): AuthStore {
            throw new Error("Function not implemented.");
          },
          assignTeamToTodo: function (todoId: string, teamId: string): void {
            throw new Error("Function not implemented.");
          },
          unassignTeamToTodo: function (todoId: string, teamId: string): void {
            throw new Error("Function not implemented.");
          },
          reassignTeamToTodo: function (todoId: string, oldTeamId: string, newTeamId: string): void {
            throw new Error("Function not implemented.");
          },
          assignTeamToTodos: function (todoIds: Team[], teamId: string): void {
            throw new Error("Function not implemented.");
          },
          unassignTeamFromTodos: function (todoIds: string[], teamId: string): void {
            throw new Error("Function not implemented.");
          },
          reassignTeamToTodos: function (teamIds: string[], teamId: string, newTeamId: string): void {
            throw new Error("Function not implemented.");
          },
          unassignNoteFromTeam: function (noteId: string, teamId: string): Promise<void> {
            throw new Error("Function not implemented.");
          },
          setAssignedTaskStore: function (store: SnapshotStore<Snapshot<BaseData<any>, BaseData<any>>>
          ): void {
            throw new Error("Function not implemented.");
          }
        },
        updateTaskTitle: (title: string, taskId: string) => { },
        updateTaskDescription: (description: string, taskId: string) => { },
        updateTaskStatus: (description: string, taskId: string) => { },

        updateTaskDueDate: (taskId: string, dueDate: Date) => { },
        updateTaskPriority: (taskId: string, priority: PriorityTypeEnum) => { },
        filterTasksByStatus: (status: AllStatus): Task<T, K<T>>[] => {
          // Implement logic to filter tasks by their status
          return coreData.tasks.filter((task: Task<T, K<T>>) => task.status === status);
        },

        getTaskCountByStatus: (status: AllStatus): number => {
          // Implement logic to count tasks by status
          return coreData.tasks.filter((task: Task<T, K<T>>) => task.status === status).length;
        },

        clearAllTasks: () => { },
        archiveCompletedTasks: () => { },
        updateTaskAssignee: (taskId: string, assignee: User) => async (dispatch: any): Promise<void> => {
          // Implement logic to update the assignee of a task
          const taskIndex = coreData.tasks.findIndex((task: Task<T, K<T>>) => task._id === taskId);
          if (taskIndex !== -1) {
            coreData.tasks[taskIndex].assignee = assignee;
            // Dispatch an action to update the state (assuming Redux or similar)
            dispatch({ type: 'UPDATE_TASK_ASSIGNEE', payload: { taskId, assignee } });
          }
        },

        getTasksByAssignee: async (tasks: Task<T, K<T>>[], assignee: User): Promise<Task<T, K<T>>[]> => {
          // Implement logic to get tasks assigned to a specific user
          return tasks.filter(task => task.assigneeId === assignee._id);
        },


        getTaskById: (taskId: string): Task<T, K<T>> | null => {
          // Implement logic to find a task by its ID
          return coreData.tasks.find((task: Task<T, K<T>>) => task._id === taskId) || null;
        },


        sortByDueDate: () => { },
        exportTasksToCSV: () => { },
        dispatch: (action: any) => { },
        addTaskSuccess: (payload: { task: Task<T, K<T>>; }) => { },
        addTask: (task: Task<T, K<T>>) => { },
        addTasks: (tasks: Task<T, K<T>>[]) => { },
        assignTaskToUser: (taskId: string, userId: string) => { },

        removeTask: (taskId: string) => { },
        removeTasks: (taskIds: string[]) => { },
        fetchTasksByTaskId: async (taskId: string): Promise<Task<T, K<T>> | null> => {
          try {
            const response = await taskService.getTaskById(taskId);
            if (response?.data) {
              return response.data as Task<T, K<T>>; // Cast to the expected type
            }
            throw new Error("No task data found");
          } catch (error) {
            console.error("Failed to fetch task", error);
            throw new Error("Failed to fetch task");
          }
        }
      }
      // fetchTasksSuccess: (payload: { tasks: Task[]; }) => { },
      // fetchTasksFailure: (payload: { error: string; }) => {},
      // fetchTasksRequest: () => {},
      // completeAllTasksSuccess: (success: string) => {},
      // completeAllTasks: (payload: { task: Task[]; }) =>  {},
      // completeAllTasksFailure: (payload: { error: string; }) => {},
      // NOTIFICATION_MESSAGE: "",
      // NOTIFICATION_MESSAGES: {},
      // setDynamicNotificationMessage: (message: string) => {},
      // takeTaskSnapshot: (taskId: string) => {},
      // markTaskAsComplete: (taskId: string) => {},
      // updateTaskPositionSuccess: (payload: { task: Task; }) => {},
      // batchFetchTaskSnapshotsRequest: (snapshotData: Record<string, Task[]>) => {},
    },

    // iconStore: {
    //   dispatch: "",
    // },
    // calendarStore: {
    //   openScheduleEventModal: "",
    //   openCalendarSettingsPage: "",
    //   getData: async (): Promise<SnapshotStore<T, K>[]> => {
    //     // Implement logic to get the data
    //     try {
    //       // Fetch or generate data for SnapshotStore instances
    //       const snapshotStores = await snapshotApi.getSnapshotStores();
    //       // someDataFetchingFunction();
    //       return snapshotStores;
    //     } catch (error) {
    //       console.error("Failed to get data", error);
    //       return [];
    //     }
    //   },
    //   // updateDocumentReleaseStatus: "",
    //   // getState: "",
    //   // action: "",
    //   // events: "",
    //   // eventTitle: "",
    //   // eventDescription: "",
    //   // eventStatus: "",
    //   // assignedEventStore: "",
    //   // snapshotStore: "",
    // },
    // enableGroupManagement: true,
    // enableTeamManagement: false,
    // idleTimeout: undefined,
    bannerUrl: "",
    interests: [],
    privacySettings: {
      isDataSharingEnabled: true,
      dataSharing: {
        sharingLevel: "", // 'public', 'private', etc.
        sharingScope: "", // 'team', 'organization', 'all', etc.
        sharingFrequency: "", // e.g., 'daily', 'weekly'
        sharingDuration: "", // e.g., '30 days'
        sharingPermissions: [], // e.g., 'read', 'write', 'delete'
        sharingAccess: "", // e.g., 'public', 'private'
        sharingLocation: "", // e.g., 'global', 'local'
        sharingTags: [], // Optional: tags for categorization
        sharingGroups: [], // Optional: specify groups involved
        sharingUsers: [], // Optional: specify individual users
        allowSharing: false,
        allowSharingWith: [], // Users, groups, or teams allowed to share with
        allowSharingWithTeams: [], // Teams allowed for sharing
        allowSharingWithGroups: [], // Groups allowed for sharing
        allowSharingWithPublic: false, // Allows sharing with the public
        allowSharingWithTeamsAndGroups: false, // Allows sharing with both teams and groups
        isAllowingSharingWithPublic: [],
        isAllowingingSharingWithTeamsAndGroups: [],
        isAllowingSharingWithPublicAndTeamsAndGroups: [],
        isAllowingingSharingWithPublicAndTeams: [],
        isAllowingSharingWithPublicAndTeamsAndGroupsAndPublic: [],
        isAllowingSharingWithPublicAndTeamsAndGroupsAndPublicAndTeamsAndGroups: [],
        isAllowingSharingWithTeamsAndGroups: [],
        isAllowingSharingingWithPublicAndTeamsAndGroups: [],
        isAllowingSharingWithPublicAndTeams: [],
        enableDatabaseEncryption: false,
        sharingOptions: [], // Define additional sharing options if needed
        sharingPreferences: {
          email: false,
          push: false,
          sms: false,
          chat: false,
          calendar: false,
          audioCall: false,
          videoCall: false,
          fileSharing: false,
          blockchainCommunication: false,
          decentralizedStorage: false,
          databaseEncryption: false,
          databaseVersion: '',
          appVersion: '',
          enableDatabaseEncryption: false
        }, // Add the corresponding sharing preferences
        allowSharingWithPublicAndTeams: false,
        allowSharingWithPublicAndGroups: false,
        allowSharingWithPublicAndTeamsAndGroups: false,
        allowSharingWithPublicAndTeamsAndGroupsAndPublic: false,
        allowSharingWithPublicAndTeamsAndGroupsAndPublicAndTeamsAndGroups: false,
      },
      thirdPartyTracking: true,
    },
    notifications: {
      channels: {
        email: false,
        push: false,
        sms: false,
        chat: false,
        calendar: false,
        audioCall: false,
        videoCall: false,
        screenShare: false,
      },
      types: {
        mention: false,
        reaction: false,
        follow: false,
        poke: false,
        activity: false,
        thread: false,
        inviteAccepted: false,
        task: false,
        file: false,
        meeting: false,
        directMessage: false,
        announcement: false,
        reminder: false,
        project: false,
        inApp: false,
        // Add additional properties if they are not included in the NotificationTypes interface
        comment: false,
        like: false,
        dislike: false,
        bookmark: false,
      },
      enabled: true,
      notificationType: "all"
    },
    activityLog: [],
    socialLinks: {},
    relationshipStatus: "",

    hobbies: ["Reading", "Traveling"],
    skills: ["Project Management", "Software Development"],
    achievements: ["Completed 100 projects", "Employee of the Month"],
    profileVisibility: "Public",
    profileAccessControl: {
      friendsOnly: true,
      allowTagging: true,
      blockList: [],
      allowMessagesFromNonContacts: true,
      shareProfileWithSearchEngines: false,
      isPrivate: true,
      isPrivateOnly: false,
      isPrivateOnlyForContacts: false,
      isPrivateOnlyForGroups: false,
      allowMessagesFromFriendContacts: false,
      activityStatus: "active",
      isAuthorized: false,
    },
    currentMetadata: {
      area: 'coreData', 
      currentMeta: currentMeta,
      metadataEntries: {},
    },
    currentMeta: currentMeta,
    // startIdleTimeout: (timeoutDuration: number, onTimeout: () => void) => {},
    // idleTimeoutDuration: 300,
    // activePhase: "development",
    // realTimeChatEnabled: true,
    // todoManagementEnabled: false,
    // notificationEmailEnabled: true,
    // analyticsEnabled: true,
    // twoFactorAuthenticationEnabled: true,
    // projectManagementEnabled: true,
    // documentationSystemEnabled: false,
    // versionControlEnabled: true,
    // userProfilesEnabled: true,
    // accessControlEnabled: true,
    // taskManagementEnabled: true,
    // loggingAndNotificationsEnabled: true,
    // securityFeaturesEnabled: true,
    // theme: ThemeEnum.DARK,
    // language: LanguageEnum.English,
    // fontSize: 14,
    // darkMode: true,
    // enableEmojis: true,
    // enableGIFs: true,
    // emailNotifications: true,
    // pushNotifications: true,
    // notificationSound: "ding",
    // timeZone: "UTC",
    // dateFormat: "YYYY-MM-DD",
    // timeFormat: "24-hour",
    // defaultProjectView: "list",
    // taskSortOrder: "priority",
    // showCompletedTasks: true,
    // projectColorScheme: "blue",
    // showTeamCalendar: false,
    // teamViewSettings: [],
    // defaultTeamDashboard: "overview",
    // passwordExpirationDays: 90,
    // thirdPartyApiKeys: { key1: "value1", key2: "value2" },
    // externalCalendarSync: true,
    // dataExportPreferences: [],
    // dashboardWidgets: [],
    // customTaskLabels: [],
    // customProjectCategories: [],
    // customTags: [],
    // formHandlingEnabled: true,
    // paginationEnabled: true,
    // modalManagementEnabled: true,
    // sortingEnabled: true,
    // notificationSoundEnabled: true,
    // localStorageEnabled: true,
    // clipboardInteractionEnabled: true,
    // deviceDetectionEnabled: true,
    // loadingSpinnerEnabled: true,
    // errorHandlingEnabled: true,
    // toastNotificationsEnabled: true,
    // datePickerEnabled: true,
    // themeSwitchingEnabled: true,
    // imageUploadingEnabled: true,
    // passwordStrengthEnabled: true,
    // browserHistoryEnabled: true,
    // geolocationEnabled: true,
    // webSocketsEnabled: true,
    // dragAndDropEnabled: true,
    // idleTimeoutEnabled: true,
    // enableAudioChat: true,
    // enableVideoChat: true,
    // enableFileSharing: true,
    // enableBlockchainCommunication: true,
    // enableDecentralizedStorage: true,
    // selectDatabaseVersion: "v1.0",
    // selectAppVersion: "v1.0",
    // enableDatabaseEncryption: true,
  },
  interests: [],
  privacySettings: {
    isDataSharingEnabled: true,
    dataSharing: {
      sharingLevel: "public",
      sharingScope: "all",
      sharingFrequency: "daily",
      sharingDuration: "30 days",
      sharingPermissions: ["read", "write", "delete"],
      sharingAccess: "public",
      sharingLocation: "global",
      sharingTags: ["tag1", "tag2"],
      sharingGroups: ["group1", "group2"],
      sharingUsers: ["user1", "user2"],
      sharingPreferences: {
        email: true,
        push: true,
        sms: true,
        chat: true,
        calendar: true,
        audioCall: false,
        videoCall: false,
        fileSharing: true,
        blockchainCommunication: false,
        decentralizedStorage: false,
        databaseEncryption: true,
        databaseVersion: "v1.0",
        appVersion: "v1.0",
        enableDatabaseEncryption: true,
      },

      allowSharing: true,
      allowSharingWith: ["user1", "user2"],
      allowSharingWithTeams: ["team1", "team2"],
      allowSharingWithGroups: ["group1", "group2"],

      allowSharingWithPublic: true,
      isAllowingSharingWithTeamsAndGroups: ["team1", "team2"],
      allowSharingWithTeamsAndGroups: true,
      enableDatabaseEncryption: true,
      isAllowingSharingWithPublicAndTeams: ["team1", "team2"],
      allowSharingWithPublicAndTeams: true,

      allowSharingWithPublicAndGroups: true,
      isAllowingSharingingWithPublicAndTeamsAndGroups: ["team1", "team2"],
      allowSharingWithPublicAndTeamsAndGroups: true,
      allowSharingWithPublicAndTeamsAndGroupsAndPublic: true,
      isAllowingSharingWithPublicAndTeamsAndGroupsAndPublic: [""],
      isAllowingSharingWithPublicAndTeamsAndGroupsAndPublicAndTeamsAndGroups: [],
      allowSharingWithPublicAndTeamsAndGroupsAndPublicAndTeamsAndGroups: true,
      isAllowingSharingWithPublic: [],
      isAllowingingSharingWithTeamsAndGroups: [],
      isAllowingSharingWithPublicAndTeamsAndGroups: [],
      isAllowingingSharingWithPublicAndTeams: [],
    },
    thirdPartyTracking: false,
    hidePersonalInfo: true,
    enablePrivacyMode: false,
    enableTwoFactorAuth: true,
    restrictVisibilityToContacts: false,
    restrictFriendRequests: false,
    hideOnlineStatus: false,
    showLastSeenTimestamp: true,
    allowTaggingInPosts: true,
    enableLocationPrivacy: true,
    hideVisitedProfiles: true,
    restrictContentSharing: true,
    enableIncognitoMode: false,
    restrictContentSharingToContacts: false,
    restrictContentSharingToGroups: false,
  },

  notifications: {
    channels: {
      email: true,
      push: true,
      sms: true,

      chat: true,
      calendar: true,
      audioCall: false,
      videoCall: false,
      screenShare: false,
    },
    types: {},
    enabled: true,
    notificationType: "push",
  },
  activityLog: [
    {
      action: "Logged in",
      timestamp: "2023-05-10T12:00:00Z",
      id: "",
      activity: "",
    },
    {
      action: "Updated profile",
      timestamp: "2023-05-10T12:00:00Z",
      id: "",
      activity: "",
    },
  ],
  socialLinks: {
    facebook: "https://facebook.com/leader",
    twitter: "https://twitter.com/leader",
    website: "",
    linkedin: "",
    instagram: "",
  },
  relationshipStatus: "Single",

  activityStatus: "Online",
  isAuthorized: true,
  notificationPreferences: {
    cryptoPreferences: {},
    emailNotifications: true,
    pushNotifications: true,
    enableNotifications: true,
    notificationSound: "birds",
    notificationVolume: 50,
    smsNotifications: true,
    desktopNotifications: true,
    notificationTypes: {
      mention: true,
      reaction: true,
      follow: true,
      poke: true,
      activity: true,
      thread: true,
      inviteAccepted: true,
      meeting: true,
      directMessage: true,
      audioCall: true,
      videoCall: true,
      screenShare: true,
      chat: true,
      calendar: true,
      task: true,
      file: true,

      announcement: true,
      reminder: true,
      project: true,
      inApp: true,
    },
    customNotificationSettings: "",
    mobile: {
      email: true,
      sms: false,
      pushNotifications: true,
      desktopNotifications: true,
      emailFrequency: "daily",
      smsFrequency: "daily",
    },
    desktop: {
      email: true,
      sms: false,
      pushNotifications: true,
      desktopNotifications: true,
      emailFrequency: "daily",
      smsFrequency: "daily",
    },
    tablet: {
      email: true,
      sms: false,
      pushNotifications: true,
      desktopNotifications: true,
      emailFrequency: "daily",
      smsFrequency: "daily",
    },
  },
  securitySettings: {
    securityQuestions: ["What is your pet's name?"],
    twoFactorAuthentication: false,
    passwordPolicy: "StandardPolicy",
    passwordExpirationDays: 90,
    passwordStrength: "Strong",
    passwordComplexityRequirements: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireDigits: true,
      requireSpecialCharacters: false,
    },
    accountLockoutPolicy: {
      enabled: true,
      maxFailedAttempts: 5,
      lockoutDurationMinutes: 15,
    },
    accountLockoutThreshold: 5,
  },
  emailVerificationStatus: true,
  phoneVerificationStatus: true,
  walletAddress: "0x123456789abcdef",

  transactionHistory: [
    createCustomTransaction({
      id: "tx1",
      amount: 100,
      date: new Date(),
      description: "Sample transaction",
      type: null,
      typeName: null,
      to: null,
      nonce: 0,
      gasLimit: BigInt(0),
      gasPrice: null,
      maxPriorityFeePerGas: null,
      maxFeePerGas: null,
      data: "",
      value: BigInt(0),
      chainId: BigInt(0),
      signature: null,
      accessList: [],
      maxFeePerBlobGas: null,
      blobVersionedHashes: null,
      hash: null,
      unsignedHash: "",
      from: null,
      fromPublicKey: null,

      isSigned(): boolean {
        return !!(this.type && this.typeName && this.from && this.signature);
      },
      serialized: "",
      unsignedSerialized: "",
      inferType(): number {
        if (this.type !== null && this.type !== undefined) {
          return this.type;
        }
        return 0;
      },
      inferTypes(): number[] {
        const types: number[] = [];
        if (this.type !== null && this.type !== undefined) {
          types.push(this.type);
        }
        if (this.maxFeePerGas !== null && this.maxPriorityFeePerGas !== null) {
          types.push(2);
        }
        if (types.length === 0) {
          types.push(0);
        }
        return types;
      },

      isLegacy() {
        return this.type === 0 && this.gasPrice !== null;
      },
      isBerlin() {
        return (
          this.type === 1 && this.gasPrice !== null && this.accessList !== null
        );
      },

      isLondon() {
        return (
          this.type === 2 &&
          this.accessList !== null &&
          this.maxFeePerGas !== null &&
          this.maxPriorityFeePerGas !== null
        );
      },
      isCancun() {
        return (
          this.type === 3 &&
          this.to !== null &&
          this.accessList !== null &&
          this.maxFeePerGas !== null &&
          this.maxPriorityFeePerGas !== null &&
          this.maxFeePerBlobGas !== null &&
          this.blobVersionedHashes !== null
        );
      },

      clone(): CustomTransaction {
        const clonedData: CustomTransaction = {
          _id: this._id,
          id: this.id || "",
          amount: this.amount,
          date: this.date ? new Date(this.date.getTime()) : undefined,
          description: this.description || "",
          startDate: this.startDate ? new Date(this.startDate) : undefined,
          endDate: this.endDate ? new Date(this.endDate) : undefined,
          isSigned: typeof this.isSigned === "function"
            ? this.isSigned.bind(this)
            : this.isSigned,
          serialized: this.serialized || "",
          unsignedSerialized: this.unsignedSerialized || "",
          inferType: this.inferType?.bind(this),
          inferTypes: this.inferTypes?.bind(this),
          isLegacy: this.isLegacy?.bind(this),
          isBerlin: this.isBerlin?.bind(this),
          isLondon: this.isLondon?.bind(this),
          isCancun: this.isCancun?.bind(this),
          clone: this.clone?.bind(this),
          toJSON: this.toJSON?.bind(this),
          title: "",
          accessList: [],
          type: null,
          typeName: null,
          from: null,
          signature: null,
          maxFeePerGas: null,
          maxPriorityFeePerGas: null,
          gasPrice: null,
          to: null,
          nonce: 0,
          gasLimit: BigInt(0),
          data: "",
          value: BigInt(0),
          chainId: BigInt(0),
          maxFeePerBlobGas: null,
          blobVersionedHashes: null,
          hash: null,
          unsignedHash: "",
          fromPublicKey: null,

          equals(transaction: CustomTransaction): boolean {
            return (
              this.id === transaction.id &&
              this.amount === transaction.amount &&
              this.date?.getTime() === transaction.date?.getTime() &&
              this.title === transaction.title
            );
          },

          getSubscriptionLevel(): string {
            if (this.subscriptionType) {
              switch (this.subscriptionType) {
                case SubscriptionTypeEnum.FREE:
                  return "Free";
                case SubscriptionTypeEnum.STANDARD:
                  return "Standard";
                case SubscriptionTypeEnum.PREMIUM:
                  return "Enterprise";
                case SubscriptionTypeEnum.ENTERPRISE:
                  return "Premium";
                case SubscriptionTypeEnum.TRIAL:
                  return "Premium";
                default:
                  return "Unknown";
              }
            } else {
              return "Unknown";
            }
          },
          getRecentActivity: () => {
            if (this.recentActivity && this.recentActivity.length === 2) {
              return this.recentActivity;
            } else {
              return [
                { action: "", timestamp: new Date() },
                { action: "", timestamp: new Date() },
              ];
            }
          },
          notificationsEnabled: this.notificationsEnabled ?? false,
          recentActivity: [
            { action: "Action 1", timestamp: new Date() },
            { action: "Action 2", timestamp: new Date() },
          ],
        };
        return clonedData;
      },
      toJSON(): CustomTransaction {

        let myBigInt: bigint = this.value as bigint;
        const customTransaction: CustomTransaction = {
          id: this.id ?? null,
          type: this.type ?? null,
          title: this.title ?? null,
          startDate: this.startDate,
          endDate: this.endDate,
          serialized: this.serialized,
          typeName: this.typeName ?? null,
          from: this.from ?? null,
          signature: this.signature ?? null,
          maxFeePerGas: this.maxFeePerGas ?? null,
          maxFeePerBlobGas: this.maxFeePerBlobGas ?? null,
          blobVersionedHashes: this.blobVersionedHashes ?? null,
          maxPriorityFeePerGas: this.maxPriorityFeePerGas ?? null,
          gasPrice: this.gasPrice ?? null,
          date: this.date,
          data: this.data || "",
          description: this.description ?? null,
          value: myBigInt,
          unsignedHash: this.unsignedHash ?? null,
          notificationsEnabled: this.notificationsEnabled ?? false,
          amount: 0,
          unsignedSerialized: this.unsignedSerialized,
          recentActivity: this.recentActivity ?? [
            { action: "", timestamp: new Date() },
            { action: "", timestamp: new Date() },
          ],
        };
        return customTransaction;
      },
    }),
  ],
  getData: function (): Promise<SnapshotStore<BaseData<any>, BaseData<any>, StructuredMetadata<BaseData<any, any, StructuredMetadata<any, any>>,
    BaseData<any, any, StructuredMetadata<any, any>>>>[]> {
    return Promise.resolve([]);
  },

  metadata: {
    version: "",
    permissions: [],
    childIds: [],
    relatedData: [],
  },

  configuration: {
    timeout: 0,
    retryAttempts: 0,
    apiEndpoint: '',
    apiKey: undefined,
  },

};

export type {
  BaseData, CommonRelationship, Data,
  DataDetails,
  DataDetailsComponent,
  DataDetailsProps, SharedBaseData, TodoSubtasks,
  DataWithOmittedFields
};


// Clean the coreData to replace empty strings with null
const cleanedCoreData = cleanEmptyStrings(coreData);

  export { cleanedCoreData };