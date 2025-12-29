// useSubscription.tsx
import { SubscriptionActions, SubscriptionPayload } from "@/core/actions/SubscriptionActions";
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import { Attachment } from '@/core/documents/attachment/Attachment';
import { ModifiedDate } from "@/core/documents/DocType";
import type { Snapshot } from '@/core/snapshots/Snapshot';
import { SnapshotData } from "@/core/snapshots/SnapshotData";
import { Subscriber } from "@/core/subscribers/Subscriber";
import { fetchPortfolioUpdatesLastUpdated } from "@/utils/trading/TradingUtils";
import { LiveEvent } from "@refinedev/core";
import { useEffect, useState } from "react";
import { useDispatch } from 'react-redux';
;

interface UseSubscriptionOptions {
  channel: string;
  onLiveEvent: (event: LiveEvent) => void;
  enabled?: boolean;
}

const portfolioUpdatesLastUpdated = async (): Promise<number | ModifiedDate | null> => {
  try {
    const portfolioUpdatesLastUpdated = await fetchPortfolioUpdatesLastUpdated();
    return portfolioUpdatesLastUpdated;
  } catch (error) {
    console.error("Error fetching portfolio updates last updated timestamp:", error);
    return null;
  }
}; 

// Helper type to extract Snapshot properties
type SnapshotProperties<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
  [P in keyof Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>]: 
    Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[P];
};

const useSubscription = <
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>({
  channel,
  onLiveEvent,
  enabled = true,
}: UseSubscriptionOptions) => {
  const [subscribers, setSubscribers] = useState<Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>([]);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const dispatch = useDispatch();
  
  type UnsubscribePayload = {
    subscriberId: string;
    unsubscribeDetails: {
      userId: string;
      snapshotId: string;
      unsubscribeType: string;
      unsubscribeDate: Date;
      unsubscribeReason: string;
      unsubscribeData: any;
      snapshot?: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
    };
  };

  const subscribe = (subscriptionData: SubscriptionPayload<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {
    setIsSubscribed(true);
    dispatch(SubscriptionActions<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>().subscribe(subscriptionData));
  };

  const unsubscribe = (
    subscriberId: string,
    unsubscribeDetails: {
      userId: string;
      snapshotId: string;
      unsubscribeType: string;
      unsubscribeDate: Date;
      unsubscribeReason: string;
      unsubscribeData: any;
    },
    callback?: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void
  ) => {
    const updatedSubscribers = subscribers.filter(
      (subscriber) => subscriber.getSubscriberId() !== subscriberId
    );
    
    setIsSubscribed(false);
    setSubscribers(updatedSubscribers);

    const unsubscribePayload: UnsubscribePayload = {
      subscriberId,
      unsubscribeDetails: {
        ...unsubscribeDetails,
        snapshot: createSnapshotFromUnsubscribeDetails(unsubscribeDetails)
      }
    };

    dispatch(SubscriptionActions<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>().unsubscribe(unsubscribePayload));
  
    if (callback) {
      const snapshot = createSnapshotFromUnsubscribeDetails(unsubscribeDetails);
      callback(snapshot);
    }
  };

  const createSnapshotFromUnsubscribeDetails = (
    unsubscribeDetails: {
      userId: string;
      snapshotId: string;
      unsubscribeType: string;
      unsubscribeDate: Date;
      unsubscribeReason: string;
      unsubscribeData: any;
    }
  ): Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> => {
    const snapshotData = unsubscribeDetails.unsubscribeData as SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
    
    // Create base snapshot object
    const baseSnapshot: Partial<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> = {
      // Core snapshot identification
      snapshotId: unsubscribeDetails.snapshotId,
      snapshotData: snapshotData,
      
      // Data properties
      dataObject: snapshotData?.dataObject,
      deleted: snapshotData?.deleted || false,
      initialState: snapshotData?.initialState,
      isCore: snapshotData?.isCore || false,
      
      // Lifecycle handlers - only include if they exist and are functions
      ...(typeof snapshotData?.onInitialize === 'function' && { 
        onInitialize: snapshotData.onInitialize 
      }),
      ...(typeof snapshotData?.onError === 'function' && { 
        onError: snapshotData.onError 
      }),
      
      // Task management
      taskIdToAssign: snapshotData?.taskIdToAssign,
      
      // Schema and structure
      schema: snapshotData?.schema || {},
      currentCategory: snapshotData?.currentCategory || 'default',
      mappedSnapshotData: snapshotData?.mappedSnapshotData || {},
      
      // Storage and versioning
      storeId: snapshotData?.storeId || 'default',
      versionInfo: snapshotData?.versionInfo || null, // Use null instead of default object
      initializedState: snapshotData?.initializedState || false,
      snapshotContainer: snapshotData?.snapshotContainer || {},
      
      // Metadata and timestamps
      timestamp: new Date(),
      metadata: snapshotData?.metadata || {},
    };

    // Add config only if it exists in the Snapshot type
    // First check what properties the Snapshot type actually has
    if ('config' in baseSnapshot && snapshotData?.config) {
      // Handle config based on its type
      const configValue = snapshotData.config;
      if (configValue instanceof Promise) {
        (baseSnapshot as any).config = configValue;
      } else if (typeof configValue === 'function') {
        (baseSnapshot as any).config = (configValue as () => Promise<any>)();
      } else {
        (baseSnapshot as any).config = Promise.resolve(configValue);
      }
    }

    // Add initialConfig only if it exists in the Snapshot type
    if ('initialConfig' in baseSnapshot && snapshotData?.initialConfig) {
      (baseSnapshot as any).initialConfig = Promise.resolve(snapshotData.initialConfig);
    }

    // Return with type assertion, converting through unknown first
    return baseSnapshot as unknown as Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  };

  const handleLiveEvent = (event: LiveEvent) => {
    if (onLiveEvent) {
      onLiveEvent(event);
    }
    
    // Check if Subscriber has handleEvent method before calling it
    setSubscribers(prev => 
      prev.map(subscriber => {
        // Use type assertion to check if handleEvent exists
        const sub = subscriber as any;
        if (typeof sub.handleEvent === 'function') {
          return sub.handleEvent(event) || subscriber;
        }
        return subscriber;
      })
    );
  };

  const addSubscriber = (subscriber: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {
    setSubscribers(prev => [...prev, subscriber]);
  };

  const getSubscriber = (subscriberId: string): Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined => {
    return subscribers.find(subscriber => subscriber.getSubscriberId() === subscriberId);
  };

  const hasSubscriber = (subscriberId: string): boolean => {
    return subscribers.some(subscriber => subscriber.getSubscriberId() === subscriberId);
  };

  useEffect(() => {
    if (enabled) {
      dispatch(SubscriptionActions<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>().fetchInitialSubscriptions());
    }
  }, [enabled, dispatch]);

  return {
    subscribers,
    subscribe,
    unsubscribe,
    addSubscriber,
    getSubscriber,
    hasSubscriber,
    isSubscribed,
    handleLiveEvent,
    portfolioUpdatesLastUpdated
  };
};

export default useSubscription;