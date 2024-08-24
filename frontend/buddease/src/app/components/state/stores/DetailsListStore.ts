// DetailsListStore.ts
import { Progress } from "@/app/components/models/tracker/ProgressBar";
import { FC } from "react";
import { makeAutoObservable } from "mobx";
import { BaseData, Data } from "../../models/data/Data";
import { Team } from "../../models/teams/Team";
import { Phase } from "../../phases/Phase";
import SnapshotStore from "../../snapshots/SnapshotStore";
import {
  NotificationTypeEnum,
  useNotification,
} from "../../support/NotificationContext";
import NOTIFICATION_MESSAGES from "../../support/NotificationMessages";

import { CommunicationActionTypes } from "../../community/CommunicationActions";
import { Attachment } from "../../documents/Attachment/attachment";
import { DocumentStatus } from "../../documents/types";
import { DataDetails } from "../../models/data/Data";
import {
  DataStatus,
  PriorityTypeEnum,
  ProductStatus,
  StatusType,
  TaskStatus,
  TeamStatus,
  TodoStatus,
} from "../../models/data/StatusType";
import { Member, TeamMember } from "../../models/teams/TeamMembers";
import { Tag } from "../../models/tracker/Tag";
import { Project } from "../../projects/Project";
import { AllTypes } from "../../typings/PropTypes";
import { DataAnalysisResult } from "../../projects/DataAnalysisPhase/DataAnalysisResult";
import { createSnapshotStoreOptions, snapshotType } from "../../typings/YourSpecificSnapshotType";
import { Snapshot, SnapshotUnion } from "../../snapshots/LocalStorageSnapshotStore";
import { CategoryProperties } from "@/app/pages/personas/ScenarioBuilder";
import { snapshotStoreConfig, SnapshotStoreConfig } from "../../snapshots/SnapshotStoreConfig";
import { AnalysisTypeEnum } from "../../projects/DataAnalysisPhase/AnalysisType";
import { SnapshotOperation, SnapshotOperationType } from "../../snapshots/SnapshotActions";
import { snapshot } from "../../snapshots/snapshot";
import * as snapshotApi from '@/app/api/SnapshotApi'
import { TagsRecord } from "../../snapshots";
const { notify } = useNotification();

// Union type of all status enums
export type AllStatus =
  | StatusType
  | TaskStatus
  | TodoStatus
  | DataStatus
  | TeamStatus
  | DocumentStatus
  | PriorityTypeEnum
  | ProductStatus;
// Define a generic interface for details
// isActive

interface DetailsItem<T extends SnapshotUnion> {
  _id?: string;
  id: string | number;
  title?: string;
  type?: AllTypes;
  status?: AllStatus;
  description?: string | null | undefined;
  startDate?: Date;
  endDate?: Date;
  updatedAt?: Date;
  Phase?: Phase | null;
  subtitle: string;
  author?: string;
  date?: Date;
  label?: string;
  value: string;
  phase?: Phase;
  collaborators?: Member[];
  tags?:  string[] | Tag[]
  analysisResults?: DataAnalysisResult[];
  tracker?: string;
  participants?: Member[];
  // Core properties...
}

interface DetailsItemExtended extends DataDetails{
  id: string | number;
  _id?: string;
  title?: string;
  name?: string;
  isRecurring?: boolean;
  type?: AllTypes; //todo verif we match types
  status?: AllStatus; // Use enums for status property
  participants?: Member[];
  description?: string | null | undefined;
  assignedProjects?: Project[];
  analysisType?: AnalysisTypeEnum | undefined;
  isVisible?: boolean;
  query?: string;
  reassignedProjects?: {
    project: Project;
    previousTeam: Team;
    reassignmentDate: Date;
  }[];
  progress?: Progress | null;
  startDate?: Date;
  dueDate?: Date | null | undefined;

  endDate?: Date;
  phase?: Phase | null;
  isActive?: boolean;
  tags?: TagsRecord | undefined
  subtitle?: string;
  date?: Date;
  author?: string;
  // data?: T; // Make the data property optional
  teamMembers?: TeamMember[];
  communication?: CommunicationActionTypes;
  label?: string;
  value?: string;
  reminders?: string[];
  importance?: string;
  location?: string;
  attendees?: Member[];
  attachments?: Attachment[];
  notes?: string[];
  setCurrentProject?: (project: Project) => void;
  setCurrentTeam?: (team: Team) => void;
  clearCurrentProject?: () => void;
}

export interface DetailsListStore<T extends BaseData, K extends BaseData> {
  details: Record<string, DetailsItemExtended[]>;
  detailsTitle: string;
  detailsDescription: string;
  detailsStatus:
    | TaskStatus.Pending
    | TaskStatus.InProgress
    | TaskStatus.Completed
    | TaskStatus.Tentative
    | TaskStatus.Confirmed
    | TaskStatus.Cancelled
    | TaskStatus.Scheduled
    | undefined;
  snapshotStore: SnapshotStore<T, K>;
  NOTIFICATION_MESSAGE: string;
  NOTIFICATION_MESSAGES: typeof NOTIFICATION_MESSAGES;
  updateDetailsTitle: (title: string, newTitle: string) => void;
  subscribe(callback: (snapshot: Snapshot<T, K>) => void): void;

  toggleDetails: (detailsId: string) => void;

  updateDetailsDescription: (id: string, description: string) => void;
  updateDetailsStatus: (
    status:
      | StatusType.InProgress
      | StatusType.Completed
      | StatusType.Tentative
      | StatusType.Confirmed
      | StatusType.Cancelled
      | StatusType.Scheduled
  ) => void;
  addDetails: (id: string, description: string) => void;
  addDetail: (newDetail: Data) => void;
  addDetailsItem: (detailsItem: DetailsItemExtended) => void;
  setDetails: (details: Record<string, DetailsItemExtended[]>) => void;
  removeDetails: (detailsId: string) => void;
  removeDetailsItems: (detailsIds: string[]) => void;
  setDynamicNotificationMessage: (message: string) => void;
}

class DetailsListStoreClass<T extends BaseData, K extends BaseData>
  implements DetailsListStore<T, K>
{
  details: Record<string, DetailsItemExtended[]> = {
    pending: [],
    inProgress: [],
    completed: [],
  };
  detailsTitle = "";
  detailsDescription = "";
  detailsStatus:
    | TaskStatus.Pending
    | TaskStatus.InProgress
    | TaskStatus.Completed
    | TaskStatus.Tentative
    | TaskStatus.Confirmed
    | TaskStatus.Cancelled
    | TaskStatus.Scheduled
    | undefined = undefined;
  snapshotStore!: SnapshotStore<T, K>;

  subscribe = (callback: (snapshot: Snapshot<T, K>) => void) => {};
  NOTIFICATION_MESSAGE = "";
  NOTIFICATION_MESSAGES = NOTIFICATION_MESSAGES;

  constructor() {
    makeAutoObservable(this);
    this.initSnapshotStore();
  }

  

  determineCategory(snapshot: Snapshot<T, K> | null | undefined): string {
    if (snapshot && snapshot.store) {
      return snapshot.store.toString();
    }
    return "";
  }

    // Updated initSnapshotStore method
    private async initSnapshotStore() {
      const initialState = null; // or undefined, depending on your default handling
      const snapshotConfig: SnapshotStoreConfig<SnapshotUnion<T, any>, K>[] = [];  // Example empty array

      // Ensure delegate is correctly typed as Snapshot<T, K>
      const delegateSnapshot: Snapshot<T, K> = {
        // Provide appropriate default values for the snapshot
        id: "", // Default or generate an ID
        store: null, // Initialize appropriately
        state: [], // Initialize state as needed
        category: "", // Default or computed category
        timestamp: new Date(), // Default timestamp
        message: "", // Default message
        eventRecords: {}, // Default event records
        // Add all other necessary properties with default values
      };

      const category = this.determineCategory(delegateSnapshot);

      await notify(
        "internal snapshot notifications",
        "Setting up snapshot details",
        NOTIFICATION_MESSAGES.Details.UPDATE_DETAILS_ITEM_SUCCESS,
        new Date(),
        NotificationTypeEnum.InvalidCredentials
      );

      const options = createSnapshotStoreOptions<T, K>({
        initialState,
        snapshotId: "", // Provide appropriate snapshotId
        category: category as unknown as CategoryProperties,
        dataStoreMethods: {
          // Provide appropriate dataStoreMethods
        }
      });



      const snapshotId: string | number | undefined = snapshot?.store?.snapshotId ?? undefined;
      const storeId = await snapshotApi.getSnapshotStoreId(Number(snapshotId));
      const config: SnapshotStoreConfig<SnapshotUnion<T>, K> = snapshotStoreConfig;
    
      const operation: SnapshotOperation = {
        // Provide the required operation details
        operationType: SnapshotOperationType.FindSnapshot
      };


      this.snapshotStore = new SnapshotStore<T, K>(storeId, options, config, operation);
    }

  updateDetailsTitle(id: string, newTitle: string): void {
    const details = this.details;

    // Assuming details[id] is an array of DetailsItem
    details.pending.forEach((item) => {
      if (item.id === id) {
        item.title = newTitle;
      }
    });

    details.inProgress.forEach((item) => {
      if (item.id === id) {
        item.title = newTitle;
      }
    });

    details.completed.forEach((item) => {
      if (item.id === id) {
        item.title = newTitle;
      }
    });

    this.setDetails(details);
  }

  toggleDetails(detailsId: string): void {
    const details = this.details;
    const status = this.detailsStatus;

    // Ensure detailsStatus is defined before using it as an index
    if (status === undefined) {
      console.error("Details status is undefined.");
      return;
    }

    const index = details[status].findIndex((item) => item.id === detailsId);

    if (index !== -1) {
      details[status].splice(index, 1);
    } else {
      details[status].push({
        _id: detailsId,
        id: detailsId,
        description: this.detailsDescription,
        title: this.detailsTitle,
        status: this.detailsStatus as
          | TaskStatus.Pending
          | TaskStatus.InProgress
          | TaskStatus.Completed,
        phase: {
          id: "",
          index: 0,
          name: "Phase Name",
          color: "#000000",
          status: "",
          createdAt: undefined,
          updatedAt: undefined,
          startDate: undefined,
          endDate: undefined,
          subPhases: [] as Phase[],
          component: {} as FC<any>,
          hooks: {
            onPhaseStart: [],
            onPhaseEnd: [],
            onPhaseUpdate: [],
            resetIdleTimeout: async () => {},
            isActive: false,
            progress: {
              id: "",
              name: "",
              label: "",
              color: "",
              max: 0,
              min: 0,
              value: 0,
              current: 0,
              percentage: 0,
              description: "",
              done: false,
            },
            condition: async () => false,
          },
          duration: 0,
        },
        data: {} as DetailsItemExtended["data"],
        isActive: false,
        type: "details",
        analysisResults: {} as DetailsItemExtended["analysisResults"],
        updatedAt: undefined,
      });
    }

    this.setDetails(details);
  }

  updateDetailsDescription(id: string, description: string): void {
    const details = this.details;

    // Assuming details[id] is an array of DetailsItem
    details.pending.forEach((item) => {
      if (item.id === id) {
        item.description = description;
      }
    });

    details.inProgress.forEach((item) => {
      if (item.id === id) {
        item.description = description;
      }
    });

    details.completed.forEach((item) => {
      if (item.id === id) {
        item.description = description;
      }
    });

    this.setDetails(details);
  }

  updateDetailsStatus(status: AllStatus): void {
    // Map StatusType values to TaskStatus values
    switch (status) {
      case StatusType.Pending:
        this.detailsStatus = TaskStatus.Pending;
        break;
      case StatusType.InProgress:
        this.detailsStatus = TaskStatus.InProgress;
        break;
      case StatusType.Completed:
        this.detailsStatus = TaskStatus.Completed;
        break;
      case StatusType.Tentative:
        // Handle Tentative status if needed
        this.detailsStatus = TaskStatus.Tentative;
        break;
      case StatusType.Confirmed:
        this.detailsStatus = TaskStatus.Confirmed;
        // Handle Confirmed status if needed
        break;
      case StatusType.Cancelled:
        this.detailsStatus = TaskStatus.Cancelled;
        break;
      case StatusType.Scheduled:
        this.detailsStatus = TaskStatus.Scheduled;
        break;
      default:
        this.detailsStatus = undefined;
        break;
    }
  }

  addDetailsItem(detailsItem: DetailsItemExtended): void {
    let status: AllStatus = detailsItem.status || TaskStatus.Pending;

    this.details = {
      ...this.details,
      [status]: [...(this.details[status] || []), detailsItem],
    };

    // Optionally, you can trigger notifications or perform other actions on success
    this.setDynamicNotificationMessage(
      NOTIFICATION_MESSAGES.OperationSuccess.DEFAULT
    );
  }

  addDetails(): void {
    // Ensure the title is not empty before adding an item
    if (this.detailsTitle.trim().length === 0) {
      console.error("Item title cannot be empty.");
      return;
    }

    const newDetailsItem: DetailsItemExtended = {
      id: Date.now().toString(),
      title: this.detailsTitle,
      status: TaskStatus.Pending,
      description: this.detailsDescription,
      // data: {} as Data,
      phase: {} as DetailsItemExtended["phase"],
      isActive: false,
      type: "details",
      _id: "",
      analysisResults: [],
      updatedAt: undefined,
    };

    this.addDetailsItem(newDetailsItem);

    // Reset input fields after adding an item
    this.detailsTitle = "";
    this.detailsDescription = "";
    this.detailsStatus = TaskStatus.Pending;
  }

  setDetails(details: Record<string, DetailsItemExtended[]>): void {
    this.details = details;
  }

  removeDetails(detailsId: string): void {
    const updatedDetails = { ...this.details };
    delete updatedDetails[detailsId];
    this.details = updatedDetails;
  }

  removeDetailsItems(detailsIds: string[]): void {
    const updatedDetails = { ...this.details };
    detailsIds.forEach((detailsId) => {
      delete updatedDetails[detailsId];
    });
    this.details = updatedDetails;
  }

  // Function to set a dynamic notification message
  setDynamicNotificationMessage = (message: string) => {
    this.setDynamicNotificationMessage(message);
  };

  addDetail(detail: Data): void {
    // Assuming 'detail' is a valid Data object to be added
    let status: AllStatus = detail.status || TaskStatus.Pending;

    // Ensure detail.id is not null or undefined before assigning
    const id: string = String(detail.id) ?? "";

    // Ensure detail.description is always a string or undefined
    const description: string = detail.description || ""; // Provide a default empty string if description is null or undefined
    const phase: Phase = detail.phase || ({} as Phase); // Provide a default empty object if phase is null or undefined

    // Create a copy of the current state of details
    const updatedDetails = { ...this.details };

    // Get the array associated with the current status or create a new empty array
    const statusArray = updatedDetails[status] || [];

    if (detail.title !== undefined) {
      // Add the new detail to the status array
      statusArray.push({
        _id: detail.title,
        id: id,
        title: detail.title,
        status: detail.status,
        description: description,
        phase: phase,
        type: "detail",
        isActive: false,
        analysisResults: [],
        updatedAt: undefined,
      });
    }
    // Update the details object with the new status array
    updatedDetails[status] = statusArray;

    // Set the updated details object to the class property
    this.details = updatedDetails;
  }
}

const useDetailsListStore = (): DetailsListStore => {
  return new DetailsListStoreClass();
};

export { useDetailsListStore };
export type { DetailsItem, DetailsItemExtended };
