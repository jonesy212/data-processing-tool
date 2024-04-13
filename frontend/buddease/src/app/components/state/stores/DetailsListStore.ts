// DetailsListStore.ts
import { makeAutoObservable } from "mobx";
import { Data } from "../../models/data/Data";
import { Team } from "../../models/teams/Team";
import { Phase } from "../../phases/Phase";
import SnapshotStore, { Snapshot } from "../../snapshots/SnapshotStore";
import {
  NotificationType,
  NotificationTypeEnum,
  useNotification,
} from "../../support/NotificationContext";
import NOTIFICATION_MESSAGES from "../../support/NotificationMessages";

import { CommunicationActionTypes } from "../../community/CommunicationActions";
import { DocumentStatus } from "../../documents/types";
import { DataDetails } from "../../models/data/Data";
import { DataStatus, PriorityStatus, ProductStatus, StatusType, TaskStatus, TeamStatus, TodoStatus } from "../../models/data/StatusType";
import { Member, TeamMember } from "../../models/teams/TeamMembers";
import { Progress } from "../../models/tracker/ProgressBar";
import { Project } from "../../projects/Project";
import SnapshotStoreConfig from "../../snapshots/SnapshotConfig";
import { AllTypes } from "../../typings/PropTypes";
import { Attachment } from "../../documents/Attachment/attachment";
const { notify } = useNotification();




// Union type of all status enums
export type AllStatus = StatusType
  | TaskStatus
  | TodoStatus
  | DataStatus
  | TeamStatus
  | DocumentStatus
  | PriorityStatus
  | ProductStatus
// Define a generic interface for details
interface DetailsItem<T> extends DataDetails {
  _id?: string;
  id: string;
  title?: string;
  name?: string;
  isRecurring?: boolean;
  type?: AllTypes; //todo verif we match types
  status?: AllStatus // Use enums for status property
  participants?: Member[];
  description?: string | null | undefined;
  assignedProjects?: Project[];
  isVisible?: boolean;
  reassignedProjects?: {
    project: Project;
    previousTeam: Team;
    reassignmentDate: Date;
  }[];
  progress?: Progress | null;
  startDate?: Date;
  dueDate?: Date,
  
  endDate?: Date;
  phase?: Phase | null;
  isActive?: boolean;
  tags?: string[];
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

export interface DetailsListStore {
  details: Record<string, DetailsItem<Data>[]>;
  detailsTitle: string;
  detailsDescription: string;
  detailsStatus:
    | TaskStatus.Pending
    | TaskStatus.InProgress
    | TaskStatus.Completed
    | undefined;
  snapshotStore: SnapshotStore<Snapshot<Data>>;
  NOTIFICATION_MESSAGE: string;
  NOTIFICATION_MESSAGES: typeof NOTIFICATION_MESSAGES;
  updateDetailsTitle: (title: string, newTitle: string) => void;
  subscribe(callback: (snapshot: Snapshot<Data>) => void): void;

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
  addDetailsItem: (detailsItem: DetailsItem<Data>) => void;
  setDetails: (details: Record<string, DetailsItem<Data>[]>) => void;
  removeDetails: (detailsId: string) => void;
  removeDetailsItems: (detailsIds: string[]) => void;
  setDynamicNotificationMessage: (message: string) => void;
}

class DetailsListStoreClass implements DetailsListStore {
  details: Record<string, DetailsItem<Data>[]> = {
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
    | undefined = undefined;
  snapshotStore!: SnapshotStore<Snapshot<Data>>; // Definite assignment assertion

  subscribe = (callback: (snapshot: Snapshot<Data>) => void) => { };
  NOTIFICATION_MESSAGE = "";
  NOTIFICATION_MESSAGES = NOTIFICATION_MESSAGES;

  constructor() {
    makeAutoObservable(this);
    this.initSnapshotStore();
  }

  private async initSnapshotStore() {
    await notify(
      "interna snapshot notifications",
      "Setting up snapshot details",
      NOTIFICATION_MESSAGES.Details.UPDATE_DETAILS_ITEM_SUCCESS,
      new Date(),
      NotificationTypeEnum.InvalidCredentials
    );

    this.snapshotStore = new SnapshotStore<Snapshot<Data>>(
      {} as SnapshotStoreConfig<SnapshotStore<Snapshot<Data>>>,
      (message: string, content: any, date: Date, type: NotificationType) => {
        notify("", message, content, date, type);
      }
    );
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
        phase: {} as DetailsItem<Data>["phase"],
        data: {} as DetailsItem<Data>["data"],
        isActive: false,
        type: "details",
        analysisResults: {} as DetailsItem<Data>["analysisResults"],
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

  updateDetailsStatus(
    status:
      | StatusType.Pending
      | StatusType.InProgress
      | StatusType.Completed
      | StatusType.Tentative
      | StatusType.Confirmed
      | StatusType.Cancelled
      | StatusType.Scheduled
  ): void {
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
        break;
      case StatusType.Confirmed:
        // Handle Confirmed status if needed
        break;
      case StatusType.Cancelled:
        // Handle Cancelled status if needed
        break;
      case StatusType.Scheduled:
        // Handle Scheduled status if needed
        break;
      default:
        this.detailsStatus = undefined;
        break;
    }
    
  }
  

  addDetailsItem(detailsItem: DetailsItem<Data>): void {
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

    const newDetailsItem: DetailsItem<Data> = {
      id: Date.now().toString(),
      title: this.detailsTitle,
      status: TaskStatus.Pending,
      description: this.detailsDescription,
      // data: {} as Data,
      phase: {} as DetailsItem<Data>["phase"],
      isActive: false,
      type: "details",
      _id: "",
      analysisResults: []
    };

    this.addDetailsItem(newDetailsItem);

    // Reset input fields after adding an item
    this.detailsTitle = "";
    this.detailsDescription = "";
    this.detailsStatus = TaskStatus.Pending;
  }

  setDetails(details: Record<string, DetailsItem<Data>[]>): void {
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
        analysisResults: {} as DetailsItem<Data>["analysisResults"]
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
export type { DetailsItem };

