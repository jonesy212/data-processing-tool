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
import {
    useSnapshotManager,
} from "../../hooks/useSnapshotManager";
import { Category } from "../../libraries/categories/generateCategoryProperties";
import { SnapshotContainer, snapshotContainer } from "../../snapshots";
import { Snapshot } from "../../snapshots/LocalStorageSnapshotStore";
import {
    SnapshotOperation,
    SnapshotOperationType,
} from "../../snapshots/SnapshotActions";

import { CategoryKeys, getCategoryProperties } from "../../libraries/categories/CategoryManager";
import { allCategories } from "../../models/data/DataStructureCategories";
import { EventRecord } from "../../projects/DataAnalysisPhase/DataProcessing/DataStore";
import { getCurrentSnapshotConfigOptions } from "../../snapshots/getCurrentSnapshotConfigOptions";
import { SnapshotConfigProps } from "../../snapshots/SnapshotConfigProps";
import SnapshotManagerOptions from "../../snapshots/SnapshotManagerOptions";
import { SnapshotStoreConfig } from "../../snapshots/SnapshotStoreConfig";
import { SnapshotWithCriteria } from "../../snapshots/SnapshotWithCriteria";
import { FilterState } from "../redux/slices/FilterSlice";
import { Document, DocumentStore } from "./DocumentStore";
import { MobXRootState } from "./RootStores";


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
  events: CalendarEvent<Data, Meta, BaseData>[];
  participants: Member[];
  hosts: Member[];
  guestSpeakers: Member[]; // Add guestSpeakers array
  // Add more entities as needed
}

// Common interface for CalendarManager
interface CommonCalendarManagerMethods<T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T> {
  updateEventTitle: (title: string) => void;
  updateEventDescription: (eventId: string, description: string) => void;
  updateEventStatus: (eventId: string, status: AllStatus) => void;
  updateEventDate: (eventId: string, eventDate: Date) => void;
  addEvent: (event: CalendarEvent<T, Meta, K>) => void;
  addEvents: (eventsToAdd: CalendarEvent<T, Meta, K>[]) => void;
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
    getData: (id: string) => Promise<Snapshot<T, Meta, K>>
  updateDocumentReleaseStatus: (id: number, eventId: number, status: string, isReleased: boolean) => void;
  getState: () => MobXRootState; // Add getState method
  // Logic for handling actions
  action: (actionPayload: ActionPayload) => void;
  events: Record<string, CalendarEvent<T, Meta, K>[]>;
  eventTitle: string;
  eventDescription: string;
  eventStatus: AllStatus;

  assignedEventStore: AssignEventStore;

  snapshotStore: SnapshotStore<T, Meta, K>;
  NOTIFICATION_MESSAGE: string;
  NOTIFICATION_MESSAGES: typeof NOTIFICATION_MESSAGES;
  updateEventTitle: (title: string) => void;
  updateEventDescription: (eventId: string, description: string) => void;
  updateEventStatus: (eventId: string, status: AllStatus) => void;
  updateEventDate: (eventId: string, eventDate: Date) => void;
  addEvent: (event: CalendarEvent<T, Meta, K>) => void;
  addEvents: (eventsToAdd: CalendarEvent<T, Meta, K>[]) => void;
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

  addEventSuccess: (payload: { event: CalendarEvent<T, Meta, K> }) => void;
  fetchEventsSuccess: (payload: {
    calendarEvents: CalendarEvent<T, Meta, K>[];
  }) => void;
  fetchEventsFailure: (payload: { error: string }) => void;
  fetchEventsRequest: (
    eventIds: string[],
    events: Record<string, CalendarEvent<T, Meta, K>[]>
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
    events: Record<string, CalendarEvent<T, Meta, K>[]>,
    snapshotStore: 
    string 
    | SnapshotStoreConfig<T, Meta, K> 
    | null
    | undefined,
    properties: Array<keyof FilterState>
  ) => void;
  getSnapshotDataKey: (
    documenttId: string,
    eventId: number,
    userId: string
  ) => void

  
}




class CalendarManagerStoreClass<T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T>
  implements CalendarManagerStore<T, Meta, K>, CommonCalendarManagerMethods<T, Meta, K> 
{
  getState: () => MobXRootState;
  events: Record<string, CalendarEvent<T, Meta, K>[]> = {
    scheduled: [],
    inProgress: [],
    completed: [],
  };
  eventTitle = "";
  eventDescription = "";
  eventStatus: AllStatus = StatusType.Pending;
  NOTIFICATION_MESSAGE = "";
  NOTIFICATION_MESSAGES = NOTIFICATION_MESSAGES | undefined;
  assignedEventStore: AssignEventStore;
  
  private documentManager: DocumentStore<T>;
  private eventListeners: ((data: Snapshot<T, Meta, K>) => void)[]; // Listeners for data changes

  // Method to notify all listeners
  private notifyListeners(data: Snapshot<T, Meta, K>) {
    for (const listener of this.eventListeners) {
      listener(data); // Call each listener with the new data
    }
  }
  // public action: CalendarActionType;
  public timestamp: Date;

  constructor(category: symbol | string | Category | undefined, documentManager: DocumentStore) {
    this.timestamp = new Date(); // Initialize default value
    this.category = category;
    this.eventListeners = [],
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
      events: Record<string, CalendarEvent<T, Meta, K>[]>,
      snapshotStore:
        | string
        | SnapshotStoreConfig<T, Meta, K>
        | null
        | undefined,
      properties: Array<keyof FilterState>,
      snapshotConfigProps?: SnapshotConfigProps<T, Meta, K>
    ) => {
      try {
        const key = this.getSnapshotDataKey(documentId, eventId, userId)
        const snapshotManager = await useSnapshotManager<T, Meta, K>(storeId);
        const snapshotId = await snapshotManager?.snapshotStore?.getSnapshotId(key);

        if (snapshotId === undefined || isNaN(parseInt(snapshotId, 10))) {
          console.error("Invalid snapshot ID:", snapshotId);
          return;
        }

        
        const snapshot = snapshotApi.getCurrentSnapshot(snapshotId, storeId)
        if (!snapshot) {
          console.error("Snapshot not found for ID:", snapshotId);
          return;
        }

        if (!this.category) {
          throw Error("Category not found")
        }


        if (!this.category || !allCategories.hasOwnProperty(this.category)) {
          throw new Error("Invalid category");
      }
        
        const criteria =  snapshotApi.extractCriteria(snapshot, properties)
        const categoryProperties = getCategoryProperties(this.category as CategoryKeys);
        
        const {
          subscriberId,
          dataStoreMethods, 
          metadata, 
          endpointCategory,
          storeProps, 
          snapshotConfigData, 
          snapshotStoreConfigData, 
          snapshotContainer,
        } = snapshotConfigProps
        // const snapshotId = snapshotApi.getSnapshotId(snapshot, snapshotId);
        const snapshotContainer = snapshotApi.getSnapshotContainer<T, Meta, K>(snapshotId, storeId);
        
        const delegate = snapshotApi.getSnapshotContainer<T, Meta, K>(snapshotId, storeId);
        const config = snapshotApi.getSnapshotConfig<T, Meta, K>(
          id,
          snapshotId,
          criteria,
          this.category ? this.category : undefined,
          categoryProperties,
          subscriberId,
          delegate,
          convertedSnapshot,
          snapshotData, 
          this.callback, 
          dataStoreMethods, 
          metadata, 
          endpointCategory,
          storeProps, 
          snapshotConfigData, 
          snapshotStoreConfigData, 
          snapshotContainer,
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
        this.snapshotStore = new SnapshotStore<T, Meta, K>(
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


  // Define the handleEvent method
  handleEvent(eventId: string, eventData: Snapshot<T, Meta, K>): void {
    console.log(`Handling event with ID: ${eventId}`);

    // Logic to handle the event (e.g., creating or updating a snapshot)
    const snapshotId = eventId; // Assuming the eventId is used as the snapshotId
    const snapshotContent = this.createSnapshotContent(eventData); // Create snapshot content from event data

    // Check if a snapshot with the given ID already exists
    if (!this.data.has(snapshotId)) {
      const newSnapshot = {
        ...snapshotContent,
        id: snapshotId,
      };
      this.data.set(snapshotId, newSnapshot);
      console.log(`Created new snapshot with ID ${snapshotId}:`, newSnapshot);
    }

    // Notify listeners about the new snapshot
    this.notifyListeners(eventData);
  }

  // Method to create snapshot content from event data
  private createSnapshotContent(eventData: T): Snapshot<T, Meta, K> {
    return {
      // Convert eventData to the format required for a snapshot
      ...eventData,
      // Add any additional properties needed for the snapshot
    };
  }



  handleData(data: Snapshot<T, Meta, K>) {
    console.log("Handling data:", data);
    
    // Add or update the data in the dataStore
    if (data.id) {
      this.dataStore.set(data.id, data);
    } else {
      console.error("Data must have an 'id' property.");
    }

    // Notify all registered listeners about the new data
    this.notifyListeners(data);
  }

  // Method to add an event listener
  addListener(listener: (data: Snapshot<T, Meta, K>) => void) {
    this.eventListeners.push(listener);
  }

  // Method to handle various actions
  action(type: CalendarActionType, payload: CalendarActionPayload<T, Meta, K>): void {
    switch (type) {
      case 'ADD_EVENT': {
        const { event } = payload as AddEventPayload<T, Meta, K>;
        this.events.scheduled.push(event);
        console.log(`Event added: ${event.title}`);
        break;
      }
      case 'UPDATE_EVENT': {
        const { eventId, updatedEvent } = payload as UpdateEventPayload<T, Meta, K>;
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
      ? new SnapshotManagerOptions<T, Meta, K>().get() 
      : new SnapshotManagerOptions<T, Meta, K>({ /* your default options here */ }).get();
    
        
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
    // const config = storeConfig as unknown as SnapshotStoreConfig<T, Meta, K>;
    const operation: SnapshotOperation = {
      // Provide the required operation details
      operationType: SnapshotOperationType.FindSnapshot,
    };
    this.snapshotStore = new SnapshotStore<T, Meta, K>(storeId, name, version, schema, options, this.category, config, operation);
  }


  callback: (snapshot: Snapshot<T, Meta, K>) => void;
  setDocumentReleaseStatus: (id: number, eventId: number, status: string, isReleased: boolean) => void;
  updateDocumentReleaseStatus: (id: number, eventId: number, status: string, isReleased: boolean) => void;
  snapshotStore: SnapshotStore<T, Meta, K> = {} as SnapshotStore<T, Meta, K>;
  useRealtimeDataInstance: ReturnType<typeof useRealtimeData>;
  handleRealtimeUpdate: (
    storeId: number,
    documentId: number,
    eventId: number,
    userId: string,
    events: Record<string, CalendarEvent<T, Meta, K>[]>,
    snapshotStore: string | SnapshotStoreConfig<T, Meta, K> | null | undefined,
    properties: Array<keyof FilterState>

  ) => void;
  openCalendarSettingsPage: () => void;
  getSnapshotDataKey: (documentId: string | number, eventId: number, userId: string) => string;
  getData: (id: string) => Promise<Snapshot<T, Meta, K>> = (id: string) => {
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
  private convertDocumentToSnapshot(document: Document): Snapshot<T, Meta, K> {
   
    // Utility function to ensure documentData matches type T
    function castDocumentData<T extends Data>(documentData: any): T {
        return documentData as T;
      }

     
  // Create a snapshot object using the properties of Document
  const snapshot: Snapshot<T, Meta, K> = {
   
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

  addEvent(event: CalendarEvent<T, Meta, K>): void {
    this.events.scheduled.push(event);
    this.dispatch(addEventSuccess(event));
  }

  addEvents(events: CalendarEvent<T, Meta, K>[]): void {
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

  fetchEventsSuccess(events: CalendarEvent<T, Meta, K>[]): void {
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

  addEventSuccess(event: CalendarEvent<T, Meta, K>): void {
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
  events: Record<string, CalendarEvent<T, Meta, K>[]>
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
  Snapshot<BaseData, Meta, BaseData>[]
> => {
  // Replace this with your actual data fetching logic
  return [
    // Mock data
    {
      // Fill in with actual Snapshot data
      id: "snapshot1",
      data: {} as SnapshotWithCriteria<BaseData, Meta, BaseData>,
      criteria: {} as SnapshotWithCriteria<BaseData, Meta, BaseData>,
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
    } 
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
          } as SnapshotStore<
            SnapshotWithCriteria<BaseData>,
            SnapshotWithCriteria<BaseData>
          >,
        ],
      } as SnapshotStore<SnapshotWithCriteria<BaseData>, SnapshotWithCriteria<BaseData>>);
    }, 2000);
  });
};

// Example usage:
export const calendarEventRecords: Record<string, CalendarManagerStoreClass<Data, Meta, BaseData>[]> = {
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
      getData: async (id: string) => {
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

// Example usage:
export const eventRecords: Record<string, EventRecord<BaseData, Meta, BaseData>[]> = {
  "2024-02-08": [
    {

      record: {
        getState: function (): MobXRootState {
          throw new Error("Function not implemented.");
        },
        events: undefined,
        eventTitle: "",
        eventDescription: "",
        eventStatus: "",
        NOTIFICATION_MESSAGE: "",
        NOTIFICATION_MESSAGES: undefined,
        assignedEventStore: undefined,
        documentManager: undefined,
        eventListeners: [],
        notifyListeners: function (data: Snapshot<BaseData, Meta, BaseData>): void {
          throw new Error("Function not implemented.");
        },
        timestamp: undefined,
        handleEvent: function (eventId: string, eventData: BaseData): void {
          throw new Error("Function not implemented.");
        },
        createSnapshotContent: function (eventData: BaseData): Snapshot<BaseData, Meta, BaseData> {
          throw new Error("Function not implemented.");
        },
        handleData: function (data: Snapshot<BaseData, Meta, BaseData>): void {
          throw new Error("Function not implemented.");
        },
        addListener: function (listener: (data: Snapshot<BaseData, Meta, BaseData>) => void): void {
          throw new Error("Function not implemented.");
        },
        action: function (type: CalendarActionType, payload: CalendarActionPayload<BaseData, Meta, BaseData>): void {
          throw new Error("Function not implemented.");
        },
        initialize: function (storeId: number): Promise<void> {
          throw new Error("Function not implemented.");
        },
        callback: function (snapshot: Snapshot<BaseData, Meta, BaseData>): void {
          throw new Error("Function not implemented.");
        },
        setDocumentReleaseStatus: function (id: number, eventId: number, status: string, isReleased: boolean): void {
          throw new Error("Function not implemented.");
        },
        updateDocumentReleaseStatus: function (id: number, eventId: number, status: string, isReleased: boolean): void {
          throw new Error("Function not implemented.");
        },
        snapshotStore: undefined,
        useRealtimeDataInstance: undefined,
        handleRealtimeUpdate: function (storeId: number, documentId: number, eventId: number, userId: string, events: Record<string, CalendarEvent<BaseData, Meta, BaseData>[]>, snapshotStore: string | SnapshotStoreConfig<BaseData, Meta, BaseData> | null | undefined, properties: Array<keyof FilterState>): void {
          throw new Error("Function not implemented.");
        },
        openCalendarSettingsPage: function (): void {
          throw new Error("Function not implemented.");
        },
        getSnapshotDataKey: function (documentId: string | number, eventId: number, userId: string): string {
          throw new Error("Function not implemented.");
        },
        getData: function (id: string): Promise<Snapshot<BaseData, Meta, BaseData>> {
          throw new Error("Function not implemented.");
        },
        convertDocumentToSnapshot: function (document: Document): Snapshot<BaseData, Meta, BaseData> {
          throw new Error("Function not implemented.");
        },
        openScheduleEventModal: function (content: JSX.Element): void {
          throw new Error("Function not implemented.");
        },
        entities: undefined,
        category: undefined,
        updateEventDescription: function (eventId: string, description: string): void {
          throw new Error("Function not implemented.");
        },
        updateEventStatus: function (eventId: string, status: AllStatus): void {
          throw new Error("Function not implemented.");
        },
        updateEventDate: function (eventId: string, date: Date): void {
          throw new Error("Function not implemented.");
        },
        addEvent: function (event: CalendarEvent<BaseData, Meta, BaseData>): void {
          throw new Error("Function not implemented.");
        },
        addEvents: function (events: CalendarEvent<BaseData, Meta, BaseData>[]): void {
          throw new Error("Function not implemented.");
        },
        removeEvent: function (eventId: string): void {
          throw new Error("Function not implemented.");
        },
        removeEvents: function (eventIds: string[]): void {
          throw new Error("Function not implemented.");
        },
        reassignEvent: function (eventId: string, oldUserId: string, newUserId: string, newDate: Date, newStatus: AllStatus, reassignData: ReassignEventResponse[]): void {
          throw new Error("Function not implemented.");
        },
        completeAllEvents: function (): void {
          throw new Error("Function not implemented.");
        },
        fetchEventsRequest: function (): void {
          throw new Error("Function not implemented.");
        },
        fetchEventsSuccess: function (events: CalendarEvent<BaseData, Meta, BaseData>[]): void {
          throw new Error("Function not implemented.");
        },
        fetchEventsFailure: function (error: Error): void {
          throw new Error("Function not implemented.");
        },
        completeAllEventsSuccess: function (): void {
          throw new Error("Function not implemented.");
        },
        completeAllEventsFailure: function (error: Error): void {
          throw new Error("Function not implemented.");
        },
        addEventSuccess: function (event: CalendarEvent<BaseData, Meta, BaseData>): void {
          throw new Error("Function not implemented.");
        },
        setDynamicNotificationMessage: function (message: string): void {
          throw new Error("Function not implemented.");
        },
        updateEventTitle: function (title: string): void {
          throw new Error("Function not implemented.");
        }
      },
      callback: (snapshot: Snapshot<BaseData, Meta, BaseData>) => {},
      action: "",
      timestamp: new Date()
    //   id: "1",
    //   title: "Meeting",
    //   date: new Date("2024-02-08T09:00:00"),
    //   startDate: new Date(),
    //   endDate: new Date(),
    //   metadata: {} as StructuredMetadata,
    //   rsvpStatus: "notResponded",
    //   host: {} as Member,
    //   color: "",
    //   isImportant: false,
    //   teamMemberId: "0",
    //   status: StatusType.Pending,
    //   isCompleted: false,
    //   isActive: false,
    //   tags: [],
    //   priority: {} as PriorityTypeEnum.High,
    //   phase: null,
    //   participants: [],
    //   ideas: [],
    //   getSnapshotStoreData: async () => {
    //     return fetchSnapshotStoreData();
    //   },
    //   getData: async (id: string) => {
    //     return fetchSnapshotData();
    //   },

    //   analysisType: {} as AnalysisTypeEnum,
    //   analysisResults: [],
    //   videoData: {} as VideoData,
    //   content: "content",
    //   topics: [],
    //   highlights: [],
    //   files: [],
    //   options: getDefaultDocumentOptions(),
    },
    // Add more events for other dates as needed
  ],
  // Add more dates with corresponding events as needed
};


// Use CombinedEvents in SnapshotData
const snapshotData: SnapshotData<T, Meta, K> = {
  then: (callback: (newData: Snapshot<T, Meta, K>) => void) => {
    // Implement logic to handle the snapshot of data
    const newData: Snapshot<T, Meta, K> = {
      category: "calendarEvents",
      timestamp: new Date(),
      data: {} as Data, // Provide actual data here
      events: combinedEvents,
    };
    callback(newData);
  },
};

export const calendarEvent: CalendarEvent<T, Meta, K> = {} as CalendarEvent;
//

export const convertedData = convertEventsToData(events);
console.log(convertedData);

export { fetchEventsRequest, updateCallback, useCalendarManagerStore };
export default CalendarManagerStoreClass;
export type { CalendarEntities, CalendarEvent };
