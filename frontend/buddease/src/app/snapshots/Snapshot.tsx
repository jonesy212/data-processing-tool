// Snapshot.tsx
// snapshot
import * as snapshotApi from "@/app/api/SnapshotApi";
import { LanguageEnum } from "@/app/communications/LanguageEnum";
import { useMeta } from "@/app/config/useMeta";
import { createCustomTransaction } from "@/app/hooks/dynamicHooks/createCustomTransaction";
import {
  CombinedEvents,
  createBaseData,
  SnapshotManager,
} from "@/app/hooks/useSnapshotManager";
import { Category } from "@/app/libraries/categories/generateCategoryProperties";
import { ThemeEnum } from "@/app/libraries/ui/theme/Theme";
import { BaseData, Data } from '@/app/models/data/Data';
import FileData from "@/app/models/data/FileData";
import {
  ProjectPhaseTypeEnum
} from "@/app/models/data/StatusType";
import UserRoles from '@/app/models/UserRoles';
import { Persona } from "@/app/pages/personas/Persona";
import PersonaTypeEnum from "@/app/pages/personas/PersonaBuilder";
import { CoreSnapshot } from "@/app/snapshots/CoreSnapshot";
import {
  SnapshotsArray,
  SnapshotsObject
} from '@/app/snapshots/LocalStorageSnapshotStore';
import { SnapshotConfigParams } from '@/app/snapshots/SnapshotConfigBuilder';
import { Stroke } from "@/app/state/redux/slices/DrawingSlice";
import {
  DataStore,
  EventRecord,
  InitializedState,
} from "@/app/state/stores/DataStore";
import { Subscriber } from "@/app/subscribers/Subscriber";
import { CustomTransaction } from "@/app/typings/cryptoTypes/SmartContractInteraction";
import { AppAttachment, AppEntity, AppExcludedFields, AppIncludedFields, AppK, AppMeta } from "@/app/typings/entities/AppEntity";
import { DataAttachment, DataEntity, DataExcludedFields, DataIncludedFields, DataK, DataMeta } from "@/app/typings/entities/DataEntity";
import { User } from "@/app/users/User";
import { isSnapshotStoreConfig } from "@/utils/snapshotUtils";
import { updateFileMetadata } from "@/utils/web3/fileUtils";
import { id, Signature } from "ethers";
import { refreshUI, refreshUIForFile } from "./refreshUI";
import { SnapshotConfigProps } from "./SnapshotConfigProps";
import {
  defaultAddDataStatus,
  defaultRemoveData,
  defaultTransformDelegate,
  defaultUpdateData,
  defaultUpdateDataDescription,
  defaultUpdateDataStatus,
  defaultUpdateDataTitle
} from "./snapshotDefaults";
import SnapshotStore from "./SnapshotStore";
import { InitializedConfig, SnapshotStoreConfig } from "./SnapshotStoreConfig";
import {
  snapshotStoreConfigInstance
} from "./snapshotStoreConfigInstance";

import { SnapshotCategory } from "@/app/api/getSnapshotEndpoint";
import { Label } from "@/app/branding/BrandingSettings";
import { CalendarEvent } from "@/app/calendar/CalendarEvent";
import { ExcludedFields } from "@/app/components/routing/Fields";
import { HighlightColor } from "@/app/components/styling/Palette";
import {
  BaseDataEntity,
  DefaultExcludedFields,
  DefaultMeta,
} from '@/app/config/BaseConfig';
import { SchemaField } from "@/app/config/metadata/SchemaField";
import {
  UnifiedMetaDataOptions
} from "@/app/config/MetaDataOptions";
import { StructuredMetadata } from "@/app/config/StructuredMetadata";
import { Attachment } from '@/app/documents/attachment/Attachment';
import { SharedSnapshotProperties, SharedTimestamps } from "@/app/documents/RelatedProps";
import useDocumentManagement from "@/app/hooks/documents/useDocumentManagement";
import { useErrorHandling } from '@/app/hooks/useErrorHandling';
import { CreateSnapshotStoresPayload } from '@/app/interfaces/payload/payloadTypes';
import { K, Meta, T } from '@/app/models/data/dataStoreMethods';
import { fetchUserAreaDimensions } from "@/app/pages/layouts/fetchUserAreaDimensions";
import { CategoryProperties } from "@/app/pages/personas/ScenarioBuilder";
import { ActivityStatus } from "@/app/pages/profile/Profile";
import { CriteriaType } from "@/app/pages/searches/CriteriaType";
import baseMeta from "@/app/server/database/baseMeta";
import { payload } from "@/app/server/database/Payload";
import { SharedMetadata } from '@/app/shared/SharedMetadata';
import CalendarManagerStoreClass from "@/app/state/stores/CalendarManagerStore";
import { SubscriberCollection } from '@/app/subscribers/SubscriberCollection';
import { Callback } from "@/app/subscribers/subscribeToSnapshotsImplementation";
import { Todo } from "@/app/todos/Todo";
import { UnsubscribeDetails } from '@/app/typings/eventHandlers/eventTypes';
import { RealtimeDataItem } from '@/app/typings/realtimeTypes';
import { SnapshotEvent, SnapshotEvents } from "@/app/typings/snapshotTypes";
import { convertSnapshotToMap } from "@/app/typings/YourSpecificSnapshotType";
import { ExtendedVersionData } from "@/app/versions/VersionData";
import operation from "antd/es/transfer/operation";
import { version } from "os";
import { config } from "process";
import { options } from "sanitize-html";
import {
  CustomSnapshotData,
  SnapshotContainer,
  SnapshotData
} from ".";
import { createSnapshot } from "./createSnapshot";
import { getData } from "./methods/dataMethods";
import {
  ConfigureSnapshotStorePayload,
  SnapshotConfig,
} from "./SnapshotConfig";
import { SnapshotSecurity } from "./SnapshotSecurity";
import { storeProps } from "./SnapshotStoreProps";
import { SnapshotContext } from "./SnapshotSubscriberManagement";
import { SnapshotWithCriteria } from "./SnapshotWithCriteria";


type SnapshotFromParams<
  Params extends SnapshotConfigParams<any, any, any, any, any, any, any[]> = SnapshotConfigParams
> = Snapshot<
  Params[0], // T
  Params[1], // K
  Params[2], // Meta
  Params[3], // ExcludedFields
  Params[4],
  Params[5]
  >;

interface Snapshot<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends CoreSnapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
SharedTimestamps
{
  dataObject?: Record<string, unknown>;
  deleted: boolean;
  initialState: InitializedState<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | {};
  isCore: boolean;
  latestVersion: Version<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  customProperties?: Record<string, unknown>;
  childIds?: K[] | undefined;
  snapshotCategory?: SnapshotCategory<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  
  snapshotSubscriberId?: string | undefined;
  customProperty?: string | number | boolean | Date | null | {
  type: string;
  value: unknown;
  description?: string;
  };
  initialConfig: InitializedConfig | {};
  properties?: T | K;
  snapshotsArray?: SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  snapshotsObject?: SnapshotsObject<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  recentActivity?: { action: string; timestamp: Date }[];
  onInitialize: (callback: () => void) => void;
  onError?: (error: Error) => void;
  categories?: Category[];
  taskIdToAssign: string | undefined;
  schema: string | Record<string, SchemaField>;
  currentCategory: Category;
  mappedSnapshotData:
    | Map<string, Snapshot<MyEntity, MyK, MyMeta, MyExcludedFields>>
    | undefined;
  storeId: number;

  shouldArchive?: boolean;
  archivePriority?: "low" | "medium" | "high";
  archiveTags?: string[];
  archiveRetention?: number; // days
  archiveImmediately?: boolean;
  // Data-specific properties
  shared?: SharedSnapshotProperties<T, K, any>;      // Snapshot data sharing
  sharedMetadata?: SharedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  
  // Data security
  security?: SnapshotSecurity;                       // ✅ Data security
  versioning?: string | number;
  versionInfo: ExtendedVersionData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;
  initializedState: InitializedState<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | {};
  criteria?: CriteriaType;
  relationships?: Map<string, K>;
  storeConfig?: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  additionalData?: CustomSnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  dataStores?: DataStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  snapshotStoreConfig?: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;
  snapshotStoreConfigSearch?: SnapshotStoreConfig<
    SnapshotWithCriteria<any, BaseDataEntity>,
    SnapshotWithCriteria<any, BaseDataEntity>
  > | null;
  snapshotContainer: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined | null;
  // Logic for `getAllValues`
}

// A type guard to check if an object is of type CombinedEvents<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
function isCombinedEvents<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(events: any): events is CombinedEvents<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  return (
    typeof events === "object" &&
    "records" in events &&
    "event" in events &&
    "unsubscribeDetails" in events &&
    "callback" in events
  );
}

const area = `${fetchUserAreaDimensions().width}x${
  fetchUserAreaDimensions().height
}`;
const currentMeta: StructuredMetadata<T, K, DefaultMeta<T, K>, DefaultExcludedFields<T>> = useMeta<T, K, DefaultMeta<T, K>, DefaultExcludedFields<T>>(area);
const meta = useMeta<T, K, DefaultMeta<T, K>, DefaultExcludedFields<T>>(area);

// Define T as a generic type parameter
function processSnapshot<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) {
  // Create proper fallback functions that match the expected return types
  const defaultGetAllKeys = async (): Promise<string[]> => [];
  const defaultGetAllItems = async (): Promise<
    Snapshot<T, K, DefaultMeta<T, K>, DefaultExcludedFields<T>>[]
  > => [];

  // Type assertion for snapshot with transformSubscriber
  type SnapshotWithTransformSubscriber = Snapshot<
    T,
    K,
    Meta,
    AttachmentType,
    ExcludedFields,
    IncludedFields
  > & {
    transformSubscriber?: (sub: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  };

  const typedSnapshot = snapshot as SnapshotWithTransformSubscriber;

  // Example usage of the Snapshot interface
  const newSnapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
    ...snapshot,
    transformDelegate: snapshot.transformDelegate || defaultTransformDelegate,
    initializedState: snapshot.initializedState || null,
    getAllKeys: snapshot.getAllKeys || defaultGetAllKeys,
    getAllItems: snapshot.getAllItems || defaultGetAllItems,

    addDataStatus: (id, status) => defaultAddDataStatus(id, status, snapshot),

    removeData: (id) => defaultRemoveData(id, snapshot),
    updateData: (id, newData) => defaultUpdateData(id, newData, snapshot),
    updateDataTitle: (id, title) => defaultUpdateDataTitle(id, title, snapshot),
    updateDataDescription: (id, description) =>
      defaultUpdateDataDescription(id, description, snapshot),
    updateDataStatus: (id, status) => defaultUpdateDataStatus(id, status, snapshot),
    id: snapshot.id || "snapshot1",
    category: snapshot.category || "example category",
    timestamp: snapshot.timestamp || new Date(),
    createdBy: snapshot.createdBy || "creator1",
    description: snapshot.description || "Sample snapshot description",
    tags: snapshot.tags || ["sample", "snapshot"],
    metadata: snapshot.metadata || {
      area: "snapshot processing",
      currentMeta: currentMeta,
      metadataEntries: {},
    },
    data: snapshot.data,
    // mappedData: snapshot.mappedData || new Map<string, Snapshot<MyEntity, MyK, MyMeta, MyExcludedFields>>(),
    initialState: snapshot.initialState || null,
    events:
      snapshot.events && isCombinedEvents(snapshot.events)
        ? snapshot.events
        : undefined, // or use a default value that fits `CombinedEvents<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>`

    // Snapshot interface with type guard
    snapshotStoreConfig: isSnapshotStoreConfig<
      T,
      K,
      Meta,
      AttachmentType,
      ExcludedFields,
      IncludedFields
    >(snapshot.snapshotStoreConfig)
      ? snapshot.snapshotStoreConfig
      : Array.isArray(snapshotStoreConfigInstance) &&
        snapshotStoreConfigInstance.length > 0 &&
        isSnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(snapshotStoreConfigInstance[0])
      ? snapshotStoreConfigInstance[0]
      : null,
    getSnapshotItems: snapshot.getSnapshotItems || (() => []), // Replace with actual function
    defaultSubscribeToSnapshots:
      snapshot.defaultSubscribeToSnapshots || (() => {}), // Replace with actual function
    transformSubscriber:
      typedSnapshot.transformSubscriber ||
      ((sub: Subscriber<T, K, DefaultMeta<T, K>, DefaultExcludedFields<T>>) => {
        // Transform subscriber here
        return sub;
      }),
    // Add other properties as needed
  };

  // Usage example
  console.log(newSnapshot);
}

const plainDataObject: Record<string, Data<DataEntity,
  DataK, DataMeta, DataAttachment,
  DataIncludedFields, DataExcludedFields>> = {
  "1": {
    _id: "1",
    id: "data1",
    title: "Sample Data",
    description: "Sample description",
    timestamp: new Date(),
    category: "Sample category",
    scheduled: {},
    isScheduled: true,
    status: "Pending",
    notificationsEnabled: true,
    isActive: true,
    tags: {
      "1": {
        id: "1",
        name: "Sample tag",
        color: "#000000",
        relatedTags: ["tag1", "tag2"],
        description: "Sample related tag",
        enabled: true,
        type: "",
        createdBy: "@jonsmiff",
        timestamp: new Date().getTime(), // Convert Date to number
      },
    },
    phase: {
      id: "phase1",
      name: "Sample Phase",
      description: "Sample description",
      type: "Ideation",
      status: "Pending",
      tags: {
        "1": {
          id: "1",
          name: "Sample tag",
          color: "#000000",
          relatedTags: ["Important"],
          description: "Sample related phase tag",
          enabled: true,
          type: "",
          createdBy: "@jonsmiff",
          timestamp: new Date().getTime(), // Convert Date to number
        },
      },

      startDate: new Date(),
      endDate: new Date(),
      subPhases: [],
      component: {} as React.FC<any>,
      duration: 0,
      hooks: {
        onInit: () => {},
        onMount: () => {},
        onUnmount: () => {},
        onPhaseChange: () => {},
        onPhaseCompletion: () => {},
        onPhaseCreation: () => {},
        onPhaseDeletion: () => {},
        onPhaseUpdate: () => {},
        onPhaseMove: () => {},
        onPhaseDueDateChange: () => {},
        onPhasePriorityChange: () => {},
        onPhaseAssigneeChange: () => {},

        resetIdleTimeout: async () => {},
        isActive: false,
        progress: {
          id: "",
          value: 0,
          label: "",
          current: 0,
          max: 0,
          min: 0,
          percentage: 0,
          color: "",
          name: "",
          description: "",
          done: false,
        },
        condition: async (idleTimeoutDuration: number) => {
          return true;
        },
      },
      label: {} as Label,
      currentMeta: {} as StructuredMetadata<any, K>,
      currentMetadata: {} as UnifiedMetaDataOptions<any, K>,
      date: "",
      createdBy: "",
    },
    phaseType: ProjectPhaseTypeEnum.Ideation,
    dueDate: new Date(),
    priority: "High",
    assignee: {
      id: "assignee1",
      username: "Assignee Name",
    } as User,
    collaborators: [],
    comments: [],
    attachments: [],
    subtasks: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: "creator1",
    updatedBy: "updater1",
    analysisResults: [],
    audioUrl: "sample-audio-url",
    videoUrl: "sample-video-url",
    videoThumbnail: "sample-thumbnail-url",
    videoDuration: 60,
    collaborationOptions: [],
    videoData: {
      id: "video1",
      campaignId: 123,
      resolution: "1080p",
      size: "100MB",
      aspectRatio: "16:9",
      language: "en",
      subtitles: [],
      duration: 60,
      createdBy: "John Doe",
      video: {
        category: "",
      },
      label: {} as Label,
      currentMeta: {} as StructuredMetadata<T, K, DefaultMeta<T, K>, DefaultExcludedFields<T>>,
      currentMetadata: {} as UnifiedMetaDataOptions<T, K, DefaultMeta<T, K>, DefaultExcludedFields<T>>,
      date: new Date(),
      codec: "H.264",
      frameRate: 30,
      url: "",
      thumbnailUrl: "",
      uploadedBy: "",
      viewsCount: 0,
      likesCount: 0,
      dislikesCount: 0,
      commentsCount: 0,
      title: "",
      description: "",
      tags: {},
      createdAt: new Date(),
      uploadedAt: new Date(),
      updatedAt: new Date(),
      videoDislikes: 0,
      videoAuthor: "",
      videoDurationInSeconds: 60,
      uploadDate: new Date(),
      videoLikes: 20,
      videoViews: 0,
      videoComments: 0,
      videoThumbnail: "",
      videoUrl: "",
      videoTitle: "",
      thumbnail: "",
      videoDescription: "",
      videoTags: [],
      videoSubtitles: [],
      category: "",
      closedCaptions: [],
      license: "",
      isLive: false,
      isPrivate: false,
      isUnlisted: false,
      isProcessingCompleted: false,
      isProcessingFailed: false,
      isProcessingStarted: false,
      channel: "",
      channelId: "",
      isLicensedContent: false,
      isFamilyFriendly: false,
      isEmbeddable: false,
      isDownloadable: false,
      playlists: [],
      isDeleting: false,
      isCompleted: false,
      isUploading: false,
      isDownloading: false,
      isProcessing: false,
    },
    additionalData: {},
    ideas: [],
    members: [],
    leader: {
      id: "leader1",
      username: "Leader Name",
      email: "leader@example.com",
      fullName: "Leader Full Name",
      bio: "Leader Bio",
      userType: "Admin",
      hasQuota: true,
      tier: "0",
      token: "leader-token",
      bannerUrl: "",
      roles: [],
      currentMetadata: {} as UnifiedMetaDataOptions<T, K, DefaultMeta<T, K>, DefaultExcludedFields<T>>,
      currentMeta: {} as StructuredMetadata<T, K, DefaultMeta<T, K>, DefaultExcludedFields<T>>,
      storeId: 0,
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
      followers: [],
      preferences: {
        id: "",
        name: "",
        phases: [],
        trackFileChanges: (file: FileData<T>): FileData<T> => {
          // Example: Log the change and update a last modified timestamp
          console.log(`File ${file.name} has changed.`);

          // Update file metadata
          updateFileMetadata(String(file.id), {
            lastModified: new Date(),
          });

          // Trigger any other necessary updates, like refreshing the UI
          refreshUIForFile(Number(file.id));

          // Return the file to satisfy the FileData return type
          return file;
        },

        // Define initial values for stroke, strokeWidth, etc.
        stroke: {
          width: 1,
          color: "#000000",
        },
        strokeWidth: 1, // Default stroke width (1px)
        fillColor: "#FFFFFF", // Default fill color (white)
        isFlippedX: false, // Indicates if the element is flipped horizontally
        isFlippedY: false, // Indicates if the element is flipped vertically
        x: 0, // X position
        y: 0, // Y position

        // Logic for handling updates to these properties
        updateAppearance: function (
          newStroke: Stroke,
          newFillColor: string,
          updates: {
            stroke?: Stroke; // Optional stroke updates
            strokeWidth?: number; // Optional stroke width
            fillColor?: string; // Optional fill color updates
            borderColor?: string; // Optional border color updates
            textColor?: string; // Optional text color updates
            highlightColor?: HighlightColor; // Optional highlight settings
            backgroundColor?: string; // Optional background color updates
            fontSize?: string; // Optional font size updates
            fontFamily?: string; // Optional font family updates
            isFlippedX?: boolean; // Optional horizontal flip
            isFlippedY?: boolean; // Optional vertical flip
            x?: number; // Optional x position
            y?: number; // Optional y position
          },
          newBorderColor?: string,
          newHighlightColor?: string
        ) {
          // Apply updates to each property if provided
          if (updates.stroke !== undefined) {
            this.stroke = updates.stroke;
          }
          if (updates.strokeWidth !== undefined) {
            this.strokeWidth = updates.strokeWidth;
          }
          if (updates.fillColor !== undefined) {
            this.fillColor = updates.fillColor;
          }
          if (updates.isFlippedX !== undefined) {
            this.isFlippedX = updates.isFlippedX;
          }
          if (updates.isFlippedY !== undefined) {
            this.isFlippedY = updates.isFlippedY;
          }
          if (updates.x !== undefined) {
            this.x = updates.x;
          }
          if (updates.y !== undefined) {
            this.y = updates.y;
          }

          // Trigger a UI refresh or further processing
          refreshUI(updates);
        },

        // A placeholder function to refresh UI or re-render the affected elements
        refreshUI: function () {
          console.log("UI refreshed with the following properties:");
          console.log(`Stroke: ${this.stroke}`);
          console.log(`Stroke width: ${this.strokeWidth}px`);
          console.log(`Fill color: ${this.fillColor}`);
          console.log(`FlippedX: ${this.isFlippedX}`);
          console.log(`FlippedY: ${this.isFlippedY}`);
          console.log(`Position (X, Y): (${this.x}, ${this.y})`);
        },
      },
      persona: new Persona(PersonaTypeEnum.Default),
      settings: {
        id: "",
        filter: (key: keyof UserSettings) => {},
        appName: "buddease",
        userId: 123,
        userSettings: setTimeout(() => {}, 1000), // Example timeout
        communicationMode: "email",
        enableRealTimeUpdates: true,
        defaultFileType: "pdf",
        allowedFileTypes: ["pdf", "docx", "txt"],
        enableGroupManagement: true,
        enableTeamManagement: true,
        idleTimeout: undefined,

        calendarEvents: [],
        todos: [],
        tasks: [],
        snapshotStores: [],

        currentPhase: "",
        comment: "",
        browserCheckStore: {
          browserKey: "",
          dispatch: (action: any) => {},
          init: (key: string) => {},
          testDispatch: (action: any) => {},
        },
        trackerStore: {
          trackers: "",
          addTracker: "",
          getTracker: "",
          getTrackers: "",

          removeTracker: "",
          dispatch: "",
          removeTodo: "",
          assignTodoToUser: "",
          updateTodoTitle: "",
          fetchTodosSuccess: "",
        },

        todoStore: {
          dispatch: (action: any) => {},
          todos: {},
          todoList: [],
          toggleTodo: (id: string) => {},

          addTodo: (todo: Todo<T, K, DefaultMeta<T, K>, DefaultExcludedFields<T>>) => {},
          loading: {},
          error: null,
          addTodos: (
            newTodos: Todo<T, K, DefaultMeta<T, K>, DefaultExcludedFields<T>>[],
            data: SnapshotStore<Snapshot<any, any, any>>
          ) => {},

          removeTodo: (id: string) => {},
          assignTodoToUser: (todoId: string, userId: string) => {},
          updateTodoTitle: (payload: { id: string; newTitle: string }) => {},
          fetchTodosSuccess: (payload: { todos: Todo<T, K, DefaultMeta<T, K>, DefaultExcludedFields<T>>[] }) => {},

          fetchTodosFailure: (payload: { error: string }) => {},
          openTodoSettingsPage: (todoId: number, teamId: number) => {},
          getTodoId: (todo: Todo<T, K, DefaultMeta<T, K>, DefaultExcludedFields<T>>) => null,
          getTeamId: (todo: Todo<T, K, DefaultMeta<T, K>, DefaultExcludedFields<T>>) => null,

          fetchTodosRequest: () => {},
          completeAllTodosSuccess: () => {},
          completeAllTodos: () => {},
          completeAllTodosFailure: (payload: { error: string }) => {},
        },
        taskManagerStore: {
          tasks: "",
          taskTitle: "",
          taskDescription: "",
          taskStatus: "",

          assignedTaskStore: "",
          updateTaskTitle: "",
          updateTaskDescription: "",
          updateTaskStatus: "",

          updateTaskDueDate: "",
          updateTaskPriority: "",
          filterTasksByStatus: "",
          getTaskCountByStatus: "",

          clearAllTasks: "",
          archiveCompletedTasks: "",
          updateTaskAssignee: "",
          getTasksByAssignee: "",

          getTaskById: "",
          sortByDueDate: "",
          exportTasksToCSV: "",
          dispatch: "",
        },
        iconStore: {
          dispatch: "",
        },
        calendarStore: {
          openScheduleEventModal: "",
          openCalendarSettingsPage: "",
          getData: "",
          updateDocumentReleaseStatus: "",
          getState: "",
          action: "",
          events: "",
          eventTitle: "",
          eventDescription: "",
          eventStatus: "",
          assignedEventStore: "",
          snapshotStore: "",
        },

        endpoints: {},
        highlights: [],
        results: [],
        totalCount: 0,
        searchData: {
          results: [],
          totalCount: 0,
        },

        startIdleTimeout: (timeoutDuration: number, onTimeout: () => void) => {
          // Example implementation
          setTimeout(onTimeout, timeoutDuration);
        },
        idleTimeoutDuration: 60000, // 1 minute
        activePhase: "development",
        realTimeChatEnabled: true,
        todoManagementEnabled: true,
        notificationEmailEnabled: true,
        analyticsEnabled: true,
        twoFactorAuthenticationEnabled: true,
        projectManagementEnabled: true,
        documentationSystemEnabled: true,
        versionControlEnabled: true,
        userProfilesEnabled: true,
        accessControlEnabled: true,
        taskManagementEnabled: true,
        loggingAndNotificationsEnabled: true,
        securityFeaturesEnabled: true,
        collaborationPreference1: "Option 1",
        collaborationPreference2: "Option 2",
        theme: ThemeEnum.LIGHT,
        language: LanguageEnum.English, // Example language
        fontSize: 14,
        darkMode: false,
        enableEmojis: true,
        enableGIFs: true,
        emailNotifications: true,
        pushNotifications: true,
        notificationSound: "ding.wav", // Example sound file
        timeZone: "UTC",
        dateFormat: "YYYY-MM-DD",
        timeFormat: "HH:mm",
        defaultProjectView: "list",
        taskSortOrder: "priority",
        showCompletedTasks: true,
        projectColorScheme: "blue",
        showTeamCalendar: true,
        teamViewSettings: [],
        defaultTeamDashboard: "overview",
        passwordExpirationDays: 90,
        privacySettings: [], // Example privacy settings
        thirdPartyApiKeys: {
          google: "your-google-api-key",
          facebook: "your-facebook-api-key",
        },
        externalCalendarSync: true,
        dataExportPreferences: [],
        dashboardWidgets: [],
        customTaskLabels: [],
        customProjectCategories: [],
        customTags: [],
        additionalPreference1: "Option A",
        additionalPreference2: "Option B",
        formHandlingEnabled: true,
        paginationEnabled: true,
        modalManagementEnabled: true,
        sortingEnabled: true,
        notificationSoundEnabled: true,
        localStorageEnabled: true,
        clipboardInteractionEnabled: true,
        deviceDetectionEnabled: true,
        loadingSpinnerEnabled: true,
        errorHandlingEnabled: true,
        toastNotificationsEnabled: true,
        datePickerEnabled: true,
        themeSwitchingEnabled: true,
        imageUploadingEnabled: true,
        passwordStrengthEnabled: true,
        browserHistoryEnabled: true,
        geolocationEnabled: true,
        webSocketsEnabled: true,
        dragAndDropEnabled: true,
        idleTimeoutEnabled: true,
        enableAudioChat: true,
        enableVideoChat: true,
        enableFileSharing: true,
        enableBlockchainCommunication: true,
        enableDecentralizedStorage: true,
        selectDatabaseVersion: "latest",
        selectAppVersion: "2.0",
        enableDatabaseEncryption: true,
        notificationsEnabled: true,
      },
      interests: [],
      privacySettings: {
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
        isDataSharingEnabled: true,
        thirdPartyTracking: false,
        dataSharing: {
          sharingLevel: "",
          sharingScope: "",
          sharingOptions: [],
          sharingFrequency: "",
          sharingDuration: "",
          sharingPermissions: [],
          sharingAccess: "",
          sharingLocation: "",
          allowSharing: true,
          allowSharingWith: [],
          allowSharingWithTeams: [],
          allowSharingWithGroups: [],
          allowSharingWithPublic: false,
          allowSharingWithTeamsAndGroups: false,
          allowSharingWithPublicAndTeams: false,
          allowSharingWithPublicAndGroups: false,
          allowSharingWithPublicAndTeamsAndGroups: false,

          allowSharingWithPublicAndTeamsAndGroupsAndPublic: false,
          allowSharingWithPublicAndTeamsAndGroupsAndPublicAndTeamsAndGroups:
            false,

          isAllowingSharingWithPublic: [],
          isAllowingingSharingWithTeamsAndGroups: [],
          isAllowingSharingWithPublicAndTeamsAndGroups: [],
          isAllowingingSharingWithPublicAndTeams: [],
          isAllowingSharingWithPublicAndTeamsAndGroupsAndPublic: [],
          isAllowingSharingWithPublicAndTeamsAndGroupsAndPublicAndTeamsAndGroups:
            [],
          isAllowingSharingWithTeamsAndGroups: [],

          isAllowingSharingingWithPublicAndTeamsAndGroups: [],
          isAllowingSharingWithPublicAndTeams: [],

          enableDatabaseEncryption: true,
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
            databaseVersion: "",
            appVersion: "",
            enableDatabaseEncryption: false,
          }, // Define additional sharing preferences
        },
      },
      notifications: {
        channels: {
          email: true,
          push: true,
          sms: true,
          inApp: true,
          chat: true,
          calendar: true,
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
          comment: false,
          like: false,
          dislike: false,
          bookmark: false,
        },
        enabled: true,
        notificationType: NotificationTypeEnum.PUSH,
      },
      activityLog: [
        {
          id: "",
          activity: "",
          action: "Logged in",
          timestamp: new Date(),
          type: ''
        },
        {
          id: "",
          activity: "",
          action: "Updated profile",
          timestamp: new Date(),
          type: ''
        },
      ],
      socialLinks: {
        facebook: "https://facebook.com/leader",
        twitter: "https://twitter.com/leader",
        website: "https://website.com/leader",
        linkedin: "https://linkedin.com/leader",
        instagram: "https://finstagram.com/leader",
      },
      relationshipStatus: "Single",
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
        isPrivate: false,
        isPrivateOnly: false,
        isPrivateOnlyForContacts: false,
        isPrivateOnlyForGroups: false,
        allowMessagesFromFriendContacts: true,
        activityStatus: {} as ActivityStatus,
        isAuthorized: true,
        canSendMessages, canViewProfile, canSeeFriends, canSeeActivity,
      },
      activityStatus: "Online",
      isAuthorized: true,
      notificationPreferences: {
        mobile: {
          email: false,
          sms: false,
          pushNotifications: false,
          desktopNotifications: false,
          emailFrequency: "",
          smsFrequency: "",
        },
        desktop: {
          email: false,
          sms: false,
          pushNotifications: false,
          desktopNotifications: false,
          emailFrequency: "",
          smsFrequency: "",
        },
        tablet: {
          email: false,
          sms: false,
          pushNotifications: false,
          desktopNotifications: false,
          emailFrequency: "",
          smsFrequency: "",
        },
        desktopNotifications: false,
        emailNotifications: true,
        pushNotifications: true,
        enableNotifications: true,
        notificationSound: "birds",
        notificationVolume: 50,
        smsNotifications: false,
        customNotificationSettings: {
          email: false,
          sms: false,
          pushNotifications: false,
          desktopNotifications: false,
          emailFrequency: "",
          smsFrequency: "",
        },
        cryptoPreferences: {
          // List of preferred cryptocurrencies
          preferredCryptoAssets: [],
          tradeNotifications: {
            enabled: true, // Whether trade notifications are enabled
            notificationTypes: "priceAlerts", // Use NotificationTypeString here
          },
          portfolioView: "overview", // View mode for the crypto portfolio
          // transactionHistory: "",
          transactionHistoryRetention: "30days",
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
        accountLockoutThreshold: 50, //todo create way reset threshod
        permission: []
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
            return !!(
              this.type &&
              this.typeName &&
              this.from &&
              this.signature
            );
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
            if (
              this.maxFeePerGas !== null &&
              this.maxPriorityFeePerGas !== null
            ) {
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
              this.type === 1 &&
              this.gasPrice !== null &&
              this.accessList !== null
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
              _id: this._id as string,
              id: this.id as string,
              amount: this.amount,
              date: this.date as Date,
              title: this.title as string,
              value: this.value as bigint,
              description: this.description || "",
              startDate: this.startDate ? new Date(this.startDate) : undefined,
              endDate: this.endDate ? new Date(this.endDate) : undefined,
              isSigned:
                typeof this.isSigned === "function"
                  ? this.isSigned.bind(this)
                  : this.isSigned,
              serialized: this.serialized,
              unsignedSerialized: this.unsignedSerialized,
              nonce: this.nonce as number,
              gasLimit: this.gasLimit as bigint,
              chainId: this.chainId,
              hash: this.hash,
              type: this.type || null,
              typeName: this.typeName || "",
              data: this.data || "",
              unsignedHash: this.unsignedHash || "",
              to: this.to,
              gasPrice: this.gasPrice as bigint,
              maxFeePerGas: this.maxFeePerGas as bigint,
              maxPriorityFeePerGas: this.maxPriorityFeePerGas as bigint,
              signature: this.signature as Signature,
              accessList: this.accessList,
              maxFeePerBlobGas: this.maxFeePerBlobGas as bigint,
              blobVersionedHashes: this.blobVersionedHashes as string,
              from: this.from as string,
              fromPublicKey: this.fromPublicKey,
              isLegacy:
                typeof this.isLegacy === "function"
                  ? this.isLegacy.bind(this)
                  : this.isLegacy,
              isBerlin:
                typeof this.isBerlin === "function"
                  ? this.isBerlin.bind(this)
                  : this.isBerlin,
              isLondon:
                typeof this.isLondon === "function"
                  ? this.isLondon.bind(this)
                  : this.isLondon,
              isCancun:
                typeof this.isCancun === "function"
                  ? this.isCancun.bind(this)
                  : this.isCancun,
              inferType:
                typeof this.inferType === "function"
                  ? this.inferType.bind(this)
                  : this.inferType,
              inferTypes:
                typeof this.inferTypes === "function"
                  ? this.inferTypes.bind(this)
                  : this.inferTypes,
              clone: typeof this.clone === "function" ? this.clone : this.clone,

              equals: function (
                this: CustomTransaction,
                data: CustomTransaction
              ): boolean {
                return (
                  this.id === data.id &&
                  this._id === data._id &&
                  this.title === data.title &&
                  this.amount === data.amount &&
                  this.date?.getTime() === data.date?.getTime() &&
                  this.description === data.description &&
                  this.startDate?.getTime() === data.startDate?.getTime() &&
                  this.endDate?.getTime() === data.endDate?.getTime() &&
                  this.serialized === data.serialized &&
                  this.unsignedSerialized === data.unsignedSerialized &&
                  this.accessList === data.accessList &&
                  this.to === data.to &&
                  this.nonce === data.nonce &&
                  this.gasLimit === data.gasLimit &&
                  this.gasPrice === data.gasPrice &&
                  this.maxPriorityFeePerGas === data.maxPriorityFeePerGas &&
                  this.maxFeePerGas === data.maxFeePerGas &&
                  this.type === data.type &&
                  this.data === data.data &&
                  this.value === data.value &&
                  this.chainId === data.chainId &&
                  this.signature === data.signature &&
                  this.maxFeePerBlobGas === data.maxFeePerBlobGas &&
                  this.blobVersionedHashes === data.blobVersionedHashes &&
                  this.hash === data.hash &&
                  this.unsignedHash === data.unsignedHash &&
                  this.from === data.from &&
                  this.fromPublicKey === data.fromPublicKey
                  //if ther eare any new props ensure to add && above after the ast value
                  // Check other properties as needed
                  // Add checks for other properties here
                );
              },
              getSubscriptionLevel: function (this: CustomTransaction) {
                return "Pro";
              },
              getRecentActivity: function (this: CustomTransaction) {
                return [
                  { action: "Created snapshot", timestamp: new Date() },
                  { action: "Edited snapshot", timestamp: new Date() },
                ];
              },
              notificationsEnabled: true,
              recentActivity: [
                { action: "Created snapshot", timestamp: new Date() },
                { action: "Edited snapshot", timestamp: new Date() },
              ],
              transactionType, currency, timestamp, status,
            };
            return clonedData;
          },
          equals(data: CustomTransaction) {
            const isSigned =
              typeof this.isSigned === "function"
                ? this.isSigned()
                : this.isSigned;
            const dataIsSigned =
              typeof data.isSigned === "function"
                ? data.isSigned()
                : data.isSigned;
            const isCancun =
              typeof this.isCancun === "function"
                ? this.isCancun()
                : this.isCancun;
            const dataIsCancun =
              typeof data.isCancun === "function"
                ? data.isCancun()
                : data.isCancun;
            const isLegacy =
              typeof this.isLegacy === "function"
                ? this.isLegacy()
                : this.isLegacy;
            const dataIsLegacy =
              typeof data.isLegacy === "function"
                ? data.isLegacy()
                : data.isLegacy;
            const isBerlin =
              typeof this.isBerlin === "function"
                ? this.isBerlin()
                : this.isBerlin;
            const dataIsBerlin =
              typeof data.isBerlin === "function"
                ? data.isBerlin()
                : data.isBerlin;
            const isLondon =
              typeof this.isLondon === "function"
                ? this.isLondon()
                : this.isLondon;
            const dataIsLondon =
              typeof data.isLondon === "function"
                ? data.isLondon()
                : data.isLondon;

            return (
              this.id === data.id &&
              this.amount === data.amount &&
              this.date?.getTime() === data.date?.getTime() &&
              this.description === data.description &&
              this.nonce === data.nonce &&
              this.gasLimit === data.gasLimit &&
              this.gasPrice === data.gasPrice &&
              this.maxPriorityFeePerGas === data.maxPriorityFeePerGas &&
              this.maxFeePerGas === data.maxFeePerGas &&
              this.data === data.data &&
              this.value === data.value &&
              this.chainId === data.chainId &&
              this.from === data.from &&
              this.fromPublicKey === data.fromPublicKey &&
              this.to === data.to &&
              this.type === data.type &&
              this.typeName === data.typeName &&
              this.serialized === data.serialized &&
              this.unsignedSerialized === data.unsignedSerialized &&
              this.accessList?.length === data.accessList?.length &&
              this.maxFeePerBlobGas === data.maxFeePerBlobGas &&
              this.blobVersiHashes === data.blobVersionedHashes &&
              (isSigned ?? false) === (dataIsSigned ?? false) &&
              (isCancun ?? false) === (dataIsCancun ?? false) &&
              (isLegacy ?? false) === (dataIsLegacy ?? false) &&
              (isBerlin ?? false) === (dataIsBerlin ?? false) &&
              (isLondon ?? false) === (dataIsLondon ?? false)
            );
          },
          recentActivity: [
            {
              action: "Logged in",
              timestamp: new Date(),
            },
            {
              action: "Updated profile",
              timestamp: new Date(),
            },
          ],
        }),
      ],
    },
  },
};

const documentManager = useDocumentManagement();

const {
  snapshotId,
  snapshotContainer,
  criteria,
  category,
  categoryProperties,
  delegate,
  snapshotData,
  timestamp,
  tags,
  initialState
} = storeProps;



// Create baseConfig by spreading the instance and adding your overrides
const baseConfig: SnapshotStoreConfig<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields> = {
  ...snapshotStoreConfigInstance,
  // Override only the properties you need to change
  snapshotId: snapshotId ?? snapshotStoreConfigInstance.snapshotId,
  snapshotContainer: snapshotContainer ?? snapshotStoreConfigInstance.snapshotContainer,
  criteria: criteria ?? snapshotStoreConfigInstance.criteria,
  category: category ?? snapshotStoreConfigInstance.category,
  categoryProperties: categoryProperties ?? snapshotStoreConfigInstance.categoryProperties,

  timestamp: timestamp ?? new Date(),
  tags: tags ?? snapshotStoreConfigInstance.tags,
  delegate: delegate ?? snapshotStoreConfigInstance.delegate,
  initialState: initialState ?? snapshotStoreConfigInstance.initialState,
}

// Params[0] → T

// Params[1] → K

// Params[2] → Meta

// Params[3] → ExcludedFields


type SnapshotConfigFromParams<Params extends SnapshotConfigParams<any, any, any, any>> = SnapshotConfig<Params[0], Params[1], Params[2], Params[3], Params[4], Params[5]>;

type MyParams = SnapshotConfigParams<BaseDataEntity, BaseDataEntity, DefaultMeta<BaseDataEntity, BaseDataEntity>, keyof BaseDataEntity>;

// Define proper type aliases instead of using the tuple directly
type MyEntity = BaseDataEntity;
type MyK = MyEntity;
type MyMeta = DefaultMeta<MyEntity, MyK>;
type MyExcludedFields = DefaultExcludedFields<MyEntity>;

// Use these types instead of MyParams tuple
type MySnapshot = Snapshot<MyEntity, MyK, MyMeta, MyExcludedFields>;
type MySnapshotData = SnapshotData<MyEntity, MyK, MyMeta, MyExcludedFields>;
type MySnapshotStore = SnapshotStore<MyEntity, MyK, MyMeta, MyExcludedFields>;
type MySubscriberCollection = SubscriberCollection<MyEntity, MyK, MyMeta, MyExcludedFields>;
type MyRealtimeDataItem = RealtimeDataItem<MyEntity, MyK, MyMeta, MyExcludedFields>;
type MySnapshotWithCriteria = SnapshotWithCriteria<MyEntity, MyK, MyMeta, MyExcludedFields>;

const snapshotConfig: SnapshotConfig<MyEntity, MyK, MyMeta, MyExcludedFields> = {
  ...baseConfig,
  id: "configId",
  data: {
    id: "data1",
    title: "Data Title",
    // Add other BaseDataEntity properties if needed
  },

  events: {
    event: "created event",
    unsubscribeDetails: {
      userId: "user1", // Sample user ID
      snapshotId: "snapshot1",
      unsubscribeType: "type1",
      unsubscribeDate: new Date(),
      unsubscribeReason: "reason",
      unsubscribeData: null,
    },
    subscribers: [],
    eventIds: [],
    callback: (snapshot: Snapshot<MyEntity, MyK, MyMeta, MyExcludedFields>) => {},
    eventRecords: {
      created: [
        {
          action: "Created snapshot",
          timestamp: new Date(),
          record: new CalendarManagerStoreClass<MyEntity, MyK, MyMeta, MyExcludedFields>(
            category,
            documentManager,
            storeProps
          ),
          callback: (snapshot: Snapshot<MyEntity, MyK, MyMeta, MyExcludedFields>) => {
            console.log("Snapshot created:", snapshot);
          },
          // Add other BaseDataEntity properties if needed
        },
      ],
      updated: [
        {
          action: "Updated snapshot",
          timestamp: new Date(),
          record: new CalendarManagerStoreClass<MyEntity, MyK, MyMeta, MyExcludedFields>(
            category,
            documentManager,
            storeProps
          ),
          callback: (snapshot: Snapshot<MyEntity, MyK, MyMeta, MyExcludedFields>) => {
            console.log("Snapshot updated:", snapshot);
          },
          // Add other BaseDataEntity properties if needed
        },
      ],
    },

    onSnapshotAdded: (snapshot: Snapshot<MyEntity, MyK, MyMeta, MyExcludedFields>) => {
      console.log("Snapshot added:", snapshot);
    },

    onSnapshotRemoved: (snapshotId: string) => {
      console.log("Snapshot removed:", snapshotId);
    },

    onSnapshotUpdated: (
      snapshot: Snapshot<MyEntity, MyK, MyMeta, MyExcludedFields>,
      updates: Partial<MyParams>
    ) => {
      console.log("Snapshot updated:", snapshot, updates);
    },

    removeSubscriber: (
      event: string,
      snapshotId: string,
      subscriberId: string
    ) => {
      console.log(`Removed subscriber ${subscriberId} from snapshot ${snapshotId}`);
    },

    trigger: (
      event:
        | string
        | CombinedEvents<MyEntity, MyK, MyMeta, MyExcludedFields>
        | SnapshotEvents<MyEntity, MyK, MyMeta, MyExcludedFields>,
      snapshot: Snapshot<MyEntity, MyK, MyMeta, MyExcludedFields>,
      eventDate: Date,
      snapshotId: string,
      subscribers: SubscriberCollection<MyEntity, MyK, MyMeta, MyExcludedFields>,
      type: string,
      snapshotData: SnapshotData<MyEntity, MyK, MyMeta, MyExcludedFields>
    ) => {
      // Implement your trigger logic here
    },

    on: (
      event:
        | string
        | CombinedEvents<MyEntity, MyK, MyMeta, MyExcludedFields>
        | SnapshotEvents<MyEntity, MyK, MyMeta, MyExcludedFields>,
      // event: string,
      callback: (snapshot: Snapshot<MyEntity, MyK, MyMeta, MyExcludedFields>) => void,
      snapshotId: string,
      subscribers: SubscriberCollection<MyEntity, MyK, MyMeta, MyExcludedFields>,
      type: string,
      snapshotData: SnapshotData<MyEntity, MyK, MyMeta, MyExcludedFields>
    ) => {
      // Implement your on logic here
    },
    off: (
      // event: string | CombinedEvents<MyEntity, MyK, MyMeta, MyExcludedFields> | SnapshotEvents<MyEntity, MyK, MyMeta, MyExcludedFields>,
      event: string,
      callback: (snapshot: Snapshot<MyEntity, MyK, MyMeta, MyExcludedFields>) => void,
      snapshotId: string,
      subscribers: SubscriberCollection<MyEntity, MyK, MyMeta, MyExcludedFields>,
      type: string,
      snapshotData: SnapshotData<MyEntity, MyK, MyMeta, MyExcludedFields>,
      unsubscribeDetails?: {
        userId: string;
        snapshotId: string;
        unsubscribeType: string;
        unsubscribeDate: Date;
        unsubscribeReason: string;
        unsubscribeData: any;
      }
    ) => {
      // Implement your off logic here
    },
    emit: (
      //todo update to use
      // event: string | CombinedEvents<MyEntity, MyK, MyMeta, MyExcludedFields> | SnapshotEvents<MyEntity, MyK, MyMeta, MyExcludedFields>,
      event: string,
      snapshot: Snapshot<MyEntity, MyK, MyMeta, MyExcludedFields>,
      snapshotId: string,
      subscribers: SubscriberCollection<MyEntity, MyK, MyMeta, MyExcludedFields>,
      type: string,
      snapshotStore: SnapshotStore<MyEntity, MyK, MyMeta, MyExcludedFields>,
      dataItems: RealtimeDataItem<MyEntity, MyK, MyMeta, MyExcludedFields>[],
      criteria: SnapshotWithCriteria<MyEntity, MyK, MyMeta, MyExcludedFields>,
      category: Category,
      snapshotData: SnapshotData<MyEntity, MyK, MyMeta, MyExcludedFields>
    ) => {
      // Implement your emit logic here
    },

    initialConfig: {} as InitializedConfig,
    records: {} as Record<
      string,
      CalendarManagerStoreClass<MyEntity, MyK, MyMeta, MyExcludedFields>[]
    >,
    onInitialize: (callback: () => void) => {},
    subscribe: (
      snapshotId: string,
      event: string,
      callback: (snapshot: Snapshot<MyEntity, MyK, MyMeta, MyExcludedFields>) => void
    ) => {},
    callbacks: {
      default: [
        (snapshot: Snapshot<MyEntity, MyK, MyMeta, MyExcludedFields>) => {
          // Convert Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> to a format that can be used with Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
          const snapshotsMap = convertSnapshotToMap(snapshot);

          // Assuming convertSnapshotToMap returns a Map or similar structure
          // If Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> is a Map, this will be appropriate
          const snapshots: Map<string, any> = snapshotsMap;

          // Return the appropriate result or handle the snapshots as needed
          return snapshots;
        },
      ],
    },
  },

  equals: function (data: Snapshot<MyEntity, MyK, MyMeta, MyExcludedFields>): Promise<boolean> {
    if (
      this.tags === undefined ||
      this.data === null ||
      this.data === undefined
    ) {
      throw new Error("Can't find tags or data");
    }
   // Cast 'this' to the appropriate type for type safety
    const self = this as unknown as Snapshot<MyEntity, MyK, MyMeta, MyExcludedFields>;

    return Promise.resolve(
      self.id === data.id &&
      self.category === data.category &&
      (self.timestamp instanceof Date && data.timestamp instanceof Date
        ? self.timestamp.getTime() === data.timestamp.getTime()
        : self.timestamp === data.timestamp) &&
      self.createdBy === data.createdBy &&
      self.description === data.description &&
      self.tags.length === (data.tags?.length ?? 0) &&
      self.metadata === data.metadata &&
      ("id" in self.data && data.data && "id" in data.data
        ? self.data.id === data.data.id
        : true) &&
      ("title" in self.data && data.data && "title" in data.data
        ? self.data.title === data.data.title
        : true) &&
      self.initialState === data.initialState &&
      (self.meta instanceof Map && data.meta instanceof Map
        ? self.meta.size === data.meta.size
        : true) &&
      self.events &&
      data.events &&
      self.events.eventRecords &&
      data.events.eventRecords &&
      typeof self.events.eventRecords === "object" &&
      typeof data.events.eventRecords === "object" &&
      Object.keys(self.events.eventRecords).length ===
        Object.keys(data.events.eventRecords).length &&
      Object.keys(self.events.eventRecords).every((key: string) => {
        const thisRecords = self.events!.eventRecords![key];
        const dataRecords = data.events!.eventRecords![key];

        if (!dataRecords || thisRecords.length !== dataRecords.length) {
          return false;
        }

        return thisRecords.every((record: EventRecord<MyEntity, MyK, MyMeta, MyExcludedFields>, index: number) => {
          const dataRecord = dataRecords[index];
          if (!dataRecord) return false;

          const isActionEqual = record.action === dataRecord.action;
          const isTimestampEqual =
            record.timestamp instanceof Date && dataRecord.timestamp instanceof Date
              ? record.timestamp.getTime() === dataRecord.timestamp.getTime()
              : record.timestamp === dataRecord.timestamp;

          return isActionEqual && isTimestampEqual;
        });
      })
    );
  },
  recentActivity: [
    {
      action: "Logged in",
      timestamp: new Date(),
    },
    {
      action: "Updated profile",
      timestamp: new Date(),
    },
    {
      action: "Created snapshot",
      timestamp: new Date(),
    },
    {
      action: "Updated snapshot",
      timestamp: new Date(),
    },
    {
      action: "Logged out",
      timestamp: new Date(),
    },
  ] as { action: string; timestamp: Date }[],
  hasSnapshots: async () => false,
  initialConfig: {},
  mappedSnapshotData: {} as Map<string, Snapshot<MyEntity, MyK, MyMeta, MyExcludedFields>>,
  initializedState: {},
  restoreSnapshot: {} as (id: string,
    snapshot: Snapshot<MyEntity, MyK, MyMeta, MyExcludedFields>,
    snapshotId: string,
    snapshotData: SnapshotData<MyEntity, MyK, MyMeta, MyExcludedFields>
  ) => {}
} as const;

async function createDataObject(
  plainDataObject: Record<string, BaseDataEntity>,
  baseData: BaseDataEntity,
  baseMeta: Map<string, Snapshot<MyEntity, MyK, MyMeta, MyExcludedFields>>
): Promise<Map<string, Snapshot<MyEntity, MyK, MyMeta, MyExcludedFields>>> {
  
  try {
    const snapshotPromises = Object.entries(plainDataObject).map(
      async ([key, value]) => {
        try {
          const snapshot = await SnapshotBuilder(value)
            .withKey(value)
            .configure({
              meta: {
                timestamp: new Date(),
                entityType: value.constructor.name,
                version: 1
              }
            })
            .build();
          
          return [key, snapshot] as [
            string,
            Snapshot<MyEntity, MyK, MyMeta, MyExcludedFields>
          ];
        } catch (error) {
          console.error(`Failed to create snapshot for key ${key}:`, error);
          throw error;
        }
      }
    );

    const snapshotResults = await Promise.all(snapshotPromises);
    return new Map(snapshotResults);
    
  } catch (error) {
    console.error('Failed to create data object:', error);
    throw new Error('Data object creation failed');
  }
}

const getCurrentSnapshot = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  snapshotId: string, // ID of the snapshot to retrieve
  storeId: number,
  additionalHeaders?: Record<string, string>,
  snapshotConfigProps?: SnapshotConfigProps<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  category?: Category, // Optional category
  snapshotStore?: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> // Optional store to retrieve from
): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null> => {
  return new Promise((resolve, reject) => {
    try {
      // Fetch the SnapshotContainer if not provided
      const snapshotContainer = snapshotStore
        ? snapshotStore.getSnapshotContainer(snapshotId)
        : snapshotApi.getSnapshotContainer(
            snapshotId,
            storeId,
            additionalHeaders
          );

      // If category is provided, look for the current snapshot by category
      if (category) {
        const snapshotByCategory =
          snapshotContainer.getSnapshotCategory(snapshotId);
        if (snapshotByCategory) {
          resolve(snapshotByCategory); // Resolve with the found snapshot
          return;
        }
      }

      // Fallback to fetch by ID if no category match
      const snapshot = snapshotContainer.mappedSnapshotData.get(snapshotId);
      resolve(snapshot || null);
    } catch (error) {
      console.error(`Error fetching snapshot for ID: ${snapshotId}`, error);
      reject(error); // Reject with error if something goes wrong
    }
  });
};

// Usage example
const baseData: BaseData = createBaseData({ ...snapshotData });

createDataObject(plainDataObject, baseData, baseMeta).then((dataObject) => {
  console.log(dataObject);
});

const snapshot: Snapshot<MyEntity, MyK, MyMeta, MyExcludedFields> = {
  id: "snapshot1",
  category: "example category",
  timestamp: new Date(),
  createdBy: "creator1",
  description: "Sample snapshot description",
  tags: {},
  metadata: {
    area: 'snapshot-area',
    metadataEntries: []
  },
  data: {
    id: "data1",
    title: "Data Title",
    // Add other BaseDataEntity properties if needed
  },
  initialState: undefined,
  meta: meta,
  events: {
    eventRecords: [
      {
        action: "Created snapshot",
        timestamp: new Date(),
        id: "",
        title: "",
        content: "",
        topics: [],
        highlights: [],
        files: [],
        date: undefined,
        meta: undefined,
        rsvpStatus: "yes",
        participants: [],
        teamMemberId: "",
        getSnapshotStoreData: (): Promise<
          SnapshotStore<
            SnapshotWithCriteria<BaseDataEntity, K>,
            SnapshotWithCriteria<BaseDataEntity, K>
          >[]
        > => {
          throw new Error("Function not implemented.");
        },
        getData: getData(id, snapshotStore),
      },
      {
        action: "Edited snapshot",
        timestamp: new Date(),
        id: "",
        title: "",
        content: "",
        topics: [],
        highlights: [],
        files: [],
        date: undefined,
        meta: undefined,
        rsvpStatus: "yes",
        participants: [],
        teamMemberId: "",
        getSnapshotStoreData: function (): Promise<
          SnapshotStore<
            SnapshotWithCriteria<BaseDataEntity>,
            SnapshotWithCriteria<BaseDataEntity>
          >[]
        > {
          throw new Error("Function not implemented.");
        },
        getData: function (): Promise<
          Snapshot<
            SnapshotWithCriteria<BaseDataEntity>,
            SnapshotWithCriteria<BaseDataEntity>
          >[]
        > {
          throw new Error("Function not implemented.");
        },
      },
    ],
  },

  update: {
    getSnapshotId: (
      key: string | SnapshotData<MyEntity, MyK, MyMeta, MyExcludedFields>,
      snapshot: Snapshot<MyEntity, MyK, MyMeta, MyExcludedFields>
    ): unknown => {
      if (typeof key === "string") {
        return key;
      } else {
        // Type assertion with proper checking
        const entity = key as unknown as Record<string, unknown>;
        
        // Check for common ID field names
        if (entity._id !== undefined) return entity._id;
        if (entity.id !== undefined) return entity.id;
        if (entity.uid !== undefined) return entity.uid;
        if (entity.ID !== undefined) return entity.ID;
        
        throw new Error('Could not determine ID from snapshot data');
      }
    },
  },

  compareSnapshotState: function (
    snapshot: Snapshot<MyEntity, MyK, MyMeta, MyExcludedFields> | null,
    state: any
  ): boolean {
    if (!snapshot || !snapshot.timestamp || !snapshot.tags || !snapshot.data) {
      return false;
    }
    // Implement specific comparison logic based on the properties of snapshot and state
    return (
      snapshot.id === state.id &&
      snapshot.category === state.category &&
      snapshot.timestamp === new Date(state.timestamp).getTime() &&
      snapshot.createdBy === state.createdBy &&
      snapshot.description === state.description &&
      snapshot.tags.join(",") === state.tags.join(",") &&
      JSON.stringify(snapshot.metadata) === JSON.stringify(state.metadata) &&
      "id" in snapshot.data &&
      "id" in state.data &&
      snapshot.data.id === state.data.id &&
      "title" in snapshot.data &&
      "title" in state.data &&
      snapshot.data.title === state.data.title
      // Add other property comparisons as needed
    );
  },
  eventRecords: null,
  snapshotStore: null,
  getParentId: function (): string | null {
    return this.parentId || null;
  },
  getChildIds: function (): string[] {
    return this.metadata.childIds || [];
  },
  addChild: function (
    parentId: string,
    childId: string,
    childSnapshot: CoreSnapshot<
      BaseDataEntity<any, any, any>,
      BaseDataEntity<any, any, any>,
      never
    >
  ): void {
    if (!this.metadata.childIds) {
      this.metadata.childIds = [];
    }
    this.metadata.childIds.push(childSnapshot.id);
    // Ensure the child snapshot has the current snapshot as its parent
    childSnapshot.metadata.parentId = this.id;
  },
  removeChild: function (
    childId: string,
    parentId: string,
    parentSnapshot:  Snapshot<MyEntity, MyK, MyMeta, MyExcludedFields>,
    childSnapshot: Snapshot<MyEntity, MyK, MyMeta, MyExcludedFields>
  ): void {
    if (!this.metadata.childIds) {
      return;
    }
    this.metadata.childIds = this.metadata.childIds.filter(
      (id: string) => id !== childSnapshot.id
    );
    // Remove the current snapshot as the parent of the child snapshot
    childSnapshot.metadata.parentId = null;
  },
  getChildren: function (): Snapshot<MyEntity, MyK, MyMeta, MyExcludedFields>[] {
    // Ensure dataObject is available or create it if not present
    if (!this.dataObject) {
      createDataObject(plainDataObject, baseData, baseMeta)
        .then((dataObject) => {
          this.dataObject = dataObject; // Store the dataObject after creation
        })
        .catch((error) => {
          console.error("Error creating dataObject:", error);
        });
    }

    // Return the children based on the childIds or an empty array
    return this.metadata.childIds
      ? this.metadata.childIds.map((id: string) => this.dataObject?.get(id)) // Use the stored dataObject
      : [];
  },
  hasChildren: function (): boolean {
    return this.metadata.childIds && this.metadata.childIds.length > 0;
  },
  isDescendantOf: function (
    childId: string,
    parentId: string,
    parentSnapshot: Snapshot<MyEntity, MyK, MyMeta, MyExcludedFields>,
    childSnapshot: Snapshot<MyEntity, MyK, MyMeta, MyExcludedFields>
  ): boolean {
    const childIds = this.getChildIds(childSnapshot);
    if (Array.isArray(childIds)) {
      return childIds.includes(parentSnapshot.id);
    }
    return false;
  },
  dataItems: null,
  newData: null,
  stores: null,
  getStore: function (
    storeId: number,
    snapshotStore: SnapshotStore<MyEntity, MyK, MyMeta, MyExcludedFields>,
    snapshotId: string | null,
    snapshot: Snapshot<MyEntity, MyK, MyMeta, MyExcludedFields>,
    snapshotStoreConfig: SnapshotStoreConfig<MyEntity, MyK, MyMeta, MyExcludedFields>,
    type: string,
    event: Event
  ): SnapshotStore<MyEntity, MyK, MyMeta, MyExcludedFields> | null {

    const {
      schema,
      expirationDate,
      callback,
      endpointCategory,
      initialState,
      name
    } = storeProps
    return new SnapshotStore<MyEntity, MyK, MyMeta, MyExcludedFields>({
      storeId,
      name,
      version,
      schema,
      options,
      category,
      config,
      operation,
      expirationDate,
      payload, callback, storeProps, endpointCategory, initialState
    });
  },
  addStore: function (
    storeId: number,
    snapshotStore: SnapshotStore<MyEntity, MyK, MyMeta, MyExcludedFields>,
    snapshotId: string,
    snapshot: Snapshot<MyEntity, MyK, MyMeta, MyExcludedFields>,
    type: string,
    event: Event
  ): SnapshotStore<MyEntity, MyK, MyMeta, MyExcludedFields> | null {
    if (!this.stores) {
      this.stores = [];
    }
    // verify if store is already added
    if (this.stores[storeId]) {
      return null;
    }
    this.stores[storeId] = snapshotStore;
    return snapshotStore;
  },

  mapSnapshot: function (
    storeId: number,
    snapshotStore: SnapshotStore<MyEntity, MyK, MyMeta, MyExcludedFields>,
    snapshotId: string,
    snapshot: Snapshot<MyEntity, MyK, MyMeta, MyExcludedFields>,
    type: string,
    event: SnapshotEvent<MyEntity, MyK, MyMeta, MyExcludedFields>,
    subscribers?: SubscriberCollection<MyEntity, MyK, MyMeta, MyExcludedFields>
  ): Snapshot<MyEntity, MyK, MyMeta, MyExcludedFields> | null {
    if (!this.stores) {
      this.stores = [];
    }

    // Verify if store is already added
    if (!this.stores[storeId]) {
      this.stores[storeId] = snapshotStore;
    }

    const store = this.stores[storeId];

    // Verify if store is already removed
    if (!store) {
      console.warn(`Store with ID ${storeId} does not exist.`);
      return snapshot;
    }

    switch (type) {
      case "add":
        store.addSnapshot(snapshot, snapshotId, subscribers);
        break;
      case "remove":
        store.removeSnapshot(snapshotId);
        break;
      case "update":
        store.updateSnapshot(snapshotId, snapshot);
        break;
      default:
        console.warn(`Unsupported type: ${type}`);
    }

    console.log(
      `Handled snapshot with ID: ${snapshotId} for store ID: ${storeId} with event type: ${type}`,
      event
    );

    return snapshot;
  },
  removeStore: function (
    storeId: number,
    store: SnapshotStore<MyEntity, MyK, MyMeta, MyExcludedFields>,
    snapshotId: string,
    snapshot: Snapshot<MyEntity, MyK, MyMeta, MyExcludedFields>,
    type: string,
    event: Event
  ): void {
    throw new Error("Function not implemented.");
  },
  unsubscribe: function (
    snapshotId: string | number | null,
    unsubscribe: UnsubscribeDetails,
    subscriber: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null,
    data: T,
    event: SnapshotEvent<MyEntity, MyK, MyMeta, MyExcludedFields>,
    callback: Callback<SnapshotContext<MyEntity, MyK, MyMeta, MyExcludedFields>>,
    value: T
  ): [] | SnapshotsArray<MyEntity, MyK, MyMeta, MyExcludedFields> {
    throw new Error("Function not implemented.");
  },
  addSnapshotFailure: function (
    snapshotManager: SnapshotManager<MyEntity, MyK, MyMeta, MyExcludedFields>,
    snapshot: Snapshot<MyEntity, MyK, MyMeta, MyExcludedFields>,
    payload: { error: Error }
  ): void {
    throw new Error("Function not implemented.");
  },
  configureSnapshotStore: function (
    snapshotStore: SnapshotStore<BaseDataEntity, BaseDataEntity>,
    snapshotId: string,
    data: Map<string, Snapshot<BaseDataEntity, BaseDataEntity>>,
    events: Record<string, CalendarEvent<BaseDataEntity, BaseDataEntity>[]>,
    dataItems: RealtimeDataItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
    newData: Snapshot<BaseDataEntity, BaseDataEntity>,
    payload: ConfigureSnapshotStorePayload<BaseDataEntity>,
    store: SnapshotStore<any, BaseDataEntity>,
    callback: (
      snapshotStore: SnapshotStore<BaseDataEntity, BaseDataEntity>
    ) => void
  ): void | null {
    throw new Error("Function not implemented.");
  },
  updateSnapshotSuccess: function (
    snapshotId: string,
    snapshotManager: SnapshotManager<BaseDataEntity, BaseDataEntity>,
    snapshot: Snapshot<BaseDataEntity, BaseDataEntity>,
    payload: { error: Error }
  ): void | null {
    throw new Error("Function not implemented.");
  },
  createSnapshotFailure: function (
    snapshotId: string,
    snapshotManager: SnapshotManager<BaseDataEntity, BaseDataEntity>,
    snapshot: Snapshot<BaseDataEntity, BaseDataEntity>,
    payload: { error: Error }
  ): Promise<void> {
    throw new Error("Function not implemented.");
  },
  createSnapshotStores: function (
    id: string,
    snapshotId: string,
    snapshot: Snapshot<BaseDataEntity, BaseDataEntity>,
    napshotStore: SnapshotStore<BaseDataEntity, BaseDataEntity>,
    snapshotManager: SnapshotManager<BaseDataEntity, BaseDataEntity>,
    payload: CreateSnapshotStoresPayload<BaseDataEntity, BaseDataEntity>,
    callback: (
      snapshotStore: SnapshotStore<BaseDataEntity, BaseDataEntity>[]
    ) => void | null,
    snapshotStoreData?:
      | SnapshotStore<BaseDataEntity, BaseDataEntity>[]
      | undefined,
    category?: Category,
    snapshotDataConfig?:
      | SnapshotStoreConfig<BaseDataEntity, BaseDataEntity>[]
      | undefined
  ): SnapshotStore<BaseDataEntity, BaseDataEntity>[] | null {
    throw new Error("Function not implemented.");
  },

  handleSnapshot: function <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  id: string,
  snapshotId: string | number | null,
  snapshot: Data<T> | null,
  snapshotData: Data<T>,
  category?: Category,
  categoryProperties?: CategoryProperties,
  callback?: (snapshot: Data<T>) => void,
  snapshots?: SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  type?: string,
  event?: SnapshotEvents<MyEntity, MyK, MyMeta, MyExcludedFields>,
  snapshotContainer?: Data<T>,
  snapshotStoreConfig?: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null> {
  return new Promise(async (resolve, reject) => {
    try {
      const { handleError } = useErrorHandling();

      // Guard: snapshot cannot be null
      if (snapshot === null) {
        reject("Snapshot is null");
        return;
      }

      // Guard: snapshots array must be defined
      if (!snapshots) {
        reject("Snapshots array is undefined");
        return;
      }

      // Try to find an existing snapshot
      const existingSnapshot = snapshots.find((s) => s.id === snapshotId);

      if (existingSnapshot) {
        // --- Update existing snapshot ---
        existingSnapshot.data = snapshotData;
        existingSnapshot.category = category;
        existingSnapshot.timestamp = new Date();

        // Callback for UI or other logic
        callback?.(existingSnapshot.data);

        // Emit snapshotUpdated event if available
        if (event) {
          const snapshotStore = snapshotStoreConfig?.snapshotStore;
          const subscribers = snapshotStore?.subscriberManagement.getSubscribers() || [];
          const criteria = snapshotStoreConfig?.criteria;

          event.emit(
            "snapshotUpdated",
            existingSnapshot,
            String(snapshotId),
            subscribers,
            type ?? "update",
            snapshotStore!,
            [],
            criteria!,
            category as Category,
            { id, data: snapshotData } as SnapshotData<MyEntity, MyK, MyMeta, MyExcludedFields>
          );
        }

        // Sync with snapshot store if configured
        if (snapshotStoreConfig) {
          const snapshotStore = snapshotStoreConfig.getSnapshotStore();
          snapshotStore?.addSnapshot(existingSnapshot);
        }

        resolve(existingSnapshot);
        return;
      }

      // --- Create new snapshot if it doesn’t exist ---
      const newSnapshot = await createSnapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(
        snapshotData,
        {} as Meta,
        snapshotId,
        category,
        snapshotStoreConfig?.snapshotStore,
        snapshotStoreConfig?.snapshotManager,
        snapshotStoreConfig,
        true, // isSubscribed
        snapshotStoreConfig?.storeProps,
        snapshotStoreConfig?.storeOptions
      );

      // Add to local snapshot list
      snapshots.push(newSnapshot);

      // Callback with the new snapshot
      callback?.(newSnapshot.data);

      // Emit snapshotCreated event
      if (event) {
        event.emit("snapshotCreated", newSnapshot);
      }

      // Add to store if snapshotStoreConfig is available
      if (snapshotStoreConfig) {
        const snapshotStore = snapshotStoreConfig.getSnapshotStore();
        snapshotStore?.addSnapshot(newSnapshot);
      }

      resolve(newSnapshot);
    } catch (error) {
      console.error("Error handling snapshot:", error);
      reject(error);
    }
  });
},
};

export { isCombinedEvents, processSnapshot, snapshot, snapshotConfig };
export type { Snapshot };

