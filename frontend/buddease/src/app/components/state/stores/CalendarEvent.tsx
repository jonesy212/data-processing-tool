// CalendarEvent.tsx
import { endpoints } from "@/app/api/ApiEndpoints";
import * as snapshotApi from "@/app/api/SnapshotApi";
import { StructuredMetadata } from "@/app/configs/StructuredMetadata";
import { updateCallback } from "@/app/pages/blog/UpdateCallbackUtils";
import useModalFunctions from "@/app/pages/dashboards/ModalFunctions";
import ScheduleEventModal from "@/app/ts/ScheduleEventModal";
import { makeAutoObservable } from "mobx";
import React from "react";
import {
  getDefaultDocumentOptions,
} from "../../documents/DocumentOptions";
import useRealtimeData from "../../hooks/commHooks/useRealtimeData";
import { BaseData, Data } from "../../models/data/Data";
import {
  PriorityTypeEnum,
  StatusType,
} from "../../models/data/StatusType";
import { Member } from "../../models/teams/TeamMembers";
import { AnalysisTypeEnum } from "../../projects/DataAnalysisPhase/AnalysisType";
import SnapshotStore from "../../snapshots/SnapshotStore";
import {
  NotificationType,
  NotificationTypeEnum,
  useNotification,
} from "../../support/NotificationContext";
import NOTIFICATION_MESSAGES from "../../support/NotificationMessages";
import { VideoData } from "../../video/Video";
import {
  AssignEventStore,
  ReassignEventResponse,
  useAssignEventStore,
} from "./AssignEventStore";
import CalendarSettingsPage from "./CalendarSettingsPage";
import { implementThen } from "./CommonEvent";
import { AllStatus } from "./DetailsListStore";
import { useStore } from "./StoreProvider";

import { getSnapshotConfig } from "@/app/api/SnapshotApi";
import { useDispatch } from "react-redux";
import { EventActions } from "../../actions/EventActions";
import { CalendarEvent } from "../../calendar/CalendarEvent";
import {
  AddEventPayload,
  CalendarActionPayload,
  CalendarActionType,
  RemoveEventPayload,
  SetEventStatusPayload,
  UpdateEventPayload,
} from "../../database/CalendarActionPayload";
import { combinedEvents } from "../../event/Event";
import { EventStore } from "../../event/EventStore";
import {
  useSnapshotManager,
} from "../../hooks/useSnapshotManager";
import { Category } from "../../libraries/categories/generateCategoryProperties";
import { SnapshotContainer, snapshotContainer, SnapshotData } from "../../snapshots";
import { Snapshot } from "../../snapshots/LocalStorageSnapshotStore";
import {
  SnapshotOperation,
  SnapshotOperationType,
} from "../../snapshots/SnapshotActions";
import { K, T } from "../../snapshots/SnapshotConfig";
import SnapshotManagerOptions from "../../snapshots/SnapshotManagerOptions";
import { SnapshotStoreConfig } from "../../snapshots/SnapshotStoreConfig";
import { SnapshotWithCriteria } from "../../snapshots/SnapshotWithCriteria";
import { Document, DocumentStore } from "./DocumentStore";
import { MobXRootState } from "./RootStores";
import { getCurrentSnapshotConfigOptions } from "../../snapshots/getCurrentSnapshotConfigOptions";
import { getCategoryProperties } from "../../libraries/categories/CategoryManager";


const dispatch = useDispatch()
type SnapshotWithCriteriaOrBase = Snapshot<any, BaseData> | SnapshotWithCriteria<any, BaseData>;

// export type RealTimeCollaborationTool = "google" | "microsoft" | "zoom" | "none";
const API_BASE_URL = endpoints.calendar.events;

const { notify } = useNotification();

const notifyPromise = Promise.resolve(
  useNotification().notify(
    "snapshotStore",
    "error",
    NOTIFICATION_MESSAGES.CalendarEvents.DEFAULT,
    new Date(),
    "Error" as NotificationType
  )
);

// Define a synchronous callback function that wraps the asynchronous operation
const notifyCallback = (): void => {
  notifyPromise
    .then(() => {
      // This code block will execute when the promise resolves
      // It's important to handle any errors or other logic here
    })
    .catch((error) => {
      // Handle any errors from the promise
      console.error("Error in notifyPromise:", error);
    });
};

interface CalendarEntities {
  events: CalendarEvent<Data, BaseData>[];
  participants: Member[];
  hosts: Member[];
  guestSpeakers: Member[]; // Add guestSpeakers array
  // Add more entities as needed
}

// Common interface for CalendarManager
interface CommonCalendarManagerMethods<T extends Data, K extends Data> {
  updateEventTitle: (title: string) => void;
  updateEventDescription: (eventId: string, description: string) => void;
  updateEventStatus: (eventId: string, status: AllStatus) => void;
  updateEventDate: (eventId: string, eventDate: Date) => void;
  addEvent: (event: CalendarEvent<T, K>) => void;
  addEvents: (eventsToAdd: CalendarEvent<T, K>[]) => void;
  removeEvent: (eventId: string) => void;
  removeEvents: (eventIds: string[]) => void;
  reassignEvent: (
    eventId: string,
    oldUserId: string,
    newUserId: string,
    newDate: Date,
    newStatus: AllStatus,
    reassignData: ReassignEventResponse[]
  ) => void;
  completeAllEvents: () => void;
  setDynamicNotificationMessage: (message: string) => void;
}

export type ActionType =
  | "CREATE_EVENT"
  | "UPDATE_EVENT"
  | "DELETE_EVENT"
  | "TOGGLE_EVENT_STATUS"
  | "NAVIGATE_TO_DATE";


interface ActionPayload {
  type: ActionType;
  payload: {
    eventId?: number;
    date?: string;
    eventData?: any;  // Replace with a proper event type
    status?: string;
  };
}

export interface CalendarManagerStore<
  T extends Data = BaseData,
  K extends Data = BaseData
> {
  // dispatch: (action: PayloadAction<any, string, any, any>) => void;
  openScheduleEventModal: (content: JSX.Element) => void;
  openCalendarSettingsPage: () => void;
    getData: (id: string) => Promise<Snapshot<T, K>>
  updateDocumentReleaseStatus: (id: number, eventId: number, status: string, isReleased: boolean) => void;
  getState: () => MobXRootState; // Add getState method
  // Logic for handling actions
  action: (actionPayload: ActionPayload) => void;
  events: Record<string, CalendarEvent<T, K>[]>;
  eventTitle: string;
  eventDescription: string;
  eventStatus: AllStatus;

  assignedEventStore: AssignEventStore;

  snapshotStore: SnapshotStore<T, K>;
  NOTIFICATION_MESSAGE: string;
  NOTIFICATION_MESSAGES: typeof NOTIFICATION_MESSAGES;
  updateEventTitle: (title: string) => void;
  updateEventDescription: (eventId: string, description: string) => void;
  updateEventStatus: (eventId: string, status: AllStatus) => void;
  updateEventDate: (eventId: string, eventDate: Date) => void;
  addEvent: (event: CalendarEvent<T, K>) => void;
  addEvents: (eventsToAdd: CalendarEvent<T, K>[]) => void;
  removeEvent: (eventId: string) => void;
  removeEvents: (eventIds: string[]) => void;
  reassignEvent: (
    eventId: string,
    oldUserId: string,
    newUserId: string,
    newDate: Date,
    newStatus: AllStatus,
    reassignData: ReassignEventResponse[]
  ) => void;

  addEventSuccess: (payload: { event: CalendarEvent<T, K> }) => void;
  fetchEventsSuccess: (payload: {
    calendarEvents: CalendarEvent<T, K>[];
  }) => void;
  fetchEventsFailure: (payload: { error: string }) => void;
  fetchEventsRequest: (
    eventIds: string[],
    events: Record<string, CalendarEvent<T, K>[]>
  ) => void;

  completeAllEventsSuccess: () => void;
  completeAllEvents: () => void;
  completeAllEventsFailure: (payload: { error: string }) => void;
  setDynamicNotificationMessage: (message: string) => void;
  handleRealtimeUpdate: (
    storeId: number,
    documentId: number,
    eventId: number,
    userId: string,
    events: Record<string, CalendarEvent<T, K>[]>,
    snapshotStore: 
    string 
    | SnapshotStoreConfig<T, K> 
    | null
    | undefined
  ) => void;
  getSnapshotDataKey: (
    documenttId: string,
    eventId: number,
    userId: string
  ) => void

  
}




class CalendarManagerStoreClass<T extends Data, K extends Data>
  implements CalendarManagerStore<T, K>, CommonCalendarManagerMethods<T, K> 
{
  getState: () => MobXRootState;
  events: Record<string, CalendarEvent<T, K>[]> = {
    scheduled: [],
    inProgress: [],
    completed: [],
  };
  eventTitle = "";
  eventDescription = "";
  eventStatus: AllStatus = StatusType.Pending;
  NOTIFICATION_MESSAGE = "";
  NOTIFICATION_MESSAGES = NOTIFICATION_MESSAGES;
  assignedEventStore: AssignEventStore;
  
  private documentManager: DocumentStore;
  
  // public action: CalendarActionType;
  public timestamp: Date;

  constructor(category: symbol | string | Category | undefined, documentManager: DocumentStore) {
    this.timestamp = new Date(); // Initialize default value
    this.category = category;
    this.entities = {
      events: [],
      participants: [],
      hosts: [],
      guestSpeakers: [],
    };
    const store = useStore();
    this.getState = store.getState.bind(store);
    this.callback = store.callback.bind(store);
    this.getSnapshotDataKey = store.getSnapshotDataKey.bind(store)
    this.getData = this.getData.bind(this);
    this.documentManager = documentManager;
    this.assignedEventStore = useAssignEventStore();
    this.setDocumentReleaseStatus = store.setDocumentReleaseStatus.bind(this);
    this.updateDocumentReleaseStatus = store.updateDocumentReleaseStatus.bind(this);
      // Initialize the new properties
    this.action = store.action.bind(this); // Example initial value (adjust based on your needs)
    this.timestamp = new Date();

    this.handleRealtimeUpdate = async (
      storeId: number,
      documentId: number,
      eventId: number,
      userId: string,
      events: Record<string, CalendarEvent<T, K>[]>,
      snapshotStore:
        | string
        | SnapshotStoreConfig<T, K>
        | null
        | undefined
    ) => {
      try {
        const key = this.getSnapshotDataKey(documentId, eventId, userId)
        const snapshotManager = await useSnapshotManager<T, K>(storeId);
        const snapshotId = await snapshotManager?.snapshotStore?.getSnapshotId(key);

        if (snapshotId === undefined || isNaN(parseInt(snapshotId, 10))) {
          console.error("Invalid snapshot ID:", snapshotId);
          return;
        }

        const snapshot = snapshotApi.getCurrentSnapshot(snapshotId, storeId)
        const criteria =  snapshotApi.extractCriteria(snapshot, properties)
        const categoryProperties = getCategoryProperties(this.category);
        // const snapshotId = snapshotApi.getSnapshotId(snapshot, snapshotId);
        const snapshotContainer = await snapshotApi.getSnapshotContainer<T, K>(snapshotId, storeId);
        
        const delegate = snapshotApi.c<T, K>(snapshotId, storeId);
        const config = snapshotApi.getSnapshotConfig<T, K>(
          snapshotId,
          snapshotContainer,
          criteria,
          this.category ? this.category : undefined,
          categoryProperties,
          delegate,
          snapshot
          
        );

        const options = getCurrentSnapshotConfigOptions(
          snapshotId,
          snapshotContainer,
          criteria,
          category,
          categoryProperties,
          delegate,
          snapshotData,
          snapshot,
          initSnapshot,
          subscribeToSnapshots,
          createSnapshot,
          createSnapshotStore,
          configureSnapshot
        );

        if (!config || !options) {
          console.error("Snapshot configuration or options not found for snapshotId:", snapshotIdNumber);
          return;
        }

        this.events = events;
        this.snapshotStore = new SnapshotStore<T, K>(
          storeId,
          options,
          category,
          config,
          operation
        )
      } catch (error) {
        console.error("Failed to handle real-time update:", error);
      }
    };

    this.openCalendarSettingsPage = () => {
      this.openScheduleEventModal(<CalendarSettingsPage />);
    };
    this.openScheduleEventModal = useModalFunctions().setModalContent;
    this.useRealtimeDataInstance = useRealtimeData(this.events, updateCallback);
    makeAutoObservable(this);
  }

  // Method to handle various actions
  action(type: CalendarActionType, payload: CalendarActionPayload<T, K>): void {
    switch (type) {
      case 'ADD_EVENT': {
        const { event } = payload as AddEventPayload<T, K>;
        this.events.scheduled.push(event);
        console.log(`Event added: ${event.title}`);
        break;
      }
      case 'UPDATE_EVENT': {
        const { eventId, updatedEvent } = payload as UpdateEventPayload<T, K>;
        const event = this.events.scheduled.find(e => e.id === eventId);
        if (event) {
          Object.assign(event, updatedEvent);
          console.log(`Event updated: ${eventId}`);
        } else {
          console.error(`Event with ID ${eventId} not found.`);
        }
        break;
      }
      case 'REMOVE_EVENT': {
        const { eventId } = payload as RemoveEventPayload;
        this.events.scheduled = this.events.scheduled.filter(e => e.id !== eventId);
        console.log(`Event removed: ${eventId}`);
        break;
      }
      case 'SET_EVENT_STATUS': {
        const { eventId, status } = payload as SetEventStatusPayload;
        const event = this.events.scheduled.find(e => e.id === eventId);
        if (event) {
          event.status = status;
          console.log(`Status updated for event ${eventId}: ${status}`);
        } else {
          console.error(`Event with ID ${eventId} not found.`);
        }
        break;
      }
      default:
        console.error(`Unknown action type: ${type}`);
    }
  }

  async initialize(storeId: number) {
    const options = await useSnapshotManager(storeId) 
      ? new SnapshotManagerOptions<T, K>().get() 
      : new SnapshotManagerOptions<T, K>({ /* your default options here */ }).get();
    
        
    const criteria = await snapshotApi.getSnapshotCriteria(
      snapshotContainer as unknown as SnapshotContainer<Data, Data>, 
      snapshot
    );

    const snapshotId = await snapshotApi.getSnapshotId(criteria);
    const config = await snapshotApi.getSnapshotStoreConfig(String(snapshotId),
      snapshotContainer,
      criteria,
      storeId
    )

    const category = await snapshotApi.getSnapshotCategory(snapshotContainer, snapshot);
    const categoryProperties = await snapshotApi.getSnapshotCategoryProperties(snapshotContainer, snapshot);
    const delegate = await snapshotApi.getSnapshotDelegate(snapshotContainer, snapshot);

    const snapConfig = getSnapshotConfig(
      String(snapshotId),
      snapshotContainer as unknown as SnapshotContainer<Data, Data>, 
      criteria,
      category,
      categoryProperties,
      delegate,
      config,
    )
    // const config = storeConfig as unknown as SnapshotStoreConfig<T, K>;
    const operation: SnapshotOperation = {
      // Provide the required operation details
      operationType: SnapshotOperationType.FindSnapshot,
    };
    this.snapshotStore = new SnapshotStore<T, K>(storeId, name, version, schema, options, this.category, config, operation);
  }


  callback: (snapshot: Snapshot<T, K>) => void;
  setDocumentReleaseStatus: (id: number, eventId: number, status: string, isReleased: boolean) => void;
  updateDocumentReleaseStatus: (id: number, eventId: number, status: string, isReleased: boolean) => void;
  snapshotStore: SnapshotStore<T, K> = {} as SnapshotStore<T, K>;
  useRealtimeDataInstance: ReturnType<typeof useRealtimeData>;
  handleRealtimeUpdate: (
    storeId: number,
    documentId: number,
    eventId: number,
    userId: string,
    events: Record<string, CalendarEvent<T, K>[]>,
    snapshotStore: string | SnapshotStoreConfig<T, K> | null | undefined
  ) => void;
  openCalendarSettingsPage: () => void;
  getSnapshotDataKey: (documentId: number, eventId: number, userId: string) => string;
  getData: (id: string) => Promise<Snapshot<T, K>> = (id: string) => {
    return new Promise((resolve, reject) => {
      try {
        // Fetch document from document manager
        const document = this.documentManager.getData(id);
        
        if (document) {
          // Convert Document to Snapshot if needed
          // You might need to implement a mapping function here if conversion is necessary
          const snapshot = this.convertDocumentToSnapshot(document);
          resolve(snapshot);
        } else {
          reject(new Error('Document not found'));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        reject(error); // Reject the promise with the error
      }
    });
  };

  // Example conversion function, adjust as needed
  private convertDocumentToSnapshot(document: Document): Snapshot<T, K> {
   
    // Utility function to ensure documentData matches type T
    function castDocumentData<T extends Data>(documentData: any): T {
        return documentData as T;
      }

     
  // Create a snapshot object using the properties of Document
  const snapshot: Snapshot<T, K> = {
   
    id: document.id,
    initialState: castDocumentData<T>(document.documentData), // Ensure document.data matches type T

    isCore: true, // Default value or derive from document if needed
    initialConfig: {} as K, // Initialize as empty or derive from document if applicable
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
    version: document.version,
    removeSubscriber: document.removeSubscriber,
    onInitialize: document.onInitialize,
    onError: document.onError,
    taskIdToAssign: document.taskIdToAssign,
   
    schema: document.schema,
    currentCategory: document.currentCategory,
    mappedSnapshotData: document.mappedSnapshotData,
    snapshot: document.snapshot,
    setCategory, applyStoreConfig, generateId, snapshotData,

    // Map any additional properties from Document to Snapshot if necessary
  };
    return snapshot;
  }
  openScheduleEventModal: (content: JSX.Element) => void;
  entities: CalendarEntities;
  category: Category;














  updateEventDescription(eventId: string, description: string): void {
    const event = this.events.scheduled.find((e) => e.id === eventId);

    if (event) {
      event.description = description;
      this.dispatch(
        EventActions.updateEventDescriptionSuccess({
          payload: {
            eventId: event.id,
            description: event.description,
          },
          meta: { timestamp: Date.now() },
        })
      );
    } else {
      this.dispatch(
        EventActions.updateEventDescriptionFailure({
          payload: { eventId, error: 'Event not found' },
          meta: { timestamp: Date.now() },
        })
      );
    }
  }

  updateEventStatus(eventId: string, status: AllStatus): void {
    const event = this.events.scheduled.find((e) => e.id === eventId);
    if (event) {
      event.status = status;
      this.dispatch(updateEventStatusSuccess(event));
    } else {
      this.dispatch(updateEventStatusFailure({ eventId }));
    }
  }

  updateEventDate(eventId: string, date: Date): void {
    const event = this.events.scheduled.find((e) => e.id === eventId);
    if (event) {
      event.date = date;
      this.dispatch(updateEventDateSuccess(event));
    } else {
      this.dispatch(updateEventDateFailure({ eventId }));
    }
  }

  addEvent(event: CalendarEvent<T, K>): void {
    this.events.scheduled.push(event);
    this.dispatch(addEventSuccess(event));
  }

  addEvents(events: CalendarEvent<T, K>[]): void {
    this.events.scheduled.push(...events);
    this.dispatch(addEventsSuccess(events));
  }

  removeEvent(eventId: string): void {
    const index = this.events.scheduled.findIndex((e) => e.id === eventId);
    if (index !== -1) {
      const [removedEvent] = this.events.scheduled.splice(index, 1);
      this.dispatch(removeEventSuccess(removedEvent));
    } else {
      this.dispatch(removeEventFailure({ eventId }));
    }
  }

  removeEvents(eventIds: string[]): void {
    eventIds.forEach((id) => this.removeEvent(id));
    this.dispatch(removeEventsSuccess(eventIds));
  }

  reassignEvent(
    eventId: string,
    oldUserId: string,
    newUserId: string,
    newDate: Date,
    newStatus: AllStatus,
    reassignData: ReassignEventResponse[]
  ): void {
    this.updateEventDate(eventId, newDate);
    this.updateEventStatus(eventId, newStatus);
  }

  completeAllEvents(): void {
    this.events.scheduled.forEach((event) => {
      event.status = StatusType.Completed;
      this.events.completed.push(event);
    });
    this.events.scheduled = [];
    this.dispatch(completeAllEventsSuccess());
  }

  fetchEventsRequest(): void {
    this.dispatch(fetchEventsRequestAction());
  }

  fetchEventsSuccess(events: CalendarEvent<T, K>[]): void {
    this.events.scheduled = events;
    this.dispatch(fetchEventsSuccessAction(events));
  }

  fetchEventsFailure(error: Error): void {
    this.dispatch(fetchEventsFailureAction(error));
  }

  completeAllEventsSuccess(): void {
    this.dispatch(completeAllEventsSuccessAction());
  }

  completeAllEventsFailure(error: Error): void {
    this.dispatch(completeAllEventsFailureAction(error));
  }

  addEventSuccess(event: CalendarEvent<T, K>): void {
    this.dispatch(addEventSuccessAction(event));
  }

  setDynamicNotificationMessage(message: string): void {
    // Implement method
  }

  updateEventTitle(title: string): void {
    // Implement method
  }
}


const useCalendarManagerStore = (): CalendarManagerStore => {
  return new CalendarManagerStoreClass();
};

function* fetchEventsRequest(): Generator<any, void, undefined> {
  yield { type: "CALENDAR_MANAGER/FETCH_EVENTS_REQUEST" };
}

function openCalendarSettingsPage(): void {
  // Open the settings page
  // You can add additional logic or trigger notifications as needed
  useModalFunctions().setIsModalOpen(true);

  // Render the CalendarSettingsPage component to a JSX element
  const calendarSettingsPageElement = <CalendarSettingsPage />;

  // Pass the JSX element directly to setModalContent
  useModalFunctions().setModalContent(calendarSettingsPageElement);
}

function openScheduleEventModal(eventId: string): void {
  // Open the modal with the eventId
  // You can add additional logic or trigger notifications as needed
  useModalFunctions().setIsModalOpen(true);

  // Render the ScheduleEventModal component to a JSX element
  const modalElement = (
    <ScheduleEventModal
      eventId={eventId}
      visible={true}
      onCancel={() => {
        useModalFunctions().setIsModalOpen(false);
      }}
    />
  );

  // Pass the JSX element directly to setModalContent
  useModalFunctions().setModalContent(modalElement);

  notify(
    "Modal content set",
    "Opening Schedule Event Modal",
    NOTIFICATION_MESSAGES.Data.PAGE_LOADING,
    new Date(),
    NotificationTypeEnum.OperationSuccess
  );
}

// Example function to convert events to the appropriate data format
function convertEventsToData(
  events: Record<string, CalendarEvent<T, K>[]>
): Data {
  const convertedData: Data = {
    scheduled: false,
    isCompleted: false,
    _id: "",
    id: "",
    title: "",
    status: StatusType.Pending,
    isActive: false,
    tags: {},
    phase: null,
    then: implementThen,
    analysisType: {} as AnalysisTypeEnum,
    analysisResults: [],
    videoUrl: "",
    videoThumbnail: "",
    videoDuration: 0,
    videoData: {} as VideoData,
    ideas: [],
  };

  // Iterate over each key-value pair in the events object
  Object.entries(events).forEach(([key, eventArray]) => {
    // Convert each event to the desired format and store it in the convertedData object
    convertedData[key] = eventArray.map((event) => ({
      id: event.id,
      title: event.title,
      start: event.startDate,
      end: event.endDate,
      // Add other properties as needed
    }));
  });

  return convertedData;
}

// Function to fetch Snapshot data
const fetchSnapshotData = async (): Promise<
  Snapshot<SnapshotWithCriteria<BaseData, BaseData>, SnapshotWithCriteria<BaseData, BaseData>>[]
> => {
  // Replace this with your actual data fetching logic
  return [
    // Mock data
    {
      // Fill in with actual Snapshot data
      id: "snapshot1",
      data: {} as SnapshotWithCriteria<BaseData, BaseData>,
      criteria: {} as SnapshotWithCriteria<BaseData, BaseData>,
      events: {
        scheduled: false,
        isCompleted: false,
        _id: "",
        id: "",
        title: "",
        status: StatusType.Pending,
        isActive: false,
        tags: [],
        phase: null,
        then: implementThen,
        analysisType: {} as AnalysisTypeEnum,
        analysisResults: [],
        videoUrl: "",
        videoThumbnail: "",
        videoDuration: 0,
        videoData: {} as VideoData,
        ideas: [],
        eventRecords,
        callbacks: [
          {
            completeAllEvents: {
              request: completeAllEventsRequest,
              success: completeAllEventsSuccess,
              failure: completeAllEventsFailure,
            },
            fetchEvents: {
              request: fetchEventsRequest,
              success: fetchEventsSuccess,
              failure: fetchEventsFailure,
            },
            openCalendarSettingsPage: {
              request: openCalendarSettingsPage,
              success: openCalendarSettingsPageSuccess,
              failure: openCalendarSettingsPageFailure,
            },
            openScheduleEventModal: {
              request: openScheduleEventModal,
              success: openScheduleEventModalSuccess,
              failure: openScheduleEventModalFailure,
            },
          },
        ],
      },
      meta: {
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    } as Snapshot<
      SnapshotWithCriteria<BaseData, BaseData>,
      SnapshotWithCriteria<BaseData, BaseData>
    >,
  ];
};

// Function to fetch SnapshotStore data
const fetchSnapshotStoreData = async (): Promise<
  SnapshotStore<SnapshotWithCriteria<BaseData>, SnapshotWithCriteria<BaseData>>
> => {
  // You can also return a Promise that resolves to a SnapshotStore object
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        // Fill in with actual SnapshotStore data
        snapshots: [
          {
            id: "snapshot1",
            data: {} as SnapshotWithCriteria<BaseData>,
            criteria: {} as SnapshotWithCriteria<BaseData>,
          } as Snapshot<
            SnapshotWithCriteria<BaseData>,
            SnapshotWithCriteria<BaseData>
          >,
        ],
      } as SnapshotStore<SnapshotWithCriteria<BaseData>, SnapshotWithCriteria<BaseData>>);
    }, 2000);
  });
};

// Example usage:
export const eventRecords: Record<string, CalendarManagerStoreClass<T, K>[]> = {
  "2024-02-08": [
    {
      _id: "",
      id: "1",
      title: "Meeting",
      date: new Date("2024-02-08T09:00:00"),
      startDate: new Date(),
      endDate: new Date(),
      metadata: {} as StructuredMetadata,
      rsvpStatus: "notResponded",
      host: {} as Member,
      color: "",
      isImportant: false,
      teamMemberId: "0",
      status: StatusType.Pending,
      isCompleted: false,
      isActive: false,
      tags: [],
      priority: {} as PriorityTypeEnum.High,
      phase: null,
      participants: [],
      ideas: [],
      getSnapshotStoreData: async () => {
        return fetchSnapshotStoreData();
      },
      getData: async () => {
        return fetchSnapshotData();
      },

      analysisType: {} as AnalysisTypeEnum,
      analysisResults: [],
      videoData: {} as VideoData,
      content: "content",
      topics: [],
      highlights: [],
      files: [],
      options: getDefaultDocumentOptions(),
    },
    // Add more events for other dates as needed
  ],
  // Add more dates with corresponding events as needed
};


// Use CombinedEvents in SnapshotData
const snapshotData: SnapshotData<T, K> = {
  then: (callback: (newData: Snapshot<T, K>) => void) => {
    // Implement logic to handle the snapshot of data
    const newData: Snapshot<T, K> = {
      category: "calendarEvents",
      timestamp: new Date(),
      data: {} as Data, // Provide actual data here
      events: combinedEvents,
    };
    callback(newData);
  },
};

export const calendarEvent: CalendarEvent<T, K> = {} as CalendarEvent;
//

export const convertedData = convertEventsToData(events);
console.log(convertedData);

export { fetchEventsRequest, updateCallback, useCalendarManagerStore };
export default CalendarManagerStoreClass;
export type { CalendarEntities, CalendarEvent };
