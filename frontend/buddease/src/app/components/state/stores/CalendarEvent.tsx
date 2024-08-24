// CalendarEvent.tsx
import React from "react";
import * as snapshotApi from "@/app/api/SnapshotApi"
import { endpoints } from "@/app/api/ApiEndpoints";
import { StructuredMetadata } from "@/app/configs/StructuredMetadata";
import { updateCallback } from "@/app/pages/blog/UpdateCallbackUtils";
import useModalFunctions from "@/app/pages/dashboards/ModalFunctions";
import ScheduleEventModal from "@/app/ts/ScheduleEventModal";
import { PayloadAction } from "@reduxjs/toolkit";
import { makeAutoObservable } from "mobx";
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

import { Snapshot,SnapshotUnion } from "../../snapshots/LocalStorageSnapshotStore";
import {
  useSnapshotManager,

} from "../../hooks/useSnapshotManager";
import { SnapshotWithCriteria} from "../../snapshots/SnapshotWithCriteria";
import { MobXRootState } from "./RootStores";
import {SnapshotStoreConfig } from "../../snapshots/SnapshotStoreConfig";
import {
  SnapshotOperation,
  SnapshotOperationType,
} from "../../snapshots/SnapshotActions";
import { combinedEvents } from "../../event/Event";
import { snapshot, SnapshotContainer, snapshotContainer, SnapshotData } from "../../snapshots";
import {CalendarEvent} from "../../calendar/CalendarEvent";
import SnapshotManagerOptions from "../../snapshots/SnapshotManagerOptions";
import { getSnapshotConfig, getSnapshotId } from "@/app/api/SnapshotApi";
import { EventActions } from "../../actions/EventActions";
import { useDispatch } from "react-redux";
import { Category } from "../../libraries/categories/generateCategoryProperties";
import { DocumentStore } from "./DocumentStore";


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
    reassignData: ReassignEventResponse[]
  ) => void;
  completeAllEvents: () => void;
  setDynamicNotificationMessage: (message: string) => void;
}


export interface CalendarManagerStore<
  T extends Data = BaseData,
  K extends Data = BaseData
> {
  // dispatch: (action: PayloadAction<any, string, any, any>) => void;
  openScheduleEventModal: (content: JSX.Element) => void;
  openCalendarSettingsPage: () => void;
    getData: (id: string) => Promise<Snapshot<T, K>>
  updateDocumentReleaseStatus: (eventId: string, released: boolean) => void;
  getState: () => MobXRootState; // Add getState method

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
    eventId: string,
    userId: string,
    events: Record<string, CalendarEvent<T, K>[]>,
    snapshotStore: 
    string 
    | SnapshotStoreConfig<SnapshotUnion<T>, K> 
    | null
    | undefined
  ) => void;
  getSnapshotDataKey: (
    eventId: string,
    userId: string) => void
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
  
  constructor(category: Category, documentManager: DocumentStore) {
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
    this.handleRealtimeUpdate = async (
      eventId: string,
      userId: string,
      events: Record<string, CalendarEvent<T, K>[]>,
      snapshotStore:
        | string
        | SnapshotStoreConfig<SnapshotUnion<T>, K>
        | null
        | undefined
    ) => {
      try {
        const key = this.getSnapshotDataKey(eventId, userId) as SnapshotData<T, K>;
        const snapshotManager = await useSnapshotManager<T, K>(storeId);
        const snapshotId = await snapshotManager?.snapshotStore?.getSnapshotId(key);

        if (snapshotId === undefined || isNaN(parseInt(snapshotId, 10))) {
          console.error("Invalid snapshot ID:", snapshotId);
          return;
        }

        const snapshotIdNumber = parseInt(snapshotId, 10);
        const config = await snapshotApi.getSnapshotConfig<T, K>(
          snapshotIdNumber,
          snapshotContainer,
          criteria
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
        ) as EventStore<T, K>;
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

  async initialize(storeId: number) {
    const options = await useSnapshotManager(storeId) 
      ? new SnapshotManagerOptions<T, K>().get() 
      : new SnapshotManagerOptions<T, K>({ /* your default options here */ }).get();
    
        
    const criteria = await snapshotApi.getSnapshotCriteria(
      snapshotContainer as unknown as SnapshotContainer<Data, Data>, 
      snapshot
    );
    const snapshotId = await snapshotApi.getSnapshotId(criteria);
    const config = await snapshotApi.getSnapshotStoreConfig()
    const storeConfig = getSnapshotConfig(
      Number(snapshotId),
      snapshotContainer as unknown as SnapshotContainer<Data, Data>, 
      criteria
    )

    // const config = storeConfig as unknown as SnapshotStoreConfig<T, K>;
    const operation: SnapshotOperation = {
      // Provide the required operation details
      operationType: SnapshotOperationType.FindSnapshot,
    };



    this.snapshotStore = new SnapshotStore<T, K>(storeId, options, this.category, config, operation);
  }


  callback: (snapshot: Snapshot<T, K>) => void;
  setDocumentReleaseStatus: (eventId: string, released: boolean) => void;
  updateDocumentReleaseStatus: (eventId: string, released: boolean) => void;
  snapshotStore: SnapshotStore<T, K>;
  useRealtimeDataInstance: ReturnType<typeof useRealtimeData>;
  handleRealtimeUpdate: (
    eventId: string,
    userId: string,
    events: Record<string, CalendarEvent<T, K>[]>,
    snapshotStore: string | SnapshotStoreConfig<SnapshotUnion<T>, K> | null | undefined
  ) => void;
  openCalendarSettingsPage: () => void;
  getSnapshotDataKey: (eventId: string, userId: string) => void;
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
    // Implement actual conversion logic here
    // For now, assuming direct casting is appropriate
    return document as Snapshot<T, K>;
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

  reassignEvent(eventId: string, newDate: Date, newStatus: AllStatus): void {
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
    tags: [],
    phase: null,
    then: implementThen,
    analysisType: {} as AnalysisTypeEnum,
    analysisResults: [],
    videoUrl: "",
    videoThumbnail: "",
    videoDuration: 0,
    videoData: {} as VideoData<T, K>,
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
