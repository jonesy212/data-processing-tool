// DetailsListStore.ts
import { makeAutoObservable } from "mobx";
import { CommunicationActionTypes } from "../../community/CommunicationActions";
import { Data } from "../../models/data/Data";
import { TeamMember } from "../../models/teams/TeamMembers";
import { Phase } from "../../phases/Phase";
import NOTIFICATION_MESSAGES from "../../support/NotificationMessages";
import SnapshotStore, { Snapshot, SnapshotStoreConfig } from "./SnapshotStore";

// Define a generic interface for details
interface DetailsItem<T> {
  id: string;
  title: string;
  status: "pending" | "inProgress" | "completed";
  description?: string;
  phase: Phase
  data?: T; 
  teamMembers?: TeamMember[];
  communication?: CommunicationActionTypes
}

export interface DetailsListStore {
  details: Record<string, DetailsItem<Data>[]> 
  detailsTitle: string;
  detailsDescription: string;
  detailsStatus: "pending" | "inProgress" | "completed" | undefined;
  snapshotStore: SnapshotStore<Snapshot<Data>>
  NOTIFICATION_MESSAGE: string;
  NOTIFICATION_MESSAGES: typeof NOTIFICATION_MESSAGES;
  updateDetailsTitle: (title: string, newTitle: string) => void;

  toggleDetails: (detailsId: string) => void;

  updateDetailsDescription: (id: string, description: string) => void;
  updateDetailsStatus: (
    status: "pending" | "inProgress" | "completed" | undefined
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
  detailsStatus: "pending" | "inProgress" | "completed" | undefined = undefined;
  snapshotStore: SnapshotStore<Snapshot<Data>> =
    new SnapshotStore<Snapshot<Data>>(
      {} as SnapshotStoreConfig<Snapshot<Data>>
    );
  
  NOTIFICATION_MESSAGE = "";
  NOTIFICATION_MESSAGES = NOTIFICATION_MESSAGES;

  constructor() {
    makeAutoObservable(this);
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
        id: detailsId,
        description: this.detailsDescription,
        title: this.detailsTitle,
        status: this.detailsStatus as "pending" | "inProgress" | "completed",
        phase: {} as DetailsItem<Data>["phase"],
        data: {} as DetailsItem<Data>["data"]
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
    status: "pending" | "inProgress" | "completed" | undefined
  ): void {
    this.detailsStatus = status;
  }

  addDetailsItem(detailsItem: DetailsItem<Data>): void {
    const status: "pending" | "inProgress" | "completed" | undefined =
      detailsItem.status || "pending";

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
      status: "pending",
      description: this.detailsDescription,
      data: {} as Data,
      phase: {} as DetailsItem<Data>["phase"]
    };

    this.addDetailsItem(newDetailsItem);

    // Reset input fields after adding an item
    this.detailsTitle = "";
    this.detailsDescription = "";
    this.detailsStatus = "pending";
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
    const status: "pending"
      | "inProgress" | "completed"
      | undefined = detail.status || "pending";

    // Ensure detail.id is not null or undefined before assigning
    const id: string = String(detail.id) ?? "";

    // Ensure detail.description is always a string or undefined
    const description: string | undefined = typeof detail.description === 'string' ? detail.description : undefined;

    // Create a copy of the current state of details
    const updatedDetails = { ...this.details };

    // Get the array associated with the current status or create a new empty array
    const statusArray = updatedDetails[status] || [];

    // Add the new detail to the status array
    statusArray.push({
      id: id,
      title: detail.title,
      status: detail.status,
      description: description,
      phase: detail.phase,
      data: detail,
    });

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

