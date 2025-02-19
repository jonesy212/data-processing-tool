import { BaseData } from '@/app/components/models/data/Data';
import { Label } from "@/app/components/projects/branding/BrandingSettings";
import { createSnapshotInstance } from '@/app/components/snapshots/createSnapshotInstance';
import SnapshotStore from "@/app/components/snapshots/SnapshotStore";
import { User } from "@/app/components/users/User";
import { StructuredMetadata } from '@/app/configs/StructuredMetadata';
import { Message } from "@/app/generators/GenerateChatInterfaces";
import UniqueIDGenerator from "@/app/generators/GenerateUniqueIds";
import { ChatRoom } from "../calendar/CalendarSlice";
import { ContentItem } from "../cards/DummyCardLoader";
import { Sender } from "../communications/chat/Communication";
import { SnapshotManager } from "../hooks/useSnapshotManager";
import { Category } from "../libraries/categories/generateCategoryProperties";
import { NotificationType } from "../support/NotificationContext";
import { createMessage, MessageProps } from "../utils/createMessage";
import { Snapshot } from "./LocalStorageSnapshotStore";
import { SnapshotStoreConfig } from "./SnapshotStoreConfig";
import { SnapshotStoreProps } from "./useSnapshotStore";
import { useSecureUserId } from '../utils/useSecureUserId';
import { InitializedData } from './SnapshotStoreOptions';

interface SnapshotItem<
  T extends  BaseData<any>, 
  K extends T = T,
  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>,
  ExcExcludedFields extends keyof T = never
> extends Snapshot<T, K, Meta, ExcExcludedFields> {
  id: string;
  value: string | number | Snapshot<T, K, StructuredMetadata<T, K>, ExcExcludedFields> | null | undefined
  message?: (
    type: NotificationType, 
    content: string, 
    additionalData?: string, 
    userId?: number, 
    sender?: Sender, 
    channel?: ChatRoom
  ) => Message
  itemContent?: ContentItem; 
  data: InitializedData<T> | undefined;
  user?: User;
  categories?: Category[];
  label: Label | undefined;
}


class SnapshotList<
  T extends  BaseData<any>, 
  K extends T = T, 
  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>> {
  private snapshots: SnapshotItem<T, K>[];
  private id: string;
  public category: string;
  constructor() {
    this.id = UniqueIDGenerator.generateSnapshoItemID(Date.now().toString());
    this.snapshots = [];
    this.category = "";
  }

  private sortSnapshotsBy(attribute: keyof SnapshotItem<T, K>) {
    this.snapshots.sort((a, b) => {
      if (a[attribute] && b[attribute]) {
        return a[attribute].localeCompare(b[attribute]); // Assuming the attribute is a string
      }
      return 0; // Handle undefined values
    });
  }

  sortSnapshotByDate() {
    this.snapshots.sort((a, b) => {
      const aTimestamp = a.value && typeof a.value === 'object' && 'timestamp' in a.value
        ? a.value.timestamp instanceof Date ? a.value.timestamp.getTime() : 0
        : 0;
      const bTimestamp = b.value && typeof b.value === 'object' && 'timestamp' in b.value
        ? b.value.timestamp instanceof Date ? b.value.timestamp.getTime() : 0
        : 0;
      return aTimestamp - bTimestamp;
    });
  }
  sort() {
    this.snapshots.sort((a, b) => {
      const aTimestamp = a.value && typeof a.value === 'object' && 'timestamp' in a.value
      ? a.value.timestamp instanceof Date ? a.value.timestamp.getTime() : 0
      : 0;
    const bTimestamp = b.value && typeof b.value === 'object' && 'timestamp' in b.value
      ? b.value.timestamp instanceof Date ? b.value.timestamp.getTime() : 0
      : 0;
    return aTimestamp - bTimestamp;
    });
  }
  sortByDate() {
    this.sortSnapshotByDate();
  }

  filterByCategories(categories: Category[]) {
    // Filter snapshots by categories
    return this.snapshots.filter((snapshot) => {
      return categories.every((category) =>
        snapshot.categories?.includes(category)
      );
    });
  }

  getSnapshotList(snapshots: SnapshotItem<T, K>[]) {
    return snapshots;
  }


  getSnapshot(index: number): SnapshotItem<T, K> | undefined {
    return this.snapshots[index];
  }

  getSnapshots(): SnapshotItem<T, K>[] {
    return this.snapshots;
  }

  sortSnapshotItems() {
    this.snapshots.sort((a, b) => {
      const aTimestamp = a.value && typeof a.value === 'object' && 'timestamp' in a.value
      ? a.value.timestamp instanceof Date ? a.value.timestamp.getTime() : 0
      : 0;
    const bTimestamp = b.value && typeof b.value === 'object' && 'timestamp' in b.value
      ? b.value.timestamp instanceof Date ? b.value.timestamp.getTime() : 0
      : 0;
    return aTimestamp - bTimestamp;
    });
  }

  
  sortSnapshotsByUser() {
    this.snapshots.sort((a, b) => {
      if (a.user && b.user) {
        return a.user.username.localeCompare(b.user.username);  // Use the string property for sorting
      }
      return 0;  // Handle cases where `user` might be undefined
    });
  }

  sortSnapshotsByAlphabeticalOrder() {
    this.snapshots.sort((a, b) => {
      if (a.label && b.label) {
        return a.label.text.localeCompare(b.label.text);  // Use the string property for sorting
      }
      return 0;  // Handle cases where `label` might be undefined
    });
  }

  sortSnapshotsByTags() {
    this.snapshots.sort((a, b) => {
      const aTags = (a.value && typeof a.value === 'object' && 'tags' in a.value && Array.isArray(a.value.tags)) ? a.value.tags : [];
      const bTags = (b.value && typeof b.value === 'object' && 'tags' in b.value && Array.isArray(b.value.tags)) ? b.value.tags : [];
      return aTags.join(",").localeCompare(bTags.join(","));
    });
  }

  // Methods to manipulate snapshot items
  addSnapshot(snapshot: SnapshotItem<T, K>) {
    snapshot.id = UniqueIDGenerator.generateSnapshoItemID(this.id);
    this.snapshots.push(snapshot);
  }

  fetchSnaphostById(id: string): SnapshotItem<T, K> | undefined {
    return this.snapshots.find((snapshot) => snapshot.id === id);
  }

  removeSnapshot(snapshotToRemove: string) {
    // Find the index of the snapshot with the specified ID
    const index = this.snapshots.findIndex(
      (snapshot) => snapshot.id === snapshotToRemove
    );

    // If the snapshot is found, remove it from the array
    if (index !== -1) {
      this.snapshots.splice(index, 1);
    }
  }

  // Implementing the Iterable interface
  [Symbol.iterator]() {
    let index = 0;
    const snapshots = this.snapshots;

    return {
      next(): IteratorResult<SnapshotItem<T, K>> {
        if (index < snapshots.length) {
          const value = snapshots[index++];
          return { value, done: false };
        } else {
          return { value: undefined, done: true };
        }
      },
    };
  }

  toArray(): SnapshotItem<T, K>[] {
    return this.snapshots;
  }
  
  // Other methods as needed
}



const createSnapshotItem = <T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
  snapshotId: string | null,
  data: T,
  category: symbol | string | Category | undefined,
  snapshotStore: SnapshotStore<T, K> | null,
  snapshotStoreConfig: SnapshotStoreConfig<T, K> | null,
  snapshotManager: SnapshotManager<T, K> | null,  // Add snapshotManager as a parameter
  storeProps?: SnapshotStoreProps<T, K> & MessageProps // Combine store and message props
): SnapshotItem<T, K> => {
  
  const baseMeta = new Map<string, Snapshot<T, K>>();

  // Ensure that all arguments are passed
  const baseSnapshot = createSnapshotInstance(
    data,              // baseData
    baseMeta,          // baseMeta
    snapshotId,        // snapshotId
    category,          // category
    snapshotStore,     // snapshotStore
    snapshotManager,   // snapshotManager (pass this argument)
    snapshotStoreConfig, // snapshotStoreConfig (pass this argument)
    storeProps         // storeProps (optional)
  );

  const userId = useSecureUserId.toString();
  if(!storeProps){
    throw new Error("storeProps is undefined");
  }

  const {     
    type,
    content,
    additionalData,
    sender,
    channel, 
  } = storeProps

  const message = createMessage(
    type,
    content,
    additionalData,
    Number(userId),
    sender,
    channel,
 )
  
  // Extend baseSnapshot with additional properties for SnapshotItem
  const snapshotItem: SnapshotItem<T, K> = {
    ...baseSnapshot, // Spread the baseSnapshot properties
    message: (type, content, additionalData, userId, sender, channel) => 
      createMessage(type, content, additionalData, userId, sender, channel),
      itemContent: undefined, // Add additional fields specific to SnapshotItem
    data, // This could be adjusted based on specific requirements
  };

  return snapshotItem;
};


export default SnapshotList;
export { createSnapshotItem };
export type { SnapshotItem };

