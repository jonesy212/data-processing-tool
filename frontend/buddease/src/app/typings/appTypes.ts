import { Subscription } from "react-redux";
import { Post } from "../components/community/DiscussionForumComponent";
import { Task } from "../components/models/tasks/Task";
import { Member } from "../components/models/teams/TeamMembers";
import { Snapshot } from "../components/snapshots/LocalStorageSnapshotStore";
import { SnapshotStoreConfig } from "../components/snapshots/SnapshotConfig";
import SnapshotStore from "../components/snapshots/SnapshotStore";

interface CommunicationType {
  id: string;
  title: string;
  timestamp: Date;
  subscriberId: string;
  category: string | Category;
  length: number;
  content: string;
  data: any; // Example, replace with actual data structure
  value: number;
  key: string;
  subscription: Subscription | null;
  config: any; // Example, replace with actual config type
  status: string;
  metadata: Record<string, any>;
  delegate: SnapshotStoreConfig<Snapshot<any>, any>[]; // Example, replace with actual delegate type
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
interface CreationPhase {
  id: string;
  phaseName: string;
  description: string;
  tasks: Task[];
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

interface CryptoCommunity {
  id: string;
  name: string;
  description: string;
  members: number | Member[];
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
    CryptoInformation,
    Task
};

