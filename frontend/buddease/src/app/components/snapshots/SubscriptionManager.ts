import { Snapshot } from "@/app/components/snapshots";
import { Snapshots } from '@/app/components/snapshots/LocalStorageSnapshotStore';
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/configs/BaseConfig';

// 1. SUBSCRIPTION MANAGER (Handles subscription lifecycle)
interface SubscriptionManager<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
> {
  // Subscription lifecycle
  subscribe: (
    subscriptionDetails: {
      userId: string;
      snapshotId: string;
      subscriptionType: string;
      subscriptionDate: Date;
      subscriptionData?: any;
    },
    callback: (snapshot: Snapshot<T, K, Meta, ExcludedFields>) => void
  ) => string;

  unsubscribe: (
    unsubscribeDetails: {
      userId: string;
      snapshotId: string;
      unsubscribeType: string;
      unsubscribeDate: Date;
      unsubscribeReason: string;
      unsubscribeData: any;
    },
    event: string,
    callback: (snapshot: Snapshot<T, K, Meta, ExcludedFields>) => void
  ) => void;

  // Event listeners
  onSnapshot: (
    snapshotId: string,
    snapshot: Snapshot<T, K, Meta, ExcludedFields>,
    type: string,
    event: SnapshotEvent<T, K, Meta, ExcludedFields>,
    callback: (snapshot: Snapshot<T, K, Meta, ExcludedFields>) => void
  ) => void;

  onSnapshots: (
    snapshotId: string,
    snapshots: Snapshots<T, K, Meta, ExcludedFields>,
    type: string,
    event: SnapshotEvent<T, K, Meta, ExcludedFields>,
    callback: (snapshots: Snapshots<T, K, Meta, ExcludedFields>) => void
  ) => void;

  // Subscription queries
  getSubscribers: (
    snapshotId?: string,
    eventType?: string
  ) => SubscriberCollection<T, K, Meta, ExcludedFields>[];

  // Notification system
  notifySubscribers: (
    snapshotId: string,
    snapshot: Snapshot<T, K, Meta, ExcludedFields>,
    eventType?: string
  ) => void;

  // Properties
  events: CombinedEvents<T, K, Meta, ExcludedFields> | undefined;
  subscriberManagement?: SnapshotSubscriberManagement<T, K, Meta, ExcludedFields> | undefined;
}