// useSnapshotSubscriptions.ts
// hooks/subscriptions/useSnapshotSubscriptions.ts
import { SubscriberCollection } from '@/app/subscribers/SubscriberCollection';
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/config/BaseConfig';
import { Snapshot } from '@/app/snapshots/Snapshpshot';
import { useCallback, useEffect, useRef } from 'react';

interface SubscriptionManager<  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  subscribe: (
    subscriptionDetails: {
      userId: string;
      snapshotId: string;
      subscriptionType: string;
      subscriptionDate: Date;
      subscriptionData?: any;
    },
    callback: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void
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
    callback: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void
  ) => void;

  getSubscribers: (
    snapshotId?: string,
    eventType?: string
  ) => SubscriberCollection<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
}

export const useSnapshotSubscriptions = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
>() => {
  const subscriptionManagerRef = useRef<SubscriptionManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null>(null);
  const activeSubscriptionsRef = useRef<Map<string, Set<Function>>>(new Map());

  // Initialize subscription manager
  const initializeSubscriptions = useCallback(() => {
    if (subscriptionManagerRef.current) return subscriptionManagerRef.current;

    const manager: SubscriptionManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
      subscribe: (subscriptionDetails, callback) => {
        const subscriptionId = `${subscriptionDetails.userId}-${subscriptionDetails.snapshotId}-${Date.now()}`;
        
        if (!activeSubscriptionsRef.current.has(subscriptionDetails.snapshotId)) {
          activeSubscriptionsRef.current.set(subscriptionDetails.snapshotId, new Set());
        }
        
        activeSubscriptionsRef.current.get(subscriptionDetails.snapshotId)!.add(callback);
        
        console.log(`Subscription created: ${subscriptionId}`);
        return subscriptionId;
      },

      unsubscribe: (unsubscribeDetails, event, callback) => {
        const subscriptions = activeSubscriptionsRef.current.get(unsubscribeDetails.snapshotId);
        if (subscriptions) {
          subscriptions.delete(callback);
          if (subscriptions.size === 0) {
            activeSubscriptionsRef.current.delete(unsubscribeDetails.snapshotId);
          }
        }
        console.log(`Unsubscribed from snapshot: ${unsubscribeDetails.snapshotId}`);
      },

      getSubscribers: (snapshotId?: string, eventType?: string) => {
        if (snapshotId) {
          const callbacks = activeSubscriptionsRef.current.get(snapshotId);
          return callbacks ? Array.from(callbacks).map(cb => ({ callback: cb } as any)) : [];
        }
        
        // Return all subscribers across all snapshots
        const allSubscribers: any[] = [];
        activeSubscriptionsRef.current.forEach((callbacks, snapId) => {
          callbacks.forEach(callback => {
            allSubscribers.push({ snapshotId: snapId, callback });
          });
        });
        return allSubscribers;
      }
    };

    subscriptionManagerRef.current = manager;
    return manager;
  }, []);

  // Subscribe to snapshot changes
  const subscribe = useCallback((
    snapshotId: string,
    callback: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void,
    userId: string = 'default-user'
  ) => {
    const manager = initializeSubscriptions();
    return manager.subscribe(
      {
        userId,
        snapshotId,
        subscriptionType: 'snapshot-update',
        subscriptionDate: new Date()
      },
      callback
    );
  }, [initializeSubscriptions]);

  // Unsubscribe from snapshot changes
  const unsubscribe = useCallback((
    snapshotId: string,
    callback: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void,
    userId: string = 'default-user'
  ) => {
    const manager = initializeSubscriptions();
    manager.unsubscribe(
      {
        userId,
        snapshotId,
        unsubscribeType: 'manual',
        unsubscribeDate: new Date(),
        unsubscribeReason: 'user-initiated',
        unsubscribeData: {}
      },
      'snapshot-update',
      callback
    );
  }, [initializeSubscriptions]);

  // Get all subscribers for a snapshot
  const getSubscribers = useCallback((snapshotId?: string) => {
    const manager = initializeSubscriptions();
    return manager.getSubscribers(snapshotId);
  }, [initializeSubscriptions]);

  // Notify all subscribers of a snapshot change
  const notifySubscribers = useCallback((
    snapshotId: string,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ) => {
    const subscriptions = activeSubscriptionsRef.current.get(snapshotId);
    if (subscriptions) {
      subscriptions.forEach(callback => {
        try {
          callback(snapshot);
        } catch (error) {
          console.error('Error notifying subscriber:', error);
        }
      });
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Cleanup all subscriptions
      activeSubscriptionsRef.current.clear();
    };
  }, []);

  return {
    subscribe,
    unsubscribe,
    getSubscribers,
    notifySubscribers,
    initialize: initializeSubscriptions
  };
};