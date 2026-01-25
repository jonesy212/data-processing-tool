// appTypes.ts
import { Post } from "@/core/components/community/DiscussionForumComponent";
import { Task } from "@/core/components/models/tasks/Task";
import type { Attachment } from '@/core/documents/attachment/Attachment';
import { Category } from '@/core/libraries/categories/generateCategoryProperties';
import { Member } from '@/core/models/members/Member';
import type { Snapshot } from '@/core/snapshots/Snapshot';
import SnapshotStore from "@/core/snapshots/SnapshotStore";
import type { SnapshotStoreConfig } from "@/core/snapshots/SnapshotStoreConfig";
import { Subscription } from '@/core/subscriptions/Subscription';

import type { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
    BaseDataEntity,
    DefaultExcludedFields,
    DefaultMeta
} from '@/core/config/BaseConfig';

interface CommunicationType<
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  id: string;
  title: string;
  timestamp: Date;
  subscriberId: string;
  category: symbol | string | Category | undefined;
  length: number;
  content: string;
  data: any; // Example, replace with actual data structure
  value: number;
  key: string;
  subscription: Subscription<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;
  config: any; // Example, replace with actual config type
  status: string;
  metadata: Record<string, any>;
  delegate: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]; // Example, replace with actual delegate type
  store: SnapshotStore<any> | null;
  state: Snapshot<any>[] | null;
  todoSnapshotId: string;
  initialState: Snapshot<any> | null;
}

interface CollaborationOption {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  iconColor: string;
  isActive: boolean;
  isPublic: boolean;
  isSystem: boolean;
  isDefault: boolean;
  isHidden: boolean;
  isHiddenInList: boolean;
  UserInterface: string[];
  DataVisualization: string[];
  Forms?: any; // Example, replace with actual forms type
  Analysis: string[];
  Communication: string[];
  TaskManagement: string[];
  Crypto: string[];
  brandName: string;
  brandLogo: string;
  brandColor: string;
  brandMessage: string;
}


interface CreationPhase<
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  id: string;
  phaseName: string;
  description: string;
  tasks: Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  startDate: Date;
  endDate: Date;
  status: "active" | "inactive" | "completed";
}

interface CryptoFeature {
  id: string;
  featureName: string;
  description: string;
  isEnabled: boolean;
  implementationDetails: string[];
}
interface CryptoAction {
  id: string;
  actionName: string;
  description: string;
  executeAction: () => void;
}

interface CryptoInformation {
  id: string;
  title: string;
  content: string;
  timestamp: Date;
}

interface CryptoCommunity<
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>  {
  id: string;
  name: string;
  description: string;
  members: number | Member<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  posts: Post[];
}

interface BlockchainCapability {
  id: string;
  capabilityName: string;
  description: string;
  features: string[];
}

export type {
    BlockchainCapability,
    CollaborationOption,
    CommunicationType,
    CreationPhase,
    CryptoAction,
    CryptoCommunity,
    CryptoFeature,
    CryptoInformation
};

