// DetailsListStore.ts
import { makeAutoObservable } from "mobx";
import { Phase } from "../../phases/Phase";
import NOTIFICATION_MESSAGES from "../../support/NotificationMessages";
import SnapshotStore, { SnapshotStoreConfig } from "./SnapshotStore";

export interface DetailsItem {
  id: string;
  title: string;
  status: "pending" | "inProgress" | "completed";
  description: string;
  phase: Phase;
  startDate: Date;
  endDate: Date;
  // Add more properties as needed
}

export interface DetailsListStore {
  details: Record<string, DetailsItem[]>;
  detailsTitle: string;
  detailsDescription: string;
  detailsStatus: "pending" | "inProgress" | "completed" | undefined;
  snapshotStore: SnapshotStore<Record<string, DetailsItem[]>>;
  NOTIFICATION_MESSAGE: string;
  NOTIFICATION_MESSAGES: typeof NOTIFICATION_MESSAGES;
  updateDetailsTitle: (title: string, newTitle: string) => void;

  toggleDetails: (detailsId: string) => void;

  updateDetailsDescription: (id: string, description: string) => void;
  updateDetailsStatus: (
    status: "pending" | "inProgress" | "completed" | undefined
  ) => void;
  addDetails: () => void;
  addDetailsItem: (detailsItem: DetailsItem) => void;
  setDetails: (details: Record<string, DetailsItem[]>) => void;
  removeDetails: (detailsId: string) => void;
  removeDetailsItems: (detailsIds: string[]) => void;
  setDynamicNotificationMessage: (message: string) => void;
}

class DetailsListStoreClass implements DetailsListStore {
  details: Record<string, DetailsItem[]> = {
    pending: [],
    inProgress: [],
    completed: [],
  };
  detailsTitle = "";
  detailsDescription = "";
  detailsStatus: "pending" | "inProgress" | "completed" | undefined = undefined;
  snapshotStore: SnapshotStore<Record<string, DetailsItem[]>> =
    new SnapshotStore<Record<string, DetailsItem[]>>(
      {} as SnapshotStoreConfig<Record<string, DetailsItem[]>>
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
        phase: {} as Phase,
        startDate: new Date,
        endDate: new Date,
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

  addDetailsItem(detailsItem: DetailsItem): void {
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

    const newDetailsItem: DetailsItem = {
      id: Date.now().toString(),
      title: this.detailsTitle,
      status: "pending",
      description: this.detailsDescription,
      phase: {} as Phase,
      startDate: new Date,
      endDate: new Date,
    };

    this.addDetailsItem(newDetailsItem);

    // Reset input fields after adding an item
    this.detailsTitle = "";
    this.detailsDescription = "";
    this.detailsStatus = "pending";
  }

  setDetails(details: Record<string, DetailsItem[]>): void {
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

  // Implement the rest of the methods and properties
}

const useDetailsListStore = (): DetailsListStore => {
  return new DetailsListStoreClass();
};

export { useDetailsListStore };
