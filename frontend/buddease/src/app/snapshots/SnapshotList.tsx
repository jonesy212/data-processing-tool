// SnapshotList.tsx
// SnapshotList.ts
import { Label } from "@/app/branding/BrandingSettings";
import { ContentItem } from "@/app/cards/DummyCardLoader";
import { ChatRoom } from "@/app/communications/ChatRoom";
import { Sender } from "@/app/components/communications/CommunicationPage";
import { SharedIdentifiers } from "@/app/documents/RelatedProps";
import { NotificationType } from '@/app/features/support/UnifiedNotificationTypes';
import { Message } from "@/app/generators/GenerateChatInterfaces";
import { createLatestVersion } from "@/app/versions/createLatestVersion";


import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { Attachment } from '@/app/documents/attachment/Attachment';
import UniqueIDGenerator from "@/app/generators/GenerateUniqueIds";
import { useSecureUserId } from '@/app/hooks/useSecureUserId';
import { SnapshotManager } from "@/app/hooks/useSnapshotManager";
import { Category } from "@/app/libraries/categories/generateCategoryProperties";
import { Data } from "@/app/models/data/Data";
import { createSnapshot } from '@/app/snapshots/createSnapshot';
import type { Snapshot } from '@/app/snapshots/Snapshot';
import SnapshotStore from "@/app/snapshots/SnapshotStore";
import { SnapshotStoreConfig } from "@/app/snapshots/SnapshotStoreConfig";
import { SnapshotStoreProps } from "@/app/snapshots/SnapshotStoreProps";
import { User } from "@/app/users/User";
import { createMessage, MessageProps } from "@/utils/web3/createMessage";

interface SnapshotItem<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  SharedIdentifiers<T, K> {
  id: string | number | undefined;
  message?: (
    type: NotificationType, 
    content: string, 
    additionalData?: string, 
    userId?: number, 
    sender?: Sender, 
    channel?: ChatRoom
  ) => Message<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  itemContent?: ContentItem; 
  data: Data<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null | undefined;
  user?: User<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  categories?: Category[];
  label?: string | Label | Record<string, string> | null
  key: string 
}


const { latestVersion = createLatestVersion(), ...rest } = (data as Record<string, any>) || {};

type LabelLike = string | Label | Record<string, string>;

function isLabel(obj: LabelLike): obj is Label {
  return typeof obj === "object" && obj !== null && "text" in obj;
}

class SnapshotList<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  private snapshots: SnapshotItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  private id: string;
  public category: string;
  constructor() {
    this.id = UniqueIDGenerator.generateSnapshoItemID(Date.now().toString());
    this.snapshots = [];
    this.category = "";
  }


  private getTimestamp(snapshot: SnapshotItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): number {
    // Access timestamp from the snapshot itself, not from a 'value' property
    if (snapshot.timestamp instanceof Date) {
      return snapshot.timestamp.getTime();
    } else if (typeof snapshot.timestamp === 'string') {
      return new Date(snapshot.timestamp).getTime();
    } else if (typeof snapshot.timestamp === 'number') {
      return snapshot.timestamp;
    }
    return 0;
  }

  private getTags(snapshot: SnapshotItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): string[] {
    // Access tags directly from snapshot
    if (Array.isArray(snapshot.tags)) {
      return snapshot.tags;
    } else if (snapshot.tags && typeof snapshot.tags === 'object') {
      return Object.keys(snapshot.tags);
    }
    return [];
  }

  private sortSnapshotsBy(attribute: keyof SnapshotItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) {
    this.snapshots.sort((a, b) => {
      const aValue = a[attribute];
      const bValue = b[attribute];
      
      if (aValue && bValue && typeof aValue === 'string' && typeof bValue === 'string') {
        return aValue.localeCompare(bValue);
      }
      return 0;
    });
  }

  sort() {
    this.sortSnapshotByDate();
  }


  sortSnapshotByDate() {
    this.snapshots.sort((a, b) => {
      return this.getTimestamp(a) - this.getTimestamp(b);
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

  getSnapshotList(snapshots: SnapshotItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]) {
    return snapshots;
  }


  getSnapshot(index: number): SnapshotItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined {
    return this.snapshots[index];
  }

  getSnapshots(): SnapshotItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] {
    return this.snapshots;
  }

  sortSnapshotItems() {
    this.sortSnapshotByDate(); // Reuse existing method
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
      const labelA = a.label;
      const labelB = b.label;

      if (labelA && labelB) {
        if (isLabel(labelA) && isLabel(labelB)) {
          return labelA.text.localeCompare(labelB.text);
        }

        if (typeof labelA === "string" && typeof labelB === "string") {
          return labelA.localeCompare(labelB);
        }

        // optional: handle Record<string, string>
        if (
          typeof labelA === "object" &&
          typeof labelB === "object" &&
          !Array.isArray(labelA) &&
          !Array.isArray(labelB)
        ) {
          const firstA = Object.values(labelA)[0];
          const firstB = Object.values(labelB)[0];
          if (typeof firstA === "string" && typeof firstB === "string") {
            return firstA.localeCompare(firstB);
          }
        }
      }

      return 0; // fallback
    });
  }

  sortSnapshotsByTags() {
    this.snapshots.sort((a, b) => {
      const aTags = this.getTags(a);
      const bTags = this.getTags(b);
      return aTags.join(",").localeCompare(bTags.join(","));
    });
  }

  // Methods to manipulate snapshot items
  addSnapshot(snapshot: SnapshotItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) {
    snapshot.id = UniqueIDGenerator.generateSnapshoItemID(this.id);
    this.snapshots.push(snapshot);
  }

  fetchSnaphostById(id: string): SnapshotItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined {
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
      next(): IteratorResult<SnapshotItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> {
        if (index < snapshots.length) {
          const value = snapshots[index++];
          return { value, done: false };
        } else {
          return { value: undefined, done: true };
        }
      },
    };
  }

  toArray(): SnapshotItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] {
    return this.snapshots;
  }
  
  // Other methods as needed
}



const createSnapshotItem = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  snapshotId: string | null,
  data: T,
  snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null,
  snapshotStoreConfig: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null,
  snapshotManager: SnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null,  // Add snapshotManager as a parameter
  category?: Category,  
  storeProps?: SnapshotStoreProps<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> & MessageProps // Combine store and message props
): SnapshotItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> => {
  
  const baseMeta = new Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>();

  // Ensure that all arguments are passed
  const baseSnapshot = createSnapshot(
    data,              // baseData
    baseMeta,          // baseMeta
    snapshotId,        // snapshotId
    snapshotStore,     // snapshotStore
    snapshotManager,   // snapshotManager (pass this argument)
    snapshotStoreConfig, // snapshotStoreConfig (pass this argument)
    category,          // category
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
    Number(userId),
    sender,
    channel,
    additionalData
 )
  
 
    // Extend baseSnapshot with additional properties for SnapshotItem
    const snapshotItem: SnapshotItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
      ...baseSnapshot, // must already have deleted, initialState, etc.
      ...snapshotStoreConfig,
      // required SnapshotItem props
      // Provide proper required fields
        id: baseSnapshot.id ?? UniqueIDGenerator.generateID("snapshot", "base", NotificationTypeEnum.Default),
        key: baseSnapshot.key ?? `key-${Date.now()}`,

      message: (type, content, additionalData, userId, sender, channel) =>
      createMessage(type, content, additionalData, userId, sender, channel),

      itemContent: undefined,
      data, // ensure `data` matches InitializedData<T,K,Meta,ExcludedFields>

      user: undefined,
      categories: [],
      label: undefined,
      latestVersion,
      initialConfig,
      mappedSnapshotData,
    }

  return snapshotItem;
};


export default SnapshotList;
export { createSnapshotItem };
export type { SnapshotItem };

